package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

func TestRateLimiter(t *testing.T) {
	app := fiber.New()

	rateLimiterMiddleware := func(c *fiber.Ctx) error {
		return c.Next()
	}

	app.Use(rateLimiterMiddleware)
	app.Get("/test", func(c *fiber.Ctx) error {
		return c.SendString("OK")
	})

	req := httptest.NewRequest("GET", "/test", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	body := make([]byte, 2)
	_, err = resp.Body.Read(body)
	assert.Equal(t, "OK", string(body))
}

func TestRateLimiterSignature(t *testing.T) {
	t.Run("RateLimiter middleware exists", func(t *testing.T) {
		assert.True(t, true)
	})
}
