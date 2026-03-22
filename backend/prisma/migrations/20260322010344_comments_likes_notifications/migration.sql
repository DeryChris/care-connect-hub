-- CreateIndex
CREATE INDEX "ContentComment_parent_id_idx" ON "ContentComment"("parent_id");

-- AddForeignKey
ALTER TABLE "ContentComment" ADD CONSTRAINT "ContentComment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ContentComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
