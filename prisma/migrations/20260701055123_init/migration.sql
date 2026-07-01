/*
  Warnings:

  - You are about to drop the column `image_url` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `product_images` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_url` on the `products` table. All the data in the column will be lost.
  - Added the required column `image` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` DROP COLUMN `image_url`,
    ADD COLUMN `image` LONGBLOB NULL,
    ADD COLUMN `image_mime` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `product_images` DROP COLUMN `image_url`,
    ADD COLUMN `image` LONGBLOB NOT NULL,
    ADD COLUMN `image_mime` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `thumbnail_url`,
    ADD COLUMN `thumbnail` LONGBLOB NULL,
    ADD COLUMN `thumbnail_mime` VARCHAR(100) NULL;
