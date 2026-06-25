import prisma from "@/lib/prisma";

/**
 * Find a product by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findProductById = async (id) => {
  return prisma.product.findUnique({
    where: { id: BigInt(id) },
    include: {
      category: true,
      images: {
        orderBy: {
          display_order: "asc",
        },
      },
    },
  });
};

/**
 * Find a product by its unique slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export const findProductBySlug = async (slug) => {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: {
          display_order: "asc",
        },
      },
    },
  });
};

/**
 * Find all products with optional filters.
 * @param {Object} [filters]
 * @param {boolean} [filters.is_active] - Filter by active status
 * @param {string|number|BigInt} [filters.category_id] - Filter by category
 * @param {string} [filters.search] - Search by name, description, or SKU
 * @returns {Promise<Array>}
 */
export const findAllProducts = async (filters = {}) => {
  const where = {};

  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }

  if (filters.category_id !== undefined) {
    where.category_id = BigInt(filters.category_id);
  }

  if (filters.search) {
    const searchString = filters.search.trim();
    where.OR = [
      { name: { contains: searchString } },
      { sku: { contains: searchString } },
      { short_description: { contains: searchString } },
    ];
  }

  return prisma.product.findMany({
    where,
    include: {
      category: true,
      images: {
        orderBy: {
          display_order: "asc",
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

/**
 * Create a new product.
 * @param {Object} productData
 * @returns {Promise<Object>}
 */
export const createProduct = async (productData) => {
  const {
    category_id,
    name,
    slug,
    short_description,
    description,
    price,
    quantity,
    sku,
    thumbnail_url,
    is_active,
    images = [],
  } = productData;

  return prisma.product.create({
    data: {
      category_id: BigInt(category_id),
      name,
      slug,
      short_description,
      description,
      price,
      quantity: parseInt(quantity, 10),
      sku,
      thumbnail_url,
      is_active: is_active !== undefined ? is_active : true,
      images: {
        create: images.map((img, idx) => ({
          image_url: img.image_url || img,
          display_order: img.display_order !== undefined ? img.display_order : idx,
        })),
      },
    },
    include: {
      category: true,
      images: true,
    },
  });
};

/**
 * Update an existing product.
 * @param {string|number|BigInt} id
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateProduct = async (id, updateData) => {
  const {
    category_id,
    name,
    slug,
    short_description,
    description,
    price,
    quantity,
    sku,
    thumbnail_url,
    is_active,
    images,
  } = updateData;

  const data = {};

  if (category_id !== undefined) data.category_id = BigInt(category_id);
  if (name !== undefined) data.name = name;
  if (slug !== undefined) data.slug = slug;
  if (short_description !== undefined) data.short_description = short_description;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;
  if (quantity !== undefined) data.quantity = parseInt(quantity, 10);
  if (sku !== undefined) data.sku = sku;
  if (thumbnail_url !== undefined) data.thumbnail_url = thumbnail_url;
  if (is_active !== undefined) data.is_active = is_active;

  // For simplicity, if new images are provided, delete previous images first and create new ones
  if (images !== undefined) {
    await prisma.productImage.deleteMany({
      where: { product_id: BigInt(id) },
    });

    data.images = {
      create: images.map((img, idx) => ({
        image_url: img.image_url || img,
        display_order: img.display_order !== undefined ? img.display_order : idx,
      })),
    };
  }

  return prisma.product.update({
    where: { id: BigInt(id) },
    data,
    include: {
      category: true,
      images: true,
    },
  });
};

/**
 * Delete a product.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object>}
 */
export const deleteProduct = async (id) => {
  // ProductImages will be cascade deleted due to onDelete: Cascade in Prisma schema
  return prisma.product.delete({
    where: { id: BigInt(id) },
  });
};

/**
 * Count total products.
 * @returns {Promise<number>}
 */
export const countProducts = async () => {
  return prisma.product.count();
};
