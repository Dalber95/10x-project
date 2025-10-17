# API Endpoints Documentation

## Authentication

All flashcard endpoints require authentication via Supabase. The user must be logged in to access these endpoints.

## Flashcard Endpoints

### GET /api/flashcards

Retrieve a paginated list of flashcards for the authenticated user.

**Query Parameters:**
- `page` (optional, default: 1) - Page number (positive integer)
- `limit` (optional, default: 20, max: 100) - Number of items per page

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "front": "Question text",
      "back": "Answer text",
      "source": "ai-full",
      "generation_id": 123,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

**Error Responses:**
- `400` - Invalid pagination parameters
- `401` - Unauthorized (not authenticated)
- `500` - Server error

---

### POST /api/flashcards

Create one or more flashcards.

**Request Body:**
```json
{
  "flashcards": [
    {
      "front": "Question text",
      "back": "Answer text",
      "source": "ai-full",
      "generation_id": 123
    }
  ]
}
```

**Validation Rules:**
- `front`: 1-200 characters
- `back`: 1-500 characters
- `source`: must be "ai-full", "ai-edited", or "manual"
- `generation_id`: required (not null) for "ai-full" and "ai-edited", must be null for "manual"

**Response (201 Created):**
```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "Question text",
      "back": "Answer text",
      "source": "ai-full",
      "generation_id": 123,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `400` - Invalid input data or validation error
- `401` - Unauthorized (not authenticated)
- `500` - Server error

---

### GET /api/flashcards/:id

Retrieve a single flashcard by ID.

**URL Parameters:**
- `id` - Flashcard ID (integer)

**Response (200 OK):**
```json
{
  "id": 1,
  "front": "Question text",
  "back": "Answer text",
  "source": "ai-full",
  "generation_id": 123,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Error Responses:**
- `400` - Invalid ID parameter
- `401` - Unauthorized (not authenticated)
- `404` - Flashcard not found or does not belong to user
- `500` - Server error

---

### PUT /api/flashcards/:id

Update a flashcard. All fields are optional (partial update).

**URL Parameters:**
- `id` - Flashcard ID (integer)

**Request Body:**
```json
{
  "front": "Updated question text",
  "back": "Updated answer text"
}
```

**Validation Rules:**
- `front` (optional): 1-200 characters
- `back` (optional): 1-500 characters
- `source` (optional): must be "ai-full", "ai-edited", or "manual"
- `generation_id` (optional): number or null

**Response (200 OK):**
```json
{
  "id": 1,
  "front": "Updated question text",
  "back": "Updated answer text",
  "source": "ai-edited",
  "generation_id": 123,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T11:45:00Z"
}
```

**Error Responses:**
- `400` - Invalid input data or validation error
- `401` - Unauthorized (not authenticated)
- `404` - Flashcard not found or does not belong to user
- `500` - Server error

---

### DELETE /api/flashcards/:id

Delete a flashcard.

**URL Parameters:**
- `id` - Flashcard ID (integer)

**Response (204 No Content):**
No response body.

**Error Responses:**
- `400` - Invalid ID parameter
- `401` - Unauthorized (not authenticated)
- `404` - Flashcard not found or does not belong to user
- `500` - Server error

---

## Generation Endpoints

### POST /api/generations

Generate flashcard suggestions from text using AI.

**Request Body:**
```json
{
  "source_text": "Your educational text content here..."
}
```

**Validation Rules:**
- `source_text`: 1000-10000 characters

**Response (201 Created):**
```json
{
  "generation_id": 123,
  "flashcards_proposals": [
    {
      "front": "Question text",
      "back": "Answer text",
      "source": "ai-full"
    }
  ],
  "generated_count": 5
}
```

**Error Responses:**
- `400` - Invalid input data (text too short or too long)
- `401` - Unauthorized (not authenticated)
- `500` - Server error or AI service error

