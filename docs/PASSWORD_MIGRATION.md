# 🔑 JobPortal 2.0 — Password Migration Strategy & Security Policy

**Standard:** Zero Plaintext Credential Policy • Transparent On-the-Fly Migration • OWASP Compliance

---

## 1. Problem Statement
The initial development prototype stored user passwords as unhashed plaintext strings in the `password` field of the MongoDB `User` model. To achieve production-grade security, all passwords must be stored exclusively as salted `bcryptjs` hashes (minimum 12 salt rounds) in a dedicated `passwordHash` field with `select: false` projection.

---

## 2. On-the-Fly Migration Algorithm

To prevent breaking existing user accounts without requiring bulk forced password resets, the authentication service implements **Transparent On-the-Fly Migration**:

```
Client sends Login Request (email, password)
                     │
                     ▼
         Find User by Email in MongoDB
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  Has `passwordHash`?      Has Legacy Plaintext `password`?
         │                       │
  bcrypt.compare()         Plaintext comparison (password === user.password)
         │                       │
         │                 Matched?
         │                 ├── NO → 401 Unauthorized
         │                 └── YES
         │                      ├── Hash password with bcrypt.hash(password, 12)
         │                      ├── Set `passwordHash` = newHash
         │                      ├── $unset `password`
         │                      └── Save user document
         ▼                       │
    Credentials Valid ───────────┘
         │
    Issue JWT Access + Refresh Tokens
```

---

## 3. Database Schema Migration Specification

### Legacy Schema:
```javascript
{
  name: String,
  email: String,
  password: String, // Plaintext!
  role: String      // "jobseeker" | "employer"
}
```

### Upgraded Production Schema:
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { 
    type: String, 
    enum: ["JOB_SEEKER", "RECRUITER", "ADMIN"], 
    default: "JOB_SEEKER" 
  },
  avatar: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}
```

---

## 4. Development & Seed Account Provisioning

Pre-configured development and demo accounts are provisioned with secure pre-computed bcrypt hashes:

| Account Type | Email | Default Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo Candidate** | `candidate@jobportal.in` | `Candidate@2026` | `JOB_SEEKER` |
| **Demo Recruiter** | `recruiter@jobportal.in` | `Recruiter@2026` | `RECRUITER` |
| **Demo Admin** | `admin@jobportal.in` | `Admin@2026` | `ADMIN` |
