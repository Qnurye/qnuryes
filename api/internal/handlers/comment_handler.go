package handlers

import (
	"strconv"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gofiber/fiber/v2"
	"github.com/jmoiron/sqlx"
	"github.com/qnury/comment-api/internal/models"
	"github.com/qnury/comment-api/internal/services"
	"github.com/qnury/comment-api/pkg/utils"
)

type CommentHandler struct {
	DB           *sqlx.DB
	RedisClient  *redis.Client
	GeoIPService *services.GeoIPService
}

func NewCommentHandler(db *sqlx.DB, redisClient *redis.Client, geoipService *services.GeoIPService) *CommentHandler {
	return &CommentHandler{
		DB:           db,
		RedisClient:  redisClient,
		GeoIPService: geoipService,
	}
}

func (h *CommentHandler) GetCommentsByPostID(c *fiber.Ctx) error {
	postID := c.Params("postId")
	if postID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "文章ID不能为空",
		})
	}

	page := utils.StringToInt(c.Query("page", "1"), 1)
	pageSize := utils.StringToInt(c.Query("limit", "20"), 20)
	offset := (page - 1) * pageSize

	// 查询顶级评论
	var comments []models.Comment
	query := `
		SELECT * FROM comments 
		WHERE post_id = $1 AND parent_id IS NULL AND status = 'approved'
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	if err := h.DB.Select(&comments, query, postID, pageSize, offset); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取评论失败: " + err.Error(),
		})
	}

	var totalItems int
	countQuery := `SELECT COUNT(*) FROM comments WHERE post_id = $1 AND parent_id IS NULL AND status = 'approved'`
	if err := h.DB.Get(&totalItems, countQuery, postID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取评论总数失败: " + err.Error(),
		})
	}

	totalPages := (totalItems + pageSize - 1) / pageSize
	for i := range comments {
		var replies []models.Comment
		replyQuery := `
					SELECT * FROM comments 
					WHERE parent_id = $1 AND status = 'approved'
					ORDER BY created_at
				`
		if err := h.DB.Select(&replies, replyQuery, comments[i].ID); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "获取评论回复失败: " + err.Error(),
			})
		}
		comments[i].Replies = make([]*models.Comment, len(replies))
		for j := range replies {
			comments[i].Replies[j] = &replies[j]
		}
	}

	// 构建响应
	response := models.PaginationResponse{
		Data:       comments,
		Page:       page,
		PageSize:   pageSize,
		TotalItems: totalItems,
		TotalPages: totalPages,
	}

	return c.JSON(response)
}

func (h *CommentHandler) GetCommentByID(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "评论ID不能为空",
		})
	}

	commentID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的评论ID",
		})
	}

	var comment models.Comment
	query := `SELECT * FROM comments WHERE id = $1 AND status = 'approved'`
	if err := h.DB.Get(&comment, query, commentID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "评论不存在",
		})
	}

	if comment.ParentID != nil {
		var parentComment models.Comment
		parentQuery := `SELECT * FROM comments WHERE id = $1 AND status = 'approved'`
		if err := h.DB.Get(&parentComment, parentQuery, *comment.ParentID); err == nil {
			// 只有在成功获取父评论时才设置
			// 这里不返回错误，因为父评论可能已被删除
		}
	}

	if comment.ParentID == nil {
		var replies []models.Comment
		replyQuery := `
					SELECT * FROM comments 
					WHERE parent_id = $1 AND status = 'approved'
					ORDER BY created_at
				`
		if err := h.DB.Select(&replies, replyQuery, comment.ID); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "获取评论回复失败: " + err.Error(),
			})
		}
		comment.Replies = make([]*models.Comment, len(replies))
		for i := range replies {
			comment.Replies[i] = &replies[i]
		}
	}

	return c.JSON(comment)
}

func (h *CommentHandler) CreateComment(c *fiber.Ctx) error {
	var req models.CommentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据: " + err.Error(),
		})
	}

	if req.PostID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "文章ID不能为空",
		})
	}
	if req.AuthorName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "作者名称不能为空",
		})
	}
	if req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "评论内容不能为空",
		})
	}

	if req.ParentID != nil {
		var parentExists bool
		parentQuery := `SELECT EXISTS(SELECT 1 FROM comments WHERE id = $1 AND status = 'approved')`
		if err := h.DB.Get(&parentExists, parentQuery, *req.ParentID); err != nil || !parentExists {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "父评论不存在或已被删除",
			})
		}
	}

	clientIP := utils.GetClientIP(c)
	countryCode := "Mars"
	if h.GeoIPService != nil {
		countryCode = h.GeoIPService.GetCountryCode(clientIP)
	}

	comment := models.Comment{
		PostID:      req.PostID,
		ParentID:    req.ParentID,
		AuthorName:  req.AuthorName,
		AuthorEmail: req.AuthorEmail,
		AuthorIP:    clientIP,
		Content:     req.Content,
		CountryCode: countryCode,
		Status:      "approved",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	query := `
		INSERT INTO comments (post_id, parent_id, author_name, author_email, author_ip, content, country_code, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, created_at
	`
	row := h.DB.QueryRow(query,
		comment.PostID,
		comment.ParentID,
		comment.AuthorName,
		comment.AuthorEmail,
		comment.AuthorIP,
		comment.Content,
		comment.CountryCode,
		comment.Status,
		comment.CreatedAt,
		comment.UpdatedAt,
	)

	if err := row.Scan(&comment.ID, &comment.CreatedAt); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建评论失败: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(comment)
}

func (h *CommentHandler) LikeComment(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "评论ID不能为空",
		})
	}

	commentID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的评论ID",
		})
	}

	var commentExists bool
	existsQuery := `SELECT EXISTS(SELECT 1 FROM comments WHERE id = $1 AND status = 'approved')`
	if err := h.DB.Get(&commentExists, existsQuery, commentID); err != nil || !commentExists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "评论不存在或已被删除",
		})
	}

	userIdentifier := utils.GetClientIP(c)

	var likeExists bool
	likeExistsQuery := `SELECT EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_identifier = $2)`
	if err := h.DB.Get(&likeExists, likeExistsQuery, commentID, userIdentifier); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "检查点赞状态失败: " + err.Error(),
		})
	}

	if likeExists {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "您已经点赞过该评论",
		})
	}

	tx, err := h.DB.Beginx()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "开始事务失败: " + err.Error(),
		})
	}
	defer func(tx *sqlx.Tx) {
		err := tx.Rollback()
		if err != nil {
			err := c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "回滚事务失败: " + err.Error(),
			})
			if err != nil {
				return
			}
		}
	}(tx) // 如果提交成功，这个回滚不会生效

	likeQuery := `INSERT INTO comment_likes (comment_id, user_identifier, created_at) VALUES ($1, $2, $3)`
	_, err = tx.Exec(likeQuery, commentID, userIdentifier, time.Now())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建点赞记录失败: " + err.Error(),
		})
	}

	updateQuery := `UPDATE comments SET likes = likes + 1 WHERE id = $1`
	_, err = tx.Exec(updateQuery, commentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新点赞数失败: " + err.Error(),
		})
	}

	if err := tx.Commit(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "提交事务失败: " + err.Error(),
		})
	}

	var comment models.Comment
	getQuery := `SELECT * FROM comments WHERE id = $1`
	if err := h.DB.Get(&comment, getQuery, commentID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取更新后的评论失败: " + err.Error(),
		})
	}

	return c.JSON(comment)
}

func (h *CommentHandler) UnlikeComment(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "评论ID不能为空",
		})
	}

	commentID, err := strconv.ParseInt(id, 10, 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的评论ID",
		})
	}

	userIdentifier := utils.GetClientIP(c)

	var likeExists bool
	likeExistsQuery := `SELECT EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = $1 AND user_identifier = $2)`
	if err := h.DB.Get(&likeExists, likeExistsQuery, commentID, userIdentifier); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "检查点赞状态失败: " + err.Error(),
		})
	}

	if !likeExists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "您尚未点赞该评论",
		})
	}

	tx, err := h.DB.Beginx()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "开始事务失败: " + err.Error(),
		})
	}
	defer func(tx *sqlx.Tx) {
		err := tx.Rollback()
		if err != nil {
			err := c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "回滚事务失败: " + err.Error(),
			})
			if err != nil {
				return
			}
		}
	}(tx) // 如果提交成功，这个回滚不会生效

	deleteLikeQuery := `DELETE FROM comment_likes WHERE comment_id = $1 AND user_identifier = $2`
	_, err = tx.Exec(deleteLikeQuery, commentID, userIdentifier)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除点赞记录失败: " + err.Error(),
		})
	}

	updateQuery := `UPDATE comments SET likes = GREATEST(likes - 1, 0) WHERE id = $1`
	_, err = tx.Exec(updateQuery, commentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新点赞数失败: " + err.Error(),
		})
	}

	if err := tx.Commit(); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "提交事务失败: " + err.Error(),
		})
	}

	var comment models.Comment
	getQuery := `SELECT * FROM comments WHERE id = $1`
	if err := h.DB.Get(&comment, getQuery, commentID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取更新后的评论失败: " + err.Error(),
		})
	}

	return c.JSON(comment)
}
