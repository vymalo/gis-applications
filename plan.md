# GIS Applications – React Admin + Better Auth Migration Plan

## 0. General

- [x] Confirm auth provider stack: Better Auth + Drizzle adapter, magic-link login for all users, multi-session enabled, no Keycloak/NextAuth.
- [x] Confirm tRPC remains the only backend API surface.
- [x] Confirm React Admin is only under `(admin)`.
- [ ] Ensure local development runs (`yarn install`, `yarn dev`).
- [ ] Ensure database is up-to-date (`yarn db:generate` / `yarn db:migrate`).

---

## 1. Finalize Better Auth configuration

- [x] Install Better Auth packages.
- [x] Add env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- [ ] Align session lifetime to ~30 minutes (`expiresIn`/`updateAge`), matching AGENTS.md.
- [x] Use Drizzle adapter (no Prisma) and keep config in `src/server/auth/better-auth.ts`.
- [x] Expose helpers for server/client usage.

---

## 2. Wire Better Auth into tRPC and App Router

- [x] Update `src/server/api/trpc.ts` to use Better Auth context.
- [x] Migrate server modules importing `auth` to Better Auth.
- [ ] Verify admin layout guard: unauthenticated → `/login`, non-admin → `/`, admins allowed.

---

## 3. Domain layering & normalization

- [ ] Expand `src/server/application-normalizer.ts` to map all `ApplicationData`/`ApplicationMeta` fields to/from columns and relation tables (phones, documents, educations, consents, status history).
- [ ] Remove/avoid legacy JSON fallbacks in `application` table or keep them strictly derived through the normalizer; update migrations accordingly.
- [ ] Introduce `applicationService` + `applicationRepository` (or similar) so tRPC routers stay thin and business rules (status guards, mapping) live in the domain layer.
- [ ] Centralize date coercion/validation helpers used by applicant/admin flows to keep DRY.

---

## 4. Implement Better Auth API routes and login/logout flows

- [x] Add Better Auth catch-all API route `/api/auth/[...all]`.
- [x] Update `/login` to use Better Auth magic-link flow.
- [x] Implement logout via Better Auth client.
- [x] Add `auth.me` endpoint for React Admin.
- [ ] Manually test anonymous/public, login, admin access, logout.

---

## 5. Remove NextAuth remnants

- [x] Remove `next-auth` imports/config files.
- [x] Drop NextAuth deps from `package.json`.
- [ ] Remove unused auth env vars.
- [ ] Run lint/typecheck to ensure no references remain.

---

## 6. React Admin shell

- [x] Create RA shell (`src/admin/admin-app.tsx`) and mount under `(admin)/applications`.
- [ ] Implement a basic RA layout that matches existing admin styling.

---

## 7. tRPC-backed React Admin dataProvider

- [x] Create `src/admin/dataProvider/trpc-data-provider.ts` and wire to `trpcClient`.
- [ ] Implement full RA interface: `getList` with filters/sort/pagination, `getOne`, `create`, `update`, `delete`, `updateMany`, `deleteMany`, `getMany`, `getManyReference`.
- [ ] Map RA params to dedicated tRPC list endpoints (no hardcoded groupBy) and return `{ data, total }`.
- [ ] Add error handling/logging, especially for UNAUTHORIZED.
- [ ] Add small tests for mapping logic (optional).

---

## 8. React Admin authProvider

- [x] Implement Better Auth–backed `adminAuthProvider` with magic-link login and logout.
- [ ] Ensure `checkAuth` rejects non-admins and redirects to login.
- [ ] Expose identity/permissions for role-based UI.

---

## 9. Define React Admin resources for applications

- [x] Add applications resource with list/show.
- [ ] Add edit/create once mutations exist.
- [ ] Align resource components with camelCase identifiers per AGENTS.md.

---

## 10. Recreate and extend admin UX inside React Admin

- [ ] Port filters/search/pagination/grouping (status/email/name) from legacy admin into RA list views.
- [ ] Add sidebar for grouping and batch actions; wire RA bulk actions to tRPC mutations.
- [ ] Reuse status mapping and document review flows in RA show/edit views.
- [ ] Port admin single-application UI into RA components.

---

## 11. Extend tRPC application router for admin needs

- [ ] Add standardized list endpoint returning `{ data, total }` with filters/sort/page for RA.
- [ ] Ensure create/update/delete/bulk mutations exist and enforce ADMIN role.
- [ ] Optimize queries (indexes on email/status/createdAt) and avoid N+1 when loading relations.

---

## 12. Public application flow: migrate off Formik

- [ ] Inventory and replace Formik in `single-apply`, `document-comment`, `search-field`, and input components with controlled or `react-hook-form` + Zod.
- [ ] Keep nuqs step handling intact; ensure program step remains non-blocking.
- [ ] Preserve dynamic fields (phones, documents, educations) with new form approach.

---

## 13. Remove Formik dependencies

- [ ] Remove `formik` and `zod-formik-adapter` usages and packages.
- [ ] Delete Formik-specific helpers/components.
- [ ] Run lint/typecheck to confirm removal.

---

## 14. Integration & UX polish

- [ ] Integrate new RA UI with site navigation (admin link for ADMIN users).
- [ ] Verify applicant flows (`/apply`, `/apply/:id`, `/apply/success`, `/closed`).
- [ ] Ensure auth redirects/guards behave correctly across routes.

---

## 15. Testing, validation, and performance

- [ ] Run `yarn check`, `yarn lint`, `yarn typecheck` after major changes.
- [ ] Add/adjust tests for tRPC application router and RA dataProvider (if harness present).
- [ ] Manual QA: admin login/manage/logout; non-admin rejection; anonymous public access only.
- [ ] Confirm admin list performance with pagination and sorting.

---

## 16. Cleanup and documentation

- [ ] Remove dead legacy admin components once RA is complete.
- [ ] Update README with auth/admin stacks and migration guidance.
- [ ] Optionally add docs describing RA architecture and tRPC mappings.
- [ ] Perform dependency audit for unused packages.
