# 评论系统 API 文档

## 概述

这是一个基于 Go Fiber 框架的评论系统 API，集成了 PostgreSQL 数据库和 Redis 限流功能。该 API 提供了评论的创建、获取、点赞等功能，并对请求速率进行了限制。

## 基础信息

- 基础 URL: `http://localhost:3000/api`
- 所有响应均为 JSON 格式
- 所有时间戳使用 ISO 8601 格式

## 认证

本 API 不需要用户系统鉴权，但使用 Redis 对单一用户（基于 IP）的请求速率进行了限制。

## 速率限制

- 限制: 60 次请求/分钟（基于 IP 地址）
- 超出限制时返回 429 状态码

响应头包含以下信息:
- `X-RateLimit-Limit`: 允许的最大请求数
- `X-RateLimit-Remaining`: 当前时间窗口内剩余的请求数
- `X-RateLimit-Reset`: 限制重置的时间戳（Unix 时间戳）

## API 端点

### 获取文章评论

获取指定文章的所有评论，按时间倒序排列，支持分页。

- **URL**: `/comments/:postId`
- **方法**: `GET`
- **URL 参数**:
  - `postId`: 文章 ID
- **查询参数**:
  - `page`: 页码，默认为 1
  - `limit`: 每页数量，默认为 20

**成功响应**:
- **状态码**: 200
- **响应体**:
```json
{
  "data": [
    {
      "id": 1,
      "post_id": "article-123",
      "author_name": "张三",
      "content": "这是一条评论",
      "country_code": "CN",
      "likes": 5,
      "created_at": "2025-03-27T10:00:00Z",
      "replies": [
        {
          "id": 2,
          "post_id": "article-123",
          "parent_id": 1,
          "author_name": "李四",
          "content": "这是一条回复",
          "likes": 2,
          "created_at": "2025-03-27T10:05:00Z"
        }
      ]
    }
  ],
  "page": 1,
  "page_size": 20,
  "total_items": 50,
  "total_pages": 3
}
```

**错误响应**:
- **状态码**: 400, 404, 500
- **响应体**:
```json
{
  "error": "错误信息"
}
```

### 创建评论

创建一条新评论或回复。

- **URL**: `/comments`
- **方法**: `POST`
- **请求体**:
```json
{
  "post_id": "article-123",
  "parent_id": null,  // 可选，回复评论时设置
  "author_name": "张三",
  "author_email": "zhangsan@example.com",  // 可选
  "content": "这是一条评论"
}
```

**成功响应**:
- **状态码**: 201
- **响应体**:
```json
{
  "id": 3,
  "post_id": "article-123",
  "author_name": "张三",
  "author_email": "zhangsan@example.com",
  "content": "这是一条评论",
  "likes": 0,
  "created_at": "2025-03-27T10:10:00Z"
}
```

**错误响应**:
- **状态码**: 400, 500
- **响应体**:
```json
{
  "error": "错误信息"
}
```

### 获取评论详情

获取单个评论的详细信息，包括回复。

- **URL**: `/comments/detail/:id`
- **方法**: `GET`
- **URL 参数**:
  - `id`: 评论 ID

**成功响应**:
- **状态码**: 200
- **响应体**:
```json
{
  "id": 1,
  "post_id": "article-123",
  "author_name": "张三",
  "content": "这是一条评论",
  "country_code": "CN",
  "likes": 5,
  "created_at": "2025-03-27T10:00:00Z",
  "replies": [
    {
      "id": 2,
      "post_id": "article-123",
      "parent_id": 1,
      "author_name": "李四",
      "content": "这是一条回复",
      "likes": 2,
      "created_at": "2025-03-27T10:05:00Z"
    }
  ]
}
```

**错误响应**:
- **状态码**: 400, 404, 500
- **响应体**:
```json
{
  "error": "错误信息"
}
```

### 点赞评论

给评论点赞。

- **URL**: `/comments/:id/like`
- **方法**: `POST`
- **URL 参数**:
  - `id`: 评论 ID

**成功响应**:
- **状态码**: 200
- **响应体**:
```json
{
  "id": 1,
  "post_id": "article-123",
  "author_name": "张三",
  "content": "这是一条评论",
  "likes": 6,
  "created_at": "2025-03-27T10:00:00Z"
}
```

**错误响应**:
- **状态码**: 400, 404, 409, 500
- **响应体**:
```json
{
  "error": "错误信息"
}
```

### 取消点赞

取消对评论的点赞。

- **URL**: `/comments/:id/like`
- **方法**: `DELETE`
- **URL 参数**:
  - `id`: 评论 ID

**成功响应**:
- **状态码**: 200
- **响应体**:
```json
{
  "id": 1,
  "post_id": "article-123",
  "author_name": "张三",
  "content": "这是一条评论",
  "likes": 5,
  "created_at": "2025-03-27T10:00:00Z"
}
```

**错误响应**:
- **状态码**: 400, 404, 500
- **响应体**:
```json
{
  "error": "错误信息"
}
```

## 状态码说明

- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `409 Conflict`: 资源冲突（如重复点赞）
- `429 Too Many Requests`: 请求频率超过限制
- `500 Internal Server Error`: 服务器内部错误

## 部署说明

### 环境要求

- Go 1.18+
- PostgreSQL 12+
- Redis 6+

### 配置

通过 `.env` 文件或环境变量配置:

```
# 服务器配置
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=comments_db
DB_SSLMODE=disable

# Redis配置
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 初始化

运行初始化脚本创建必要的数据库表:

```bash
go run cmd/init/main.go
```

### 启动服务

```bash
go run cmd/api/main.go
```
