CatTags Backend — Security Fixes, Auth Overhaul & CAPTCHA

Context: A manual security review of the backend (in this repo) found several real
issues. Fix these first, then make the two larger changes below.

---

CRITICAL — FIX FIRST

1. src/middleware/auth.ts has a hardcoded fallback JWT secret:
   const JWT_SECRET = process.env.JWT_SECRET || 'cattags-dev-secret-change-in-production-12345';
   This must never fall back silently. On startup, if JWT_SECRET is not set, throw
   and refuse to start the server. This code will live in a public GitHub repo, so
   a hardcoded fallback is a full auth bypass waiting to happen.

---

BROKEN ACCESS CONTROL (IDOR) — FIX

2. POST /api/v1/teams/:id/logo has no ownership check at all. Every sibling
   write endpoint (PATCH, DELETE, /members) checks:
     team.ownerId !== req.user!.id && req.user!.role !== 'ADMIN'
   Add the identical check here. Right now any authenticated user can overwrite
   any team's logo.

3. POST /api/v1/teams/:id/verify has the same missing check. Only the team
   owner or an admin should be able to generate a verification code for that
   team's members.

---

OTHER FIXES

4. Verification code generation uses Math.random() and only 4 base36 chars
   (~1.3M combinations) — brute-forceable inside the 15-minute expiry window.
   Replace with crypto.randomBytes-based generation and increase length/entropy.

5. There is no dedicated rate limit on /api/v1/auth/login or /register — only
   the global 300/min limiter applies. Add a strict limiter (e.g. 5-10
   attempts per 15 minutes per IP) specifically on login and register.

6. POST /api/v1/teams/:id/logo trusts the client-supplied `contentType`
   without validating actual file bytes. Validate the real file signature
   (magic bytes) matches PNG/WebP before accepting the upload.

7. The /team verify <code> flow described in our docs has no consumption
   endpoint. db.findVerificationToken and db.markVerificationTokenUsed exist
   but are never called from any route. Implement:
     POST /api/v1/teams/:id/verify/confirm  { code }
   which looks up the token, checks it's unexpired/unused, marks the matching
   team member as verified, marks the token used, and returns success.

---

AUTH OVERHAUL — replace the custom JWT/bcrypt implementation

Our current auth (routes/auth.ts + middleware/auth.ts) is hand-rolled
JWT + bcrypt. Replace it with Better Auth (https://www.better-auth.com) —
the current most-starred, TypeScript-first, framework-agnostic auth library,
now the default recommendation across the Node/TS ecosystem.

Requirements:
- Use Better Auth's email/password provider as the primary flow (parity with
  what we have now: email, password, minecraftUsername on register).
- Use its session handling instead of hand-rolled JWTs.
- Use a proper database adapter (Kysely or Prisma/Drizzle, whichever fits our
  existing PostgreSQL setup with least migration pain) instead of our raw
  `pg` queries for the users table specifically. Leave the teams/members/
  verification-token tables on raw pg as they are now — only replace user
  auth storage.
- Preserve the existing `role` field (USER/ADMIN) as a Better Auth
  additionalField, since our authorization checks depend on it.
- Update all routes/middleware that currently read `req.user` from the
  hand-rolled JWT to instead use Better Auth's session/user object.
- Do not lose the audit-log calls that already exist on team actions.

---

CLOUDFLARE TURNSTILE (CAPTCHA)

Add Cloudflare Turnstile to the web dashboard, specifically on:
- Register
- Login
- Team creation (POST /api/v1/teams)

Requirements:
- Add the Turnstile widget to the relevant frontend forms.
- Backend: verify the Turnstile token server-side via Cloudflare's
  siteverify endpoint before processing register/login/team-creation
  requests. Reject the request if verification fails.
- Store the Turnstile secret key as an environment variable
  (TURNSTILE_SECRET_KEY), never hardcoded. Add it to .env.example as a
  placeholder only.
- Document in a short README section how to get a Turnstile site key/secret
  key from the Cloudflare dashboard and where to put them.

---

VALIDATION

Before saying this is done:
1. Run existing tests, fix any that break from the auth swap.
2. Manually verify: an authenticated user who is NOT a team owner gets 403
   on /logo and /verify for a team they don't own.
3. Verify JWT_SECRET-missing startup actually throws (test by unsetting it
   locally).
4. Verify the new /verify/confirm endpoint actually marks a member verified.
5. Verify Turnstile rejection actually blocks register/login/team-creation
   when the token is invalid or missing.

Give a concise summary of what changed, not a step-by-step narration.

EMAIL VERIFICATION (via Better Auth)

Enable Better Auth's built-in email verification:
- On register, require email verification before the account is fully active
  (or before they can create/own a team — whichever fits better, your call).
- Better Auth handles generating and validating the verification token; we
  only need to provide the actual email-sending function.
- Use an email-sending provider (Resend is the simplest modern option and
  has a generous free tier — pick another if the repo already has one
  configured).
- Store the email provider's API key as an environment variable
  (e.g. RESEND_API_KEY), never hardcoded, and add it to .env.example as a
  placeholder only.
- Send a clean branded email (CatTags name/colors) with the verification
  link/code.
- Document in the README where to get the email provider's API key and how
  it's wired in.
