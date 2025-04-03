# Comment API with Cloudflare Workers and D1

This is a TypeScript implementation of a comment API using Cloudflare Workers and D1 database. It provides functionality for managing comments, including creating, retrieving, and liking comments.

## Features

- Create and retrieve comments
- Nested comments (replies)
- Comment likes
- Pagination
- IP-based user identification
- Country code detection
- Input validation

## Prerequisites

- Node.js 18 or later
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Create a D1 database:
   ```bash
   wrangler d1 create comment_db
   ```

3. Update the `wrangler.toml` file with your D1 database ID:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "comment_db"
   database_id = "your-database-id-here"
   ```

4. Deploy the worker:
   ```bash
   wrangler deploy
   ```

## API Endpoints

### Get Comments by Post ID
```
GET /posts/:postId/comments?page=1&limit=20
```

### Get Comment by ID
```
GET /comments/:id
```

### Create Comment
```
POST /comments
```
Request body:
```json
{
  "postId": "string",
  "parentId": "number (optional)",
  "authorName": "string",
  "authorEmail": "string (optional)",
  "content": "string"
}
```

### Like Comment
```
POST /comments/:id/like
```

### Unlike Comment
```
DELETE /comments/:id/like
```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Run tests:
   ```bash
   npm test
   ```

## Environment Variables

The following environment variables are used:

- `DB`: D1 database binding (automatically configured by Wrangler)

## Security

- Input validation using Zod
- IP-based user identification for likes
- SQL injection prevention using prepared statements
- Rate limiting (to be implemented)

## License

MIT 