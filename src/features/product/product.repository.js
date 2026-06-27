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
    gst,
    quantity,
    sku,
    thumbnail_url,
    is_active,
    images = [],
  } = productData;

  // Align images list and thumbnail_url
  let finalImages = [...images];
  if (finalImages.length === 0 && thumbnail_url) {
    finalImages.push(thumbnail_url);
  }

  let finalThumbnailUrl = thumbnail_url;
  if (!finalThumbnailUrl && finalImages.length > 0) {
    const firstImg = finalImages[0];
    finalThumbnailUrl = firstImg.image_url || firstImg;
  }

  return prisma.product.create({
    data: {
      category_id: BigInt(category_id),
      name,
      slug,
      short_description,
      description,
      price,
      gst: gst !== undefined ? gst : 0,
      quantity: parseInt(quantity, 10),
      sku,
      thumbnail_url: finalThumbnailUrl || "",
      is_active: is_active !== undefined ? is_active : true,
      images: {
        create: finalImages.map((img, idx) => ({
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
    gst,
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
  if (gst !== undefined) data.gst = gst;
  if (quantity !== undefined) data.quantity = parseInt(quantity, 10);
  if (sku !== undefined) data.sku = sku;
  if (is_active !== undefined) data.is_active = is_active;

  // Let's synchronize thumbnail_url and images
  let finalThumbnailUrl = thumbnail_url;
  let finalImages = images;

  if (finalImages !== undefined || finalThumbnailUrl !== undefined) {
    if (finalImages === undefined) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: BigInt(id) },
        include: { images: true }
      });
      finalImages = currentProduct?.images.map(img => img.image_url) || [];
    }

    if (finalThumbnailUrl === undefined) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: BigInt(id) }
      });
      finalThumbnailUrl = currentProduct?.thumbnail_url || "";
    }

    // Now check sync
    if (finalImages.length === 0 && finalThumbnailUrl) {
      finalImages = [finalThumbnailUrl];
    } else if (finalImages.length > 0 && !finalThumbnailUrl) {
      const firstImg = finalImages[0];
      finalThumbnailUrl = firstImg.image_url || firstImg;
    }

    await prisma.productImage.deleteMany({
      where: { product_id: BigInt(id) },
    });

    data.images = {
      create: finalImages.map((img, idx) => ({
        image_url: img.image_url || img,
        display_order: img.display_order !== undefined ? img.display_order : idx,
      })),
    };

    data.thumbnail_url = finalThumbnailUrl;
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

/**
 * Bulk create products in a transaction.
 * @param {Array} products
 * @returns {Promise<Array>}
 */
export const bulkCreateProducts = async (products) => {
  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const prod of products) {
      // 1. Verify category existence
      const category = await tx.category.findUnique({
        where: { id: BigInt(prod.category_id) }
      });
      if (!category) {
        throw new Error(`Category ID ${prod.category_id} not found for product "${prod.name}"`);
      }

      // 2. Verify slug uniqueness
      const existingSlug = await tx.product.findUnique({
        where: { slug: prod.slug }
      });
      if (existingSlug) {
        throw new Error(`Product with slug "${prod.slug}" already exists`);
      }

      // 3. Verify SKU uniqueness
      const existingSku = await tx.product.findUnique({
        where: { sku: prod.sku }
      });
      if (existingSku) {
        throw new Error(`Product with SKU "${prod.sku}" already exists`);
      }

      // Let's align images list and thumbnail_url
      let finalImages = prod.images ? [...prod.images] : [];
      if (finalImages.length === 0 && prod.thumbnail_url) {
        finalImages.push(prod.thumbnail_url);
      }

      let finalThumbnailUrl = prod.thumbnail_url;
      if (!finalThumbnailUrl && finalImages.length > 0) {
        const firstImg = finalImages[0];
        finalThumbnailUrl = firstImg.image_url || firstImg;
      }

      // 4. Create Product
      const newProduct = await tx.product.create({
        data: {
          category_id: BigInt(prod.category_id),
          name: prod.name,
          slug: prod.slug,
          short_description: prod.short_description,
          description: prod.description,
          price: prod.price,
          gst: prod.gst,
          quantity: prod.quantity,
          sku: prod.sku,
          thumbnail_url: finalThumbnailUrl || "",
          is_active: prod.is_active,
          images: {
            create: finalImages.map((img, idx) => ({
              image_url: img.image_url || img,
              display_order: img.display_order !== undefined ? img.display_order : idx,
            })),
          },
        },
        include: {
          category: true,
          images: true,
        }
      });
      results.push(newProduct);
    }
    return results;
  });
};
