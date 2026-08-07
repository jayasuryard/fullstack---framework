-- AlterTable + FK: deleting a User now cascades to their refresh tokens
-- (previously RESTRICT — user deletion or test cleanup died on the FK).
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey",
ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
