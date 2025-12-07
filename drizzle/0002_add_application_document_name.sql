ALTER TABLE "application_document"
ADD COLUMN IF NOT EXISTS "name" text NOT NULL DEFAULT 'Document';

-- If the column was added with a default, drop it to match the schema (non-null, no default)
ALTER TABLE "application_document"
ALTER COLUMN "name" DROP DEFAULT;
