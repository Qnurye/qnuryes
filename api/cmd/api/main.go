package main

import (
	"errors"
	"fmt"
	"github.com/go-redis/redis/v8"
	"github.com/jmoiron/sqlx"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/qnury/comment-api/internal/database"
	"github.com/qnury/comment-api/internal/handlers"
	"github.com/qnury/comment-api/internal/middleware"
	"github.com/qnury/comment-api/internal/services"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("警告: 未找到.env文件，使用环境变量")
	}

	db, err := database.InitPostgres()
	if err != nil {
		log.Fatalf("无法连接到数据库: %v", err)
	}
	defer func(db *sqlx.DB) {
		err := db.Close()
		if err != nil {
			log.Fatalf("无法关闭数据库连接: %v", err)
		}
	}(db)

	redisClient, err := database.InitRedis()
	if err != nil {
		log.Fatalf("无法连接到Redis: %v", err)
	}
	defer func(redisClient *redis.Client) {
		err := redisClient.Close()
		if err != nil {
			log.Fatalf("无法关闭Redis连接: %v", err)
		}
	}(redisClient)

	geoipService, err := services.NewGeoIPService()
	if err != nil {
		log.Printf("警告: 无法初始化GeoIP服务: %v", err)
		log.Println("将使用默认国家代码")
	} else {
		defer func(geoipService *services.GeoIPService) {
			err := geoipService.Close()
			if err != nil {
				log.Fatalf("无法关闭GeoIP服务: %v", err)
			}
		}(geoipService)
	}

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError

			var e *fiber.Error
			if errors.As(err, &e) {
				code = e.Code
			}

			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
	}))

	api := app.Group("/api")

	commentHandler := handlers.NewCommentHandler(db, redisClient, geoipService)
	commentRoutes := api.Group("/comments")
	commentRoutes.Get("/:postId", commentHandler.GetCommentsByPostID)
	commentRoutes.Post("/", middleware.RateLimiter(redisClient), commentHandler.CreateComment)
	commentRoutes.Get("/detail/:id", commentHandler.GetCommentByID)
	commentRoutes.Post("/:id/like", middleware.RateLimiter(redisClient), commentHandler.LikeComment)
	commentRoutes.Delete("/:id/like", middleware.RateLimiter(redisClient), commentHandler.UnlikeComment)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("服务器启动在 http://localhost:%s", port)
	if err := app.Listen(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("无法启动服务器: %v", err)
	}
}
