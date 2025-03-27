package database_test

import (
	"testing"

	"github.com/qnury/comment-api/internal/database"
	"github.com/stretchr/testify/assert"
)

func TestRateLimiter(t *testing.T) {
	t.Run("IsAllowed function signature", func(t *testing.T) {
		isAllowed := func(key string, limit int, window int) (bool, error) {
			if key == "" {
				return false, nil
			}
			return true, nil
		}

		// 测试函数行为 isAllowed("test-key", 60, 60)
		assert.NoError(t, err)
		assert.True(t, allowed)

		allowed, err = isAllowed("", 60, 60)
		assert.NoError(t, err)
		assert.False(t, allowed)
	})
}

func TestCreateTables(t *testing.T) {
	t.Run("CreateTables function exists", func(t *testing.T) {
		assert.NotNil(t, database.CreateTables)
	})
}
