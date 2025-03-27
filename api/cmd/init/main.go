package main

import (
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	"github.com/qnury/comment-api/internal/database"
	"log"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("无法加载.env文件: %v", err)
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

	if err := database.CreateTables(db); err != nil {
		log.Fatalf("无法创建数据库表: %v", err)
	}
	log.Println("数据库表已创建")

	log.Println("初始化完成")
}
