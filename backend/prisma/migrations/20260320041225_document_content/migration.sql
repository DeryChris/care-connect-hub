-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "filename" SET DEFAULT '',
ALTER COLUMN "file_path" SET DEFAULT '',
ALTER COLUMN "size" SET DEFAULT '0 B',
ALTER COLUMN "mime_type" SET DEFAULT 'text/markdown';
