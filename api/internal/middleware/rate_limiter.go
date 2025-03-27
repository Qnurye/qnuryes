package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/qnury/comment-api/pkg/utils"
)

func RateLimiter(redisClient *redis.Client) fiber.Handler {
	limit := 60
	window := 60 // 秒

	return func(c *fiber.Ctx) error {
		if redisClient == nil {
			return c.Next()
		}

		identifier := utils.GetClientIP(c)
		key := fmt.Sprintf("rate_limit:%s", identifier)

		allowed, err := utils.CheckRateLimit(key, limit, window)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "速率限制检查失败",
			})
		}

		if !allowed {
			c.Set("X-RateLimit-Limit", utils.IntToString(limit))
			c.Set("X-RateLimit-Window", utils.IntToString(window))
			c.Set("X-RateLimit-Reset", utils.IntToString(window))

			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "请求过于频繁，请稍后再试",
			})
		}

		return c.Next()
	}
}

func checkRateLimit(ctx context.Context, redisClient *redis.Client, key string, limit int, window int) (bool, error) {
	now := time.Now().Unix()
	windowStart := now - int64(window)

	redisClient.ZRemRangeByScore(ctx, key, "0", fmt.Sprintf("%d", windowStart))

	count, err := redisClient.ZCard(ctx, key).Result()
	if err != nil {
		return false, err
	}

	if count >= int64(limit) {
		return false, nil
	}

	redisClient.ZAdd(ctx, key, &redis.Z{
		Score:  float64(now),
		Member: fmt.Sprintf("%d", now),
	})

	redisClient.Expire(ctx, key, time.Duration(window)*time.Second)

	return true, nil
}
