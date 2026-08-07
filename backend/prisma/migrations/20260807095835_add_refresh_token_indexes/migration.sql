-- CreateIndex
CREATE INDEX "RefreshToken_userId_expiredAt_idx" ON "RefreshToken"("userId", "expiredAt");
