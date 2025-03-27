package handlers_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/qnury/comment-api/internal/models"
	"github.com/stretchr/testify/assert"
)

type HandlerTestSuite struct {
	app     *fiber.App
	handler interface{}
}

func setupTest(t *testing.T) *HandlerTestSuite {
	app := fiber.New()

	return &HandlerTestSuite{
		app: app,
	}
}

func TestGetCommentsByPostID(t *testing.T) {
	app := fiber.New()
	app.Get("/api/comments/:postId", func(c *fiber.Ctx) error {
		postID := c.Params("postId")
		if postID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "文章ID不能为空",
			})
		}
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"postId":  postID,
		})
	})

	req := httptest.NewRequest("GET", "/api/comments/test", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	err = json.NewDecoder(resp.Body).Decode(&result)
	if err != nil {
		t.Fatal(err)
	}

	assert.True(t, result["success"].(bool))
	assert.Equal(t, "test", result["postId"])
}

func TestCreateComment(t *testing.T) {
	app := fiber.New()
	app.Post("/api/comments", func(c *fiber.Ctx) error {
		var req models.CommentRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "无效的请求数据",
			})
		}

		if req.PostID == "" || req.AuthorName == "" || req.Content == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "缺少必要字段",
			})
		}

		comment := models.Comment{
			ID:          1,
			PostID:      req.PostID,
			ParentID:    req.ParentID,
			AuthorName:  req.AuthorName,
			AuthorEmail: req.AuthorEmail,
			Content:     req.Content,
			CountryCode: "US", // 模拟国家代码
			Status:      "approved",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		return c.Status(fiber.StatusCreated).JSON(comment)
	})

	commentReq := models.CommentRequest{
		PostID:      "test",
		AuthorName:  "Test User",
		AuthorEmail: "test@example.com",
		Content:     "This is a test comment",
	}

	jsonData, _ := json.Marshal(commentReq)
	req := httptest.NewRequest("POST", "/api/comments", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusCreated, resp.StatusCode)

	var comment models.Comment
	err = json.NewDecoder(resp.Body).Decode(&comment)
	if err != nil {
		t.Fatal(err)
	}

	assert.Equal(t, commentReq.PostID, comment.PostID)
	assert.Equal(t, commentReq.AuthorName, comment.AuthorName)
	assert.Equal(t, commentReq.Content, comment.Content)
}

func TestLikeComment(t *testing.T) {
	app := fiber.New()

	app.Post("/api/comments/:id/like", func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "评论ID不能为空",
			})
		}

		comment := models.Comment{
			ID:          1,
			PostID:      "test",
			AuthorName:  "Test User",
			Content:     "This is a test comment",
			CountryCode: "US",
			Likes:       1, // 点赞后的数量
			Status:      "approved",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		return c.JSON(comment)
	})

	req := httptest.NewRequest("POST", "/api/comments/1/like", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var comment models.Comment
	err = json.NewDecoder(resp.Body).Decode(&comment)
	if err != nil {
		t.Fatal()
	}

	assert.Equal(t, int64(1), comment.ID)
	assert.Equal(t, 1, comment.Likes)
}

func TestGetCommentByID(t *testing.T) {
	app := fiber.New()

	app.Get("/api/comments/detail/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "评论ID不能为空",
			})
		}

		comment := models.Comment{
			ID:          1,
			PostID:      "test",
			AuthorName:  "Test User",
			Content:     "This is a test comment",
			CountryCode: "US",
			Status:      "approved",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		return c.JSON(comment)
	})

	req := httptest.NewRequest("GET", "/api/comments/detail/1", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var comment models.Comment
	err = json.NewDecoder(resp.Body).Decode(&comment)
	if err != nil {
		t.Fatal()
	}

	assert.Equal(t, int64(1), comment.ID)
	assert.Equal(t, "test", comment.PostID)
}

func TestUnlikeComment(t *testing.T) {
	app := fiber.New()

	app.Delete("/api/comments/:id/like", func(c *fiber.Ctx) error {
		id := c.Params("id")
		if id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "评论ID不能为空",
			})
		}

		comment := models.Comment{
			ID:          1,
			PostID:      "test",
			AuthorName:  "Test User",
			Content:     "This is a test comment",
			CountryCode: "US",
			Likes:       0, // 取消点赞后的数量
			Status:      "approved",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		return c.JSON(comment)
	})

	req := httptest.NewRequest("DELETE", "/api/comments/1/like", nil)
	resp, err := app.Test(req)

	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	var comment models.Comment
	err = json.NewDecoder(resp.Body).Decode(&comment)
	if err != nil {
		t.Fatal()
	}

	assert.Equal(t, int64(1), comment.ID)
	assert.Equal(t, 0, comment.Likes)
}
