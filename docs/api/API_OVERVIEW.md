# REST API Architecture Overview

The Sri Sankara TV Production Management REST API is designed according to OpenAPI 3.0 principles, versioned under `/api/v1/`.

---

## 1. Request & Response Standards

### 1.1. Base URL
All API endpoints are mounted on:
```text
http(s)://<domain>/api/v1/
```

### 1.2. Standard Response Envelope
All API endpoints return JSON conforming to the standard envelope:

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Shoot request created successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT_DETECTED",
    "message": "Staff member V. Karthik is already assigned to another shoot on 2026-11-20 between 06:00 and 14:00.",
    "details": [ ... ]
  }
}
```

### 1.3. Standard HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `202 Accepted`: Asynchronous job accepted into outbox queue.
- `400 Bad Request`: Malformed payload or validation schema failure.
- `401 Unauthorized`: Missing or invalid JWT authentication token.
- `403 Forbidden`: Insufficient role or object-level ACL restriction.
- `404 Not Found`: Target resource does not exist.
- `409 Conflict`: Scheduling collision or optimistic locking version mismatch.
- `422 Unprocessable Entity`: Business logic invariant failed (e.g. submitting PAF without crew).
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Authentication & Authorization

All requests to protected endpoints must supply a Bearer token in the HTTP `Authorization` header:
```http
Authorization: Bearer <jwt_access_token>
```

Tokens contain standard claims:
```json
{
  "sub": "654c1...",
  "email": "cmo@srisankaratv.com",
  "role": "cmo",
  "name": "Sundara Raman",
  "iat": 1731940000,
  "exp": 1732026400
}
```
Role-Based Access Control (RBAC) middleware parses this token and enforces endpoint permissions before controller execution.
