# Agent Guidelines For This Project

This file documents the principles and conventions that apply to this repository.  
Any future automated changes (by tools or agents) must respect these rules.

## Architecture Overview

- Next.js App Router application (in `src/app`), with route groups:
  - `(main)` for public pages (welcome, FAQ, etc.).
  - `(application)` for the applicant flow (`/apply`, `/apply/[application_id]`, etc.).
  - `(auth)` for the login gateway.
  - `(admin)` for the admin interface.
- Data access is via **Drizzle ORM** (`src/server/db.ts`, `src/server/db/schema.ts`) against PostgreSQL with migrations driven by `drizzle.config.ts` and the `drizzle/` directory.
- Application data and metadata shapes live in `src/types/application-data.ts`; prefer these shared `ApplicationData`, `ApplicationMeta`, and `NormalizedApplication` aliases whenever you read or write applicant records so the loose JSON payloads remain typed.
- Application rows now store data and meta in dedicated columns (no JSON `data`/`meta` fields), and IDs are generated with **cuid2** (`@paralleldrive/cuid2`):
  - Data columns: `first_name`, `last_name`, `birth_date`, `who_are_you`, `phone_numbers`, `country`, `city`, `where_are_you`, `has_id_cart_or_passport`, `id_cart_or_passport_or_receipt`, `high_school_over`, `high_school_gce_ol_probatoir_date`, `high_school_gce_ol_probatoire_certificates`, `high_school_gce_al_bac_date`, `high_school_gce_al_bac_certificates`, `university_student`, `university_start_date`, `university_end_date`, `university_certificates`.
  - Meta columns: `meta_invited_statuses`, `meta_document_statuses`, `meta_document_comments`.
  - Always convert between DB rows and typed shapes via `src/server/application-normalizer.ts` (`buildApplicationData`, `buildApplicationMeta`, `mapApplicationDataToColumns`); do not reintroduce JSON blobs.
- Keep controllers thin: tRPC routers should delegate business rules to service modules and persistence to repositories; keep mapping/coercion helpers in shared utilities (e.g., `application-normalizer.ts`).
- Application relations are normalized (all PKs use cuid2 defaults):
  - `application_program_choice`: program selection, rank, campus/start term/study mode/funding.
  - `application_education`: education entries by type (GCE_OL, GCE_AL, BAC, PROBATOIRE, BTS, BACHELOR, OTHER), with session year, candidate number, status, dates, GPA, etc.
  - `application_document`: per-document rows with kind, status, reviewer comment; can link to an education row.
  - `application_phone`: per phone with kind (PRIMARY/SECONDARY/GUARDIAN/OTHER) and call flags.
  - `application_consent`: per-consent records.
  - `application_status_history`: status transitions with actor.
- Applicant edit guardrails: applicants may update only when status is `INIT` or `NEED_APPLICANT_INTERVENTION`; other statuses forbid applicant-side updates.
- Application status enum includes `NEED_APPLICANT_INTERVENTION` (surface this in UI/status mapping).
- **tRPC** is the single backend API surface:
  - Server router at `src/server/api/*` and `src/app/api/trpc/[trpc]/route.ts`.
  - Shared tRPC clients:
    - React/Query-based client in `src/trpc/react.tsx`.
    - Generic proxy client in `src/trpc/client.ts` (used by React Admin dataProvider and authProvider).
- Authentication is handled by **Better Auth**:
- Configured in `src/server/auth/better-auth.ts` with the Drizzle adapter.
  - Uses **magic-link** as the only login mechanism (email-based, one-time link).
  - Uses **multi-session** plugin to allow multiple active sessions per user.
  - Session lifetime is ~30 minutes (`expiresIn` and `updateAge` set to 30 minutes, not longer).
  - tRPC `protectedProcedure` relies on Better Auth sessions via `createTRPCContext`.
- Admin UI is built with **React Admin**:
  - Mounted under `(admin)/applications`.
  - Uses a tRPC-backed `dataProvider` (`src/admin/dataProvider/trpcDataProvider.ts`).
  - Uses a Better Auth + tRPC-based `authProvider` (`src/admin/authProvider.ts`) that:
    - Logs in via magic link.
    - Authorizes based on the `ADMIN` role using `trpcClient.auth.me`.
- Email sending is centralized:
  - `src/server/nodemailer.ts` defines the shared Nodemailer transporter.
  - `src/server/mails/send.tsx` builds `SendMailOptions` using React Email templates in `src/components/emails/*`.
  - Magic-link login emails use the `MagicLinkEmail` component (`src/components/emails/magic-link.tsx`).

## Naming & Coding Conventions

These conventions must be followed for all new or modified code:

- **File names**
  - Use **kebab-case** for all new files, including components and utilities.
  - Examples:
    - `magic-link-email.tsx`
    - `application-list.tsx`
    - `admin-auth-provider.ts`
  - Existing non–kebab-case files should be left as-is unless explicitly refactoring for naming consistency.

- **Variables, functions, and components**
  - Use **camelCase** for:
    - Variables.
    - Functions (including React components).
  - Even though React commonly uses PascalCase for components, this project standardizes on camelCase for all identifiers.
  - Examples:
    - `const latestApplications = ...`
    - `function applicationList(props) { ... }`
    - `export const adminAuthProvider = { ... }`

- **Imports & paths**
- Prefer path aliases defined in `tsconfig.json`:
  - `@app/*` for `src/*`.
  - Reuse existing helper modules instead of creating new variants:
    - Use `src/trpc/client.ts` for non-hook tRPC calls (e.g., React Admin).
    - Use `src/trpc/react.tsx` for hook-based access in React components.

## Auth & Security Principles

- No Keycloak or NextAuth usage remains in the codebase; all auth must go through Better Auth.
- All privileged operations (admin actions, mail sending, etc.) must:
  - Use tRPC `protectedProcedure`.
  - Check for appropriate roles (e.g., `ADMIN`) where relevant.
- Magic-link login:
  - Is the primary login mechanism for both applicants and admins.
  - Must send real emails using the shared Nodemailer transporter, via the helper in `src/server/mails/send.tsx`.

## React Admin Usage

- React Admin must:
  - Use the tRPC-based `dataProvider` for all backend access (no raw REST calls).
  - Use the Better Auth–backed `authProvider` for authorization.
  - Implement the full RA dataProvider surface (list/show/create/update/delete/bulk) with proper filter/sort/pagination mapping to tRPC; avoid hardcoded grouping in the provider.
- New resources (e.g., future admin entities) should:
  - Add React Admin resource components in `src/admin/resources/*` (kebab-case filenames).
  - Keep React components/exports camelCase even in RA views.
  - Add corresponding tRPC procedures in `src/server/api/routers/*` and wire them to the shared `dataProvider` via the domain/service layer.

## Form Handling Principles

- The legacy Formik-based forms are being phased out.
- For new forms:
  - Prefer non-Formik solutions (e.g., simple controlled components + Zod, or react-hook-form if introduced explicitly).
  - Keep validation logic in Zod schemas where possible.
- Do not add new Formik usages; migrate existing Formik forms to the chosen approach before removing the dependency.

## Applicant Form & Documents

- The apply wizard keeps the current step in the `step` query param using **nuqs**. Do not remove this; use `useQueryState` with the existing enum of step ids.
- The program step has no inputs or validation; it should never block navigation.
- For date fields stored as Drizzle `date` columns, ensure values are real `Date` objects (not strings) before validation/submission.
- Documents:
  - The `application_document` table requires a non-null `name` column; keep it in the schema/migrations.
  - The UI no longer asks for a document name. When saving, derive `name` from the uploaded file name or the document `kind` and send `publicUrl` from the upload.
  - If linking a document to an education, send `null` for `educationId` when empty—never an empty string.
- Final submission must move applications out of `DRAFT` to `INIT` (and record status history); do not leave submitted applications in draft.

## When Editing This Repo

- Respect the existing architecture and routes; avoid introducing parallel stacks (e.g., no additional REST backends).
- Prefer small, focused changes aligned with this document.
- Before using a new library or pattern, verify it fits with:
  - Better Auth for auth.
  - tRPC for backend calls.
  - Drizzle for data access.
- Keep MVC-style separation: views stay in UI components, controllers stay in tRPC routers, business rules live in services, and persistence/mapping stay in repositories/normalizers.

## Database & Migrations

- Migrations runner container is defined at `companions/migrations/Dockerfile` and `companions/migrations/entrypoint.sh`; it uses `yarn drizzle-kit migrate` (no Prisma) and requires `DATABASE_URL` at runtime. Build with `docker build -f companions/migrations/Dockerfile -t gis-migrations .` and run with `docker run --rm -e DATABASE_URL=... gis-migrations`.

## File Uploads & Storage

- File uploads use MinIO/S3 via `useUploadFile` and presigned PUTs.
- Stored objects are placed under `users/{userId}/...` and referenced by `publicUrl`.
- Image previews must use `SignedImage` (`src/components/signed-image.tsx`), which fetches a presigned GET URL via `upload.getViewUrl` tRPC procedure; do not render raw `publicUrl` directly in `<Image>`.
