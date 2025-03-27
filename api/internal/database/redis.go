package database

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
)

func InitRedis() (*redis.Client, error) {
	redisAddr := getEnv("REDIS_ADDR", "localhost:6379")
	redisPassword := getEnv("REDIS_PASSWORD", "")
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))

	client := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		DB:       redisDB,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := client.Ping(ctx).Result()
	if err != nil {
		return nil, fmt.Errorf("无法连接到Redis: %v", err)
	}

	log.Println("成功连接到Redis")
	return client, nil
}

func IsRateLimited(client *redis.Client, key string, limit int, window int) (bool, error) {
	ctx := context.Background()
	now := time.Now().Unix()
	windowStart := now - int64(window)

	// 移除窗口外的记录
	client.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))

	// 获取当前窗口内的请求数
	count, err := client.ZCard(ctx, key).Result()
	if err != nil {
		return false, err
	}

	// 如果请求数超过限制，则拒绝请求
	if count >= int64(limit) {
		return true, nil
	}

	// 添加当前请求到有序集合
	client.ZAdd(ctx, key, &redis.Z{
		Score:  float64(now),
		Member: fmt.Sprintf("%d", now),
	})

	client.Expire(ctx, key, time.Duration(window)*time.Second)
	return false, nil
}
