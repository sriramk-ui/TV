# Sri Sankara TV — Engineering & Contribution Guide (CONTRIBUTING.md)

Thank you for contributing to the Sri Sankara TV Production Management System. This document provides technical standards, branch rules, and guidelines for maintaining high code quality across the monorepo.

---

## 1. Monorepo Principles

1. **Independent Maintainability**: Keep `apps/frontend`, `apps/admin`, and `apps/backend` independently runnable and buildable.
2. **Shared Reusability**: Shared business logic, formatting rules, and design tokens must reside in `packages/` to avoid duplication.
3. **No Direct Conversions**: Rebuild all UI elements using modular, reusable React components following Atomic Design; do not copy raw HTML or monolithic scripts.
4. **Backend Authorization Enforcement**: Never rely solely on frontend visibility controls. Enforce row-level ACL and role verification on every backend API endpoint.

---

## 2. Coding Standards & Conventions

### JavaScript & React
- Use modern ES6+ syntax (arrow functions, async/await, destructuring, optional chaining).
- In React, use functional components with hooks (`useState`, `useEffect`, `useCallback`, `useMemo`, `useContext`).
- Keep components small and single-purpose following the Atomic Design taxonomy:
  - **Atoms**: Pure, stateless UI elements with generic props (`Button`, `Input`, `Badge`).
  - **Molecules**: Combinations of atoms with minimal state (`FormField`, `StatCard`, `SearchBar`).
  - **Organisms**: Complex interface blocks (`Sidebar`, `DataTable`, `PAFEditor`, `CalendarGrid`).
  - **Templates**: Reusable page wireframes and shell wrappers.
  - **Pages**: Routed views orchestrating organisms, API data fetching, and page state.

### Node.js & Express API
- Follow standard REST API conventions:
  - `GET /api/v1/resource` (List with pagination & filters)
  - `POST /api/v1/resource` (Create new item)
  - `GET /api/v1/resource/:id` (Fetch single item)
  - `PUT /api/v1/resource/:id` (Update item)
  - `DELETE /api/v1/resource/:id` (Delete or soft-deactivate item)
- Always validate request bodies using declarative validation schemas.
- Use decimal-safe or integer paise values for all currency persistence; never use floating point arithmetic for financial fields.
- Mask PII (passwords, phone numbers in public contexts) and sensitive third-party tokens in all logs.

---

## 3. Pull Request & Verification Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`.
2. Follow standard commit message guidelines:
   - `feat: add crew assignment conflict validator`
   - `fix: prevent duplicate outbox job creation on race condition`
   - `docs: update API endpoints documentation`
3. Run tests before submitting:
   ```bash
   npm test
   ```
4. Verify that all 36 core acceptance tests (T01 - T36) pass without failures.
5. Update `LOG.md` and `CHANGELOG.md` with your modifications.
