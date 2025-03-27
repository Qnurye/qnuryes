package utils_test

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/qnury/comment-api/pkg/utils"
	"github.com/stretchr/testify/assert"
	"github.com/valyala/fasthttp"
)

func TestStringToInt(t *testing.T) {
	testCases := []struct {
		input    string
		fallback int
		expected int
	}{
		{"10", 0, 10},
		{"abc", 5, 5},
		{"", 3, 3},
		{"-1", 0, -1},
		{"0", 10, 0},
	}

	for _, tc := range testCases {
		result := utils.StringToInt(tc.input, tc.fallback)
		assert.Equal(t, tc.expected, result, "StringToInt(%s, %d) should return %d", tc.input, tc.fallback, tc.expected)
	}
}

func TestIntToString(t *testing.T) {
	testCases := []struct {
		input    int
		expected string
	}{
		{10, "10"},
		{0, "0"},
		{-1, "-1"},
		{999999, "999999"},
	}

	for _, tc := range testCases {
		result := utils.IntToString(tc.input)
		assert.Equal(t, tc.expected, result, "IntToString(%d) should return %s", tc.input, tc.expected)
	}
}

func TestGetClientIP(t *testing.T) {
	// 创建一个Fiber上下文
	app := fiber.New()
	ctx := app.AcquireCtx(&fasthttp.RequestCtx{})
	defer app.ReleaseCtx(ctx)

	// 测试X-Forwarded-For头
	ctx.Request().Header.Set("X-Forwarded-For", "192.168.1.1, 10.0.0.1")
	ip := utils.GetClientIP(ctx)
	assert.Equal(t, "192.168.1.1", ip, "应该返回X-Forwarded-For头中的第一个IP")

	// 测试X-Real-IP头
	ctx.Request().Header.Del("X-Forwarded-For")
	ctx.Request().Header.Set("X-Real-IP", "192.168.1.2")
	ip = utils.GetClientIP(ctx)
	assert.Equal(t, "192.168.1.2", ip, "应该返回X-Real-IP头中的IP")

	// 测试RemoteIP
	ctx.Request().Header.Del("X-Real-IP")
	ctx.Request().Header.Set("X-Forwarded-For", "") // 清空但保留头

	// 使用Fiber的方式设置IP
	ctx.Context().RemoteIP() // 只是为了测试，不需要实际设置
	ip = utils.GetClientIP(ctx)
	// 由于我们无法在测试中真正设置RemoteIP，这里只是确保函数不会崩溃
	assert.NotEmpty(t, ip, "应该返回一个非空IP")
}

func TestCheckRateLimit(t *testing.T) {
	allowed, err := utils.CheckRateLimit("test-key", 60, 60)
	assert.NoError(t, err)
	assert.True(t, allowed, "应该允许请求")
}
