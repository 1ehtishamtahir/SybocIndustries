/*
  Warnings:

  - You are about to drop the column `fitting` on the `product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `navigationitem` ADD COLUMN `isCta` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `product` DROP COLUMN `fitting`,
    ADD COLUMN `colors` JSON NULL,
    ADD COLUMN `details` JSON NULL,
    ADD COLUMN `note` VARCHAR(191) NULL;
