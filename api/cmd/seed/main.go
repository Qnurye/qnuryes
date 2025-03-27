package main

import (
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"math/rand"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/qnury/comment-api/internal/services"
)

func generateRandomIP() string {
	return fmt.Sprintf("%d.%d.%d.%d", rand.Intn(256), rand.Intn(256), rand.Intn(256), rand.Intn(256))
}

func generateRandomTime() time.Time {
	now := time.Now()
	randomDuration := time.Duration(rand.Intn(30*24)) * time.Hour
	return now.Add(-randomDuration)
}

func main() {

	if err := godotenv.Load(); err != nil {
		log.Fatalf("无法加载.env文件: %v", err)
	}

	db, err := sqlx.Connect("postgres",
		"host=localhost port=5432 user=admin password=qnuryes_pwd dbname=qnuryes sslmode=disable")
	if err != nil {
		log.Fatalf("无法连接到数据库: %v", err)
	}
	defer func(db *sqlx.DB) {
		err := db.Close()
		if err != nil {
			log.Fatalf("无法关闭数据库连接: %v", err)
		}
	}(db)

	createTables(db)

	geoipService, err := services.NewGeoIPService()
	if err != nil {
		log.Printf("无法初始化GeoIP服务: %v", err)
		log.Println("将使用默认国家代码")
	}
	defer func(geoipService *services.GeoIPService) {
		err := geoipService.Close()
		if err != nil {
			log.Printf("无法关闭GeoIP服务: %v", err)
		}
	}(geoipService)

	postID := "test"

	// 创建顶级评论
	topLevelComments := []struct {
		authorName  string
		authorEmail string
		content     string
		ip          string
	}{
		{"Jack", "jack@gmail.com", "Temporibus quas voluptatem hic rerum ut illo laudantium.", "203.0.113.1"},
		{"Tom", "tom@gmail.com", "Temporibus quas voluptatem hic rerum ut illo laudantium. Et praesentium non architecto nobis cum ipsum ut officiis. Voluptas corporis delectus voluptatum. Dolore voluptas id cumque velit possimus aut laborum beatae. Occaecati ullam vero voluptatum reprehenderit inventore.", "203.0.113.2"},
		{"Anonymous", "anonymous@example.com", "Temporibus quas voluptatem hic rerum ut illo laudantium.", "203.0.113.3"},
		{"Anonymous", "anonymous2@example.com", "Temporibus quas voluptatem hic rerum ut illo laudantium.", "203.0.113.4"},
		{"Anonymous", "anonymous3@example.com", "Temporibus quas voluptatem hic rerum ut illo laudantium.", "203.0.113.5"},
	}

	topLevelCommentIDs := make([]int64, 0, len(topLevelComments))

	for _, comment := range topLevelComments {
		countryCode := "XX" // 默认未知国家
		if geoipService != nil {
			countryCode = geoipService.GetCountryCode(comment.ip)
		}

		createdAt := generateRandomTime()

		var commentID int64
		err := db.QueryRow(`
			INSERT INTO comments (post_id, author_name, author_email, author_ip, content, country_code, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id
		`, postID, comment.authorName, comment.authorEmail, comment.ip, comment.content, countryCode, "approved", createdAt, createdAt).Scan(&commentID)

		if err != nil {
			log.Printf("创建评论失败: %v", err)
			continue
		}

		topLevelCommentIDs = append(topLevelCommentIDs, commentID)

		likes := rand.Intn(30)
		if likes > 0 {
			// 更新点赞数
			_, err = db.Exec(`UPDATE comments SET likes = $1 WHERE id = $2`, likes, commentID)
			if err != nil {
				log.Printf("更新点赞数失败: %v", err)
			}

			for i := 0; i < likes; i++ {
				likeIP := generateRandomIP()
				likeTime := generateRandomTime()
				if likeTime.Before(createdAt) {
					likeTime = createdAt.Add(time.Duration(rand.Intn(24)) * time.Hour)
				}

				_, err = db.Exec(`
					INSERT INTO comment_likes (comment_id, user_identifier, created_at)
					VALUES ($1, $2, $3)
				`, commentID, likeIP, likeTime)

				if err != nil {
					log.Printf("创建点赞记录失败: %v", err)
				}
			}
		}
	}

	if len(topLevelCommentIDs) >= 2 {
		parentID := topLevelCommentIDs[1]

		replyIP := "203.0.113.6"
		countryCode := "JP" // 默认日本
		if geoipService != nil {
			countryCode = geoipService.GetCountryCode(replyIP)
		}

		createdAt := generateRandomTime()

		_, err = db.Exec(`
			INSERT INTO comments (post_id, parent_id, author_name, author_email, author_ip, content, country_code, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`, postID, parentID, "Edison", "edison@gmail.com", replyIP, "Molestias velit dignissimos quas accusamus ut iusto in.", countryCode, "approved", createdAt, createdAt)

		if err != nil {
			log.Printf("创建回复失败: %v", err)
		}
	}

	log.Println("测试数据创建成功！")
}

func createTables(db *sqlx.DB) {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS comments (
			id SERIAL PRIMARY KEY,
			post_id TEXT NOT NULL,
			parent_id BIGINT REFERENCES comments(id),
			author_name TEXT NOT NULL,
			author_email TEXT,
			author_ip TEXT NOT NULL,
			content TEXT NOT NULL,
			country_code CHAR(2) NOT NULL,
			likes INT DEFAULT 0,
			status TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		)
	`)
	if err != nil {
		log.Fatalf("创建评论表失败: %v", err)
	}

	// 创建评论点赞表
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS comment_likes (
			id SERIAL PRIMARY KEY,
			comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
			user_identifier TEXT NOT NULL,
			created_at TIMESTAMP NOT NULL,
			UNIQUE(comment_id, user_identifier)
		)
	`)
	if err != nil {
		log.Fatalf("创建评论点赞表失败: %v", err)
	}

	// 创建索引
	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)`)
	if err != nil {
		log.Printf("创建索引失败: %v", err)
	}

	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id)`)
	if err != nil {
		log.Printf("创建索引失败: %v", err)
	}

	_, err = db.Exec(`CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id)`)
	if err != nil {
		log.Printf("创建索引失败: %v", err)
	}
}
