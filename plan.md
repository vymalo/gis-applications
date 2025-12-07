# GIS Applications – React Admin + Better Auth Migration Plan

## 0. General

- [x] Confirm the desired auth provider setup (Better Auth with Keycloak for admins + email one-time token for users, multi-session support, 30min session max age, roles).
- [x] Confirm that tRPC remains the only backend API for business logic.
- [x] Confirm that React Admin is used only under `(admin)` and not for public pages.
- [ ] Ensure local development environment is working (`yarn install`, `yarn dev`).
- [ ] Ensure database is up-to-date (`yarn db:generate` / `yarn db:migrate` as needed).

---

## 1. Introduce Better Auth alongside NextAuth

- [x] Install Better Auth and related packages (`better-auth`, subpath exports like `better-auth/adapters/prisma`, `better-auth/next-js`).
- [x] Add Better Auth environment variables to `.env`:
  - [x] `BETTER_AUTH_SECRET`
  - [x] `BETTER_AUTH_URL`
  - [ ] Any required Keycloak / OAuth provider env vars migrated from NextAuth config.
- [x] Create a Better Auth configuration module (e.g. `src/server/auth/better-auth.ts`):
  - [x] Import and configure `betterAuth` with Prisma adapter.
  - [ ] Configure session strategy for multi-sessions with 30min max lifetime and appropriate cookie settings.
  - [x] Expose server-side helpers (e.g. `auth`, `signIn`, `signOut` equivalents or wrappers).
- [ ] Decide on where to store Better Auth models in Prisma (reuse existing tables or add Better Auth models if required).
- [ ] Update Prisma schema to support Better Auth (if additional models are required).
- [ ] Run Prisma migrations for Better Auth models.

---

## 2. Wire Better Auth into tRPC and App Router

- [x] Update `src/server/api/trpc.ts`:
  - [x] Replace the `auth` import from `@app/server/auth` (NextAuth) with Better Auth’s `auth` helper.
  - [ ] Confirm `createTRPCContext` still exposes `session` with `user` and `role` as expected.
  - [x] Ensure `protectedProcedure` still checks for authenticated user via `ctx.session.user`.
- [x] Update any other server modules importing `auth` to use Better Auth:
  - [x] `(admin)/layout.tsx`
  - [x] `(application)/apply/page.tsx`
  - [x] Any other `auth()` usage in RSCs or server utilities.
- [ ] Verify the admin layout guard still works:
  - [ ] Redirects unauthenticated users to `/login`.
  - [ ] Redirects non-admin users to `/`.
  - [ ] Allows `UserRole.ADMIN` through.

---

## 3. Implement Better Auth API routes and login/logout flows

- [x] Create Better Auth API routes/handlers in `src/app/api/auth` (App Router endpoints):
  - [x] Login/logout/session/callback handled via Better Auth catch-all route (`/api/auth/[...all]`) using `toNextJsHandler`.
- [x] Update `/login` page in `(auth)` segment:
  - [x] Replace any NextAuth-specific logic with Better Auth client calls or redirects (via `LoginToKeepTrack`).
  - [ ] Make the primary login mode a one-time token (magic link) sent by email (Better Auth email-based plugin), with Keycloak remaining available for admins if needed.
- [x] Implement logout flow (e.g. in a header/menu component):
  - [x] Call Better Auth logout from the `Logout` component using `authClient.signOut`.
  - [x] Redirect to landing page after logout.
- [x] Add a small “who am I” check endpoint for admin (e.g. `/api/auth/me` via tRPC or REST) to be used by React Admin’s `authProvider`.
- [ ] Manually test:
  - [ ] Anonymous access to public pages.
  - [ ] Login → see session.
  - [ ] Access admin pages with ADMIN role.
  - [ ] Logout → admin pages blocked again.

---

## 4. Remove NextAuth (once Better Auth is fully wired)

- [x] Remove imports from `next-auth` and `@auth/prisma-adapter` across the codebase.
- [x] Delete NextAuth config files:
  - [x] `src/server/auth/config.ts` (or equivalent).
  - [x] Any NextAuth-specific API routes/handlers.
- [x] Remove `next-auth` and `@auth/prisma-adapter` from `package.json` dependencies.
- [ ] Remove unused auth-related environment variables.
- [x] Run `yarn check` / `yarn typecheck` to ensure no leftover references (excluding pre-existing unrelated errors in `instrumentation.ts` and `mail.ts`).

---

## 5. Introduce React Admin in `(admin)` segment

- [x] Install React Admin and UI dependencies:
  - [x] `react-admin`.
  - [ ] Chosen RA UI package (e.g. Material UI or headless; align with Tailwind/daisyUI).
- [x] Create an admin entrypoint component:
  - [x] New file for the React Admin shell (e.g. `src/admin/AdminApp.tsx` as a client component).
  - [x] Configure `<Admin>` with `dataProvider` and `authProvider` (currently placeholders).
  - [ ] Implement a basic custom RA layout that matches the existing admin look as much as practical.
- [x] Convert `src/app/(admin)/applications/page.tsx`:
  - [x] Make it a client component that mounts `<AdminApp />`.
  - [x] Remove old server-side tRPC prefetch logic from this page (moved into RA data layer).
- [x] Ensure `(admin)/layout.tsx` still runs on server and wraps the RA client page.

---

## 6. Implement tRPC-backed React Admin `dataProvider`

- [x] Create `src/admin/dataProvider/trpcDataProvider.ts`:
  - [x] Import a dedicated tRPC client (`@trpc/client`) bound to `AppRouter`.
  - [x] Implement `getList` mapping to `application.getSome` (flattening grouped results into a flat list for React Admin and returning `{ data, total }`).
  - [x] Implement `getOne` mapping to `application.getApplication`.
  - [ ] Implement `create`, `update`, `delete`, `deleteMany`, `updateMany` as needed using existing or new tRPC mutations.
  - [x] Normalize list responses to `{ data, total }` shape expected by React Admin.
  - [ ] Map RA filters, pagination, and sorting into tRPC input (page, size, q, email, status, groupBy, sort).
- [ ] Decide how to handle grouping:
  - [ ] Either keep a grouped response shape in a dedicated tRPC procedure and expose that via a custom RA component, or
  - [ ] Normalize into flat records and compute grouping client-side in RA.
- [ ] Add error handling and logging (especially for `UNAUTHORIZED` responses).
- [ ] Write a small unit/integration test (optional) to verify that `getList` and `getOne` map correctly to tRPC inputs/outputs.

---

## 7. Implement React Admin `authProvider` using Better Auth

- [x] Create `src/admin/authProvider.ts`:
  - [x] `login` method:
    - [x] Trigger Better Auth login flow for admins using Keycloak OAuth and redirect back to `/applications`.
  - [x] `logout` method:
    - [x] Call Better Auth logout (via `authClient.signOut`) and rely on React Admin to refresh UI.
  - [x] `checkAuth` method:
    - [x] Call `/api/auth/me` to verify current user.
    - [x] Reject if no user or if role is not `ADMIN`.
  - [x] `getIdentity` (optional):
    - [x] Return user ID, name, email from Better Auth session.
  - [x] `getPermissions`:
    - [x] Return `ADMIN` or other roles from user, for role-based UI decisions in RA.
- [x] Plug `authProvider` into `AdminApp`.
- [ ] Verify behavior:
  - [ ] Unauthenticated user is redirected to login before seeing RA.
  - [ ] Authenticated non-admin user is rejected from RA.
  - [ ] Authenticated admin user can see the admin UI.

---

## 8. Define React Admin resources for applications

- [x] Create React Admin resource components:
  - [x] `ApplicationList` for listing applications.
  - [x] `ApplicationShow` for detailed view.
  - [ ] `ApplicationEdit` for editing existing applications.
  - [ ] `ApplicationCreate` for admin-created applications (optional).
- [x] Register `applications` resource in `AdminApp`:
  - [x] `<Resource name="applications" list={ApplicationList} show={ApplicationShow} />` (edit/create to be wired once mutations are ready).
- [x] Map resource name `applications` to the tRPC router used by `trpcDataProvider`.
- [ ] Ensure that all admin actions use `protectedProcedure` endpoints that enforce admin role.

---

## 9. Recreate and extend admin UX inside React Admin

- [ ] Port the existing `LatestApplication` functionality into `ApplicationList`:
  - [ ] Implement full-text search (`q`) using RA `<TextInput>` filters.
  - [ ] Implement email-specific search (`email`) filter.
  - [ ] Implement pagination (page/size) via RA `pagination` props.
  - [ ] Display grouped applications (by status, email, lastName, firstName) as either:
    - [ ] A grouped list layout, or
    - [ ] Separate views / tabs / filters.
- [ ] Add a sidebar in RA layout:
  - [ ] Section for “Group by” with options: status, email, last name, first name.
  - [ ] Section for batch actions (similar to existing `BatchActions` component).
- [ ] Implement batch actions in RA:
  - [ ] Use RA bulk actions to affect multiple selected applications.
  - [ ] Wire bulk actions to existing tRPC batch mutations (or add new ones).
- [ ] Ensure status mapping (`StatusMapping`) is reused or reimplemented in RA views.
- [ ] Port `admin-single-application` UI logic into `ApplicationShow` / `ApplicationEdit` components.

---

## 10. Adjust / extend tRPC application router for React Admin needs

- [ ] Review `src/server/api/routers/application.ts`:
  - [ ] Confirm existing procedures (`getSome`, `getById`, create/update/delete, batch actions) cover RA needs.
  - [ ] Add standardized list endpoint (e.g. `list`) returning `{ data: Application[]; total: number }` if needed for RA.
  - [ ] Ensure full-text search and email search are supported via query parameters.
  - [ ] Ensure results can be sorted and paginated efficiently.
- [ ] Enforce role checks:
  - [ ] Use `protectedProcedure` and explicit `ADMIN` role checks for admin operations.
  - [ ] Keep public procedures for applicants (e.g. `apply`, `getUserApplication`) separated and appropriately locked down.
- [ ] Optimize Prisma queries for React Admin usage:
  - [ ] Add indexes on `email`, `status`, `createdAt` as needed.
  - [ ] Avoid N+1 queries where RA might fetch multiple records.

---

## 11. Public application flow: migrate off Formik

- [ ] Inventory all Formik usages:
  - [ ] `src/components/single-apply.tsx`.
  - [ ] `src/components/document-comment.tsx`.
  - [ ] `src/components/search-field.tsx`.
  - [ ] Inputs in `src/components/inputs/*.tsx` (text, textarea, select, toggle, date, file-input, search, etc.).
- [ ] Choose replacement for Formik in public flows:
  - [ ] Simple controlled components + Zod validation, or
  - [ ] `react-hook-form` + `@hookform/resolvers/zod`.
- [ ] Implement shared validation schemas in Zod (reusing existing schemas where possible).
- [ ] Refactor `SingleApply`:
  - [ ] Replace Formik `<Formik>` / `<Form>` with the new form management approach.
  - [ ] Replace `FieldArray` usage with an equivalent pattern in the new form library or custom logic.
  - [ ] Keep the same UX for adding/removing dynamic fields (e.g. document uploads, extra items).
  - [ ] Wire submit handlers to the same tRPC mutations and mail sending logic.
- [ ] Refactor form input components:
  - [ ] Remove `useField` from Formik-based inputs.
  - [ ] Expose props compatible with the new form approach (e.g. `value`, `onChange`, `error`).
  - [ ] Ensure styling and accessibility stay consistent.
- [ ] Refactor `document-comment` and other smaller forms to the new form approach.
- [ ] Refactor `search-field` to remove Formik:
  - [ ] Replace with a simple controlled input + `onSubmit` or `onChange` callback.
  - [ ] Preserve behavior for updating query string and triggering search.

---

## 12. Remove Formik and related dependencies

- [ ] Remove all remaining imports from `formik` and `zod-formik-adapter`.
- [ ] Delete any leftover Formik-specific helper components.
- [ ] Remove `formik` and `zod-formik-adapter` from `package.json`.
- [ ] Run `yarn check` / `yarn typecheck` to ensure no references remain.

---

## 13. Integration & UX polish

- [ ] Integrate the new React Admin UI with the rest of the site:
  - [ ] Ensure `/applications` is the main admin entry point.
  - [ ] Add/adjust navigation links for admins (e.g. header link to `/applications` only visible for ADMIN users).
- [ ] Confirm all admin actions are available via React Admin:
  - [ ] View applications.
  - [ ] Search/filter/group.
  - [ ] Edit/update status and details.
  - [ ] Batch approve/reject or other actions.
- [ ] Verify that public flows remain unchanged or improved:
  - [ ] `/apply` (new applications).
  - [ ] `/apply/:application_id` (edit existing application).
  - [ ] `/apply/success` confirmation.
  - [ ] `/closed` page.
- [ ] Ensure auth redirections and guards behave correctly in all routes.

---

## 14. Testing, validation, and performance

- [ ] Run `yarn check`, `yarn lint`, and `yarn typecheck` after major refactors.
- [ ] Add or update tests where appropriate:
  - [ ] tRPC application router tests (if present).
  - [ ] Small tests for `trpcDataProvider` mapping logic.
  - [ ] Tests around Better Auth integration if there is a test harness.
- [ ] Manual QA:
  - [ ] Admin user flows (login → manage applications → logout).
  - [ ] Non-admin user blocked from admin.
  - [ ] Anonymous user only sees public pages and `/apply`.
- [ ] Check performance of admin lists:
  - [ ] Ensure pagination works and queries are reasonably fast.
  - [ ] Monitor any heavy queries (especially with groupBy and full-text search).

---

## 15. Cleanup and documentation

- [ ] Remove any dead components related to the old admin UI (e.g. `LatestApplication` if fully replaced).
- [ ] Remove or refactor any components that were tightly coupled to Formik in admin flows.
- [ ] Update `README.md`:
  - [ ] Document the new auth stack (Better Auth + Prisma).
  - [ ] Document the new admin stack (React Admin + tRPC).
  - [ ] Add high-level instructions for adding new admin resources.
  - [ ] Document how to run migrations and manage Prisma models with Better Auth.
- [ ] Optionally add a `docs/` entry describing the admin architecture and how RA resources map to tRPC routers.
- [ ] Perform a final dependency audit to ensure there are no unused packages left.
