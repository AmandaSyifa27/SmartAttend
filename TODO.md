# TODO Fix SmartAttend Login → /dashboard Error

## Root Causes

1. **Build Error**: `frontend/lib/axios.js` imports `eslint-config-next/core-web-vitals` → bundles ESLint internals into client → `Module not found: eslint/lib/util/glob-util`
2. **Backend Auth Middleware Bug**: `jwt.verifyToken` doesn't exist in jsonwebtoken → all auth'd API calls fail with 203 → frontend redirects to login
3. **Backend Auth Controller Bug**: `nidn` not destructured from req.body → dosen login always fails
4. **Frontend Layout Fragility**: `.catch(() => router.push("/login"))` on tahun-ajaran fetch kicks users out if any network/DB error occurs

## Steps

- [x] Fix `frontend/lib/axios.js` — remove wrong ESLint import
- [x] Fix `backend/src/middleware/auth.middleware.js` — `jwt.verifyToken` → `jwt.verify`
- [x] Fix `backend/src/controllers/auth.controller.js` — add `nidn` to destructuring
- [x] Fix `frontend/app/(admin)/layout.js` — setUser before fetch, don't redirect on TA fetch error
- [x] Fix `frontend/app/(dosen)/layout.js` — same resilience fixes
- [x] Fix `frontend/next.config.mjs` — remove unsupported eslint config
- [x] Create missing `frontend/components/shared/ModalBuatKelas.js`
- [x] Fix `backend/src/lib/seeder.js` — seed default active Tahun Ajaran
- [x] Run seeder to populate DB
- [x] Test login & API endpoints — all working
- [x] Start dev server (`npm run dev`) — compiles successfully
