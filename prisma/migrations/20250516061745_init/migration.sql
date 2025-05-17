-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('Healthy', 'Injured', 'Recovering', 'Unknown');

-- CreateTable
CREATE TABLE "Horse" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "breed" TEXT NOT NULL,
    "healthStatus" "HealthStatus" NOT NULL DEFAULT 'Unknown',
    "owner" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Horse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Horse_owner_idx" ON "Horse"("owner");

-- CreateIndex
CREATE INDEX "Horse_healthStatus_idx" ON "Horse"("healthStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_email_idx" ON "Owner"("email");

-- AddForeignKey
ALTER TABLE "Horse" ADD CONSTRAINT "Horse_owner_fkey" FOREIGN KEY ("owner") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;
