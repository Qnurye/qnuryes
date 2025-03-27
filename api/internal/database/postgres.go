package database

import (
	"fmt"
	"os"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func InitPostgres() (*sqlx.DB, error) {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "comments_db")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, err
	}

	// 测试连接
	if err := db.Ping(); err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	return db, nil
}

// CreateTables 创建数据库表
func CreateTables(db *sqlx.DB) error {
	commentsTable := `
	CREATE TABLE IF NOT EXISTS comments (
		id SERIAL PRIMARY KEY,
		post_id VARCHAR(255) NOT NULL,
		parent_id INTEGER REFERENCES comments(id),
		author_name VARCHAR(100) NOT NULL,
		author_email VARCHAR(255),
		author_ip VARCHAR(45) NOT NULL,
		content TEXT NOT NULL,
		country_code VARCHAR(10),
		likes INTEGER DEFAULT 0,
		status VARCHAR(20) DEFAULT 'approved',
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	);

	CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
	CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
	CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
	`

	likesTable := `
	CREATE TABLE IF NOT EXISTS comment_likes (
		id SERIAL PRIMARY KEY,
		comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
		user_identifier VARCHAR(255) NOT NULL,
		created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
		UNIQUE(comment_id, user_identifier)
	);

	CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
	`

	if _, err := db.Exec(commentsTable); err != nil {
		return err
	}

	if _, err := db.Exec(likesTable); err != nil {
		return err
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
