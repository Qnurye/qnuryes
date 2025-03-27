package services_test

import (
	"net"
	"os"
	"path/filepath"
	"testing"

	"github.com/qnury/comment-api/internal/services"
	"github.com/stretchr/testify/assert"
)

func TestGeoIPService(t *testing.T) {
	dbPath := filepath.Join("data", "GeoLite2-Country.mmdb")
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		t.Skipf("测试数据库文件 %s 不存在", dbPath)
	}

	// 创建GeoIP服务
	service, err := services.NewGeoIPService()
	assert.NoError(t, err)
	assert.NotNil(t, service)
	defer func(service *services.GeoIPService) {
		err := service.Close()
		if err != nil {
			t.Errorf("关闭GeoIP服务失败: %v", err)
		}
	}(service)

	testCases := []struct {
		ip       string
		expected string
	}{
		{"8.8.8.8", "US"},         // Google DNS (美国)
		{"114.114.114.114", "CN"}, // 114DNS (中国)
		{"invalid-ip", "Mars"},      // 无效IP
	}

	for _, tc := range testCases {
		countryCode := service.GetCountryCode(tc.ip)
		if net.ParseIP(tc.ip) != nil {
			assert.NotEqual(t, "Mars", countryCode, "对于有效IP %s 应该返回有效的国家代码", tc.ip)
		} else {
			assert.Equal(t, "Mars", countryCode, "对于无效IP %s 应该返回 Mars", tc.ip)
		}
	}
}
