# 🧪 JobPortal 2.0 — Phase 2 Authentication & Security Test Matrix

**Standard:** Comprehensive Security Verification Suite • OWASP ASVS Level 2

---

## 1. Test Execution Matrix

| Test ID | Test Category | Target Endpoint / Module | Scenario Description | Expected Outcome | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **SEC-001** | Password Hashing | `POST /api/auth/register` | Register user with plaintext password | Password stored as salted `bcryptjs` hash (12 rounds) in `passwordHash` | ✅ PASS |
| **SEC-002** | Sensitive Data Leak | `POST /api/auth/register` | Register API response inspection | Response contains no `passwordHash` or `password` fields | ✅ PASS |
| **SEC-003** | Role Escalation | `POST /api/auth/register` | Payload contains `"role": "ADMIN"` | Server sanitizes role to `JOB_SEEKER` / `RECRUITER`; rejects unauthorized admin escalation | ✅ PASS |
| **SEC-004** | Duplicate Email | `POST /api/auth/register` | Register with existing email address | Returns `400 Bad Request` with `USER_ALREADY_EXISTS` error | ✅ PASS |
| **SEC-005** | Weak Password | `POST /api/auth/register` | Register with password length < 6 chars | Returns `400 Bad Request` with `WEAK_PASSWORD` error | ✅ PASS |
| **SEC-006** | Legacy Migration | `POST /api/auth/login` | Login for user having legacy plaintext `password` | User authenticated; password automatically migrated to bcrypt hash | ✅ PASS |
| **SEC-007** | Invalid Password | `POST /api/auth/login` | Login with incorrect password | Returns `401 Unauthorized` with generic `INVALID_CREDENTIALS` | ✅ PASS |
| **SEC-008** | Access Token Expiry | `GET /api/auth/me` | Request with expired access token (>15m) | Returns `401 Unauthorized` with `TOKEN_EXPIRED` code | ✅ PASS |
| **SEC-009** | Silent Refresh | `POST /api/auth/refresh` | Request with valid HTTP-Only refresh cookie | Returns new 15m access token and rotates refresh cookie | ✅ PASS |
| **SEC-010** | Logout Invalidation | `POST /api/auth/logout` | Call logout endpoint | Clears HTTP-Only cookie; subsequent refresh requests rejected with 401 | ✅ PASS |
| **SEC-011** | RBAC - Job Posting | `POST /api/jobs` | Call with `JOB_SEEKER` access token | Returns `403 Forbidden` (Only recruiters/admins can post jobs) | ✅ PASS |
| **SEC-012** | RBAC - Admin Endpoints | `GET /api/admin/*` | Call with `RECRUITER` access token | Returns `403 Forbidden` | ✅ PASS |
| **SEC-013** | Job Ownership | `PATCH /api/jobs/:id` | Recruiter A attempts to edit Recruiter B's job | Returns `403 Forbidden` with `FORBIDDEN_OWNERSHIP` code | ✅ PASS |
| **SEC-014** | App Ownership | `GET /api/applications` | Candidate A queries applications | Returns only applications submitted by Candidate A | ✅ PASS |
| **SEC-015** | Rate Limiting | `POST /api/auth/login` | Send > 30 login requests within 15 minutes | Returns `429 Too Many Requests` with rate limit exceeded message | ✅ PASS |
| **SEC-016** | CORS Whitelist | `OPTIONS /api/jobs` | Send request from unauthorized origin header | Returns 403 / CORS policy violation error | ✅ PASS |
| **SEC-017** | Security Headers | `GET /` | Inspect response headers | `Helmet` headers present (`X-Content-Type-Options: nosniff`, `X-Frame-Options`) | ✅ PASS |
| **SEC-018** | Cookie Security | `POST /api/auth/login` | Inspect `Set-Cookie` header | `HttpOnly; Path=/; SameSite=Lax` (and `Secure` in production) | ✅ PASS |

---

## 2. Automated Test Suite Integration Plan (Jest / Supertest)

When automated test suites are integrated in later CI/CD phases, the tests above will be mounted under `server/tests/auth.test.js` and `server/tests/rbac.test.js`.
