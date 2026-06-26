import * as productRepository from "./product.repository";
import * as categoryRepository from "../category/category.repository";

/**
 * Generate a URL-friendly slug from a string.
 * @param {string} text
 * @returns {string}
 */
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start
    .replace(/-+$/, ""); // Trim - from end
};

/**
 * Get all products.
 */
export const getAllProducts = async (filters = {}) => {
  return productRepository.findAllProducts(filters);
};

/**
 * Get a single product by ID.
 */
export const getProductById = async (id) => {
  const product = await productRepository.findProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

/**
 * Get a single product by Slug.
 */
export const getProductBySlug = async (slug) => {
  const product = await productRepository.findProductBySlug(slug);
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
};

/**
 * Create a new product.
 */
export const createProduct = async (productData) => {
  const name = productData.name.trim();
  let slug = productData.slug ? productData.slug.trim() : "";
  const sku = productData.sku.trim();

  // 1. Validate category existence
  const category = await categoryRepository.findCategoryById(productData.category_id);
  if (!category) {
    throw new Error("Target category not found");
  }

  // 2. Generate slug if not provided
  if (!slug) {
    slug = generateSlug(name);
  }

  // 3. Ensure slug is unique
  const existingSlugProduct = await productRepository.findProductBySlug(slug);
  if (existingSlugProduct) {
    throw new Error(`Product with slug "${slug}" already exists`);
  }

  // 4. Ensure SKU is unique
  const allProducts = await productRepository.findAllProducts();
  const existingSkuProduct = allProducts.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
  if (existingSkuProduct) {
    throw new Error(`Product with SKU "${sku}" already exists`);
  }

  return productRepository.createProduct({
    ...productData,
    name,
    slug,
    sku,
  });
};

/**
 * Update an existing product.
 */
export const updateProduct = async (id, updateData) => {
  const targetProduct = await productRepository.findProductById(id);
  if (!targetProduct) {
    throw new Error("Product not found");
  }

  const finalUpdateData = { ...updateData };

  // 1. Validate category existence if changing category
  if (updateData.category_id !== undefined && updateData.category_id !== targetProduct.category_id.toString()) {
    const category = await categoryRepository.findCategoryById(updateData.category_id);
    if (!category) {
      throw new Error("Target category not found");
    }
  }

  // 2. Handle SKU uniqueness check
  if (updateData.sku !== undefined && updateData.sku.trim().toLowerCase() !== targetProduct.sku.toLowerCase()) {
    const allProducts = await productRepository.findAllProducts();
    const existingSkuProduct = allProducts.find(
      (p) => p.sku.toLowerCase() === updateData.sku.trim().toLowerCase() && p.id.toString() !== id.toString()
    );
    if (existingSkuProduct) {
      throw new Error(`Product with SKU "${updateData.sku}" already in use by another product`);
    }
    finalUpdateData.sku = updateData.sku.trim();
  }

  // 3. Handle slug uniqueness check
  if (updateData.slug !== undefined && updateData.slug.trim()) {
    const slugToCheck = updateData.slug.trim();
    if (slugToCheck !== targetProduct.slug) {
      const existingSlugProduct = await productRepository.findProductBySlug(slugToCheck);
      if (existingSlugProduct && existingSlugProduct.id.toString() !== id.toString()) {
        throw new Error(`Product with slug "${slugToCheck}" already in use by another product`);
      }
    }
    finalUpdateData.slug = slugToCheck;
  } else if (updateData.name !== undefined && updateData.name.trim() !== targetProduct.name) {
    // Generate new slug if name changed but slug not provided
    const newSlug = generateSlug(updateData.name.trim());
    if (newSlug !== targetProduct.slug) {
      const existingSlugProduct = await productRepository.findProductBySlug(newSlug);
      if (existingSlugProduct && existingSlugProduct.id.toString() !== id.toString()) {
        throw new Error(`Product with generated slug "${newSlug}" already in use by another product`);
      }
      finalUpdateData.slug = newSlug;
    }
  }

  return productRepository.updateProduct(id, finalUpdateData);
};

/**
 * Delete a product.
 */
export const deleteProduct = async (id) => {
  const targetProduct = await productRepository.findProductById(id);
  if (!targetProduct) {
    throw new Error("Product not found");
  }
  return productRepository.deleteProduct(id);
};

/**
 * Bulk create products.
 * @param {Array} productsArray
 * @returns {Promise<Array>}
 */
export const bulkCreateProducts = async (productsArray) => {
  if (!Array.isArray(productsArray)) {
    throw new Error("Input must be an array of products");
  }

  const slugsInBatch = new Set();
  const skusInBatch = new Set();
  const processedProducts = [];

  for (let i = 0; i < productsArray.length; i++) {
    const item = productsArray[i];
    const name = item.name?.trim();
    if (!name) {
      throw new Error(`Product item at index ${i} is missing a name`);
    }

    if (!item.sku || typeof item.sku !== "string" || item.sku.trim() === "") {
      throw new Error(`Product item at index ${i} is missing a SKU`);
    }
    const sku = item.sku.trim();

    if (skusInBatch.has(sku.toLowerCase())) {
      throw new Error(`Duplicate SKU "${sku}" detected in the bulk upload batch`);
    }
    skusInBatch.add(sku.toLowerCase());

    let slug = item.slug ? item.slug.trim() : "";
    if (!slug) {
      slug = generateSlug(name);
    }

    if (slugsInBatch.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" detected in the bulk upload batch`);
    }
    slugsInBatch.add(slug);

    if (item.category_id === undefined || item.category_id === null || item.category_id === "") {
      throw new Error(`Product item at index ${i} is missing category_id`);
    }

    processedProducts.push({
      category_id: item.category_id,
      name,
      slug,
      short_description: item.short_description || "",
      description: item.description || "",
      price: parseFloat(item.price) || 0.00,
      gst: item.gst !== undefined ? parseFloat(item.gst) : 0.00,
      quantity: parseInt(item.quantity, 10) || 0,
      sku,
      thumbnail_url: item.thumbnail_url || "",
      is_active: item.is_active !== undefined ? item.is_active : true,
      images: item.images || [],
    });
  }

  return productRepository.bulkCreateProducts(processedProducts);
};
