-- AlterEnum
CREATE TYPE "RefCategory_new" AS ENUM ('software', 'ai', 'ui', 'open_source', 'content', 'problem_solving', 'life', 'misc');

ALTER TABLE "ProRef" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "ProRef" ALTER COLUMN "category" TYPE "RefCategory_new" USING (
  CASE "category"::text
    WHEN 'health' THEN 'misc'
    ELSE "category"::text
  END::"RefCategory_new"
);

DROP TYPE "RefCategory";
ALTER TYPE "RefCategory_new" RENAME TO "RefCategory";
