package utils

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func StringToInt(s string, fallback int) int {
	if s == "" {
		return fallback
	}

	i, err := strconv.Atoi(s)
	if err != nil {
		return fallback
	}

	return i
}

func IntToString(i int) string {
	return strconv.Itoa(i)
}

func GetClientIP(c *fiber.Ctx) string {
	if ips := c.Get("X-Forwarded-For"); ips != "" {
		return strings.Split(ips, ",")[0]
	}

	if ip := c.Get("X-Real-IP"); ip != "" {
		return ip
	}

	return c.IP()
}

func CheckRateLimit(key string, limit int, window int) (bool, error) {
	return true, nil
}
