-- DropIndex
DROP INDEX `products_name_idx` ON `products`;

-- CreateIndex
CREATE FULLTEXT INDEX `products_name_description_tags_idx` ON `products`(`name`, `description`, `tags`);
