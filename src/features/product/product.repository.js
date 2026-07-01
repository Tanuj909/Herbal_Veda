import prisma from "@/lib/prisma";

/**
 * Parses a Base64 Data URL into its MIME type and binary buffer.
 * @param {string} dataUrl
 * @returns {Object|null}
 */
const parseDataUrl = (dataUrl) => {
  if (!dataUrl || !dataUrl.startsWith("data:")) return null;
  const matches = dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches) return null;
  return {
    mimeType: matches[1],
    buffer: Buffer.from(matches[2], "base64"),
  };
};

/**
 * Gets image buffer and MIME type from a URL or a Base64 string.
 * @param {string} str
 * @returns {Promise<Object|null>}
 */
export const getBufferFromUrlOrBase64 = async (str) => {
  if (!str || typeof str !== "string") return null;
  if (str.startsWith("data:")) {
    const parsed = parseDataUrl(str);
    return parsed || null;
  }
  if (str.startsWith("http://") || str.startsWith("https://")) {
    try {
      const res = await fetch(str);
      if (!res.ok) throw new Error(`HTTP status ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const contentType = res.headers.get("content-type") || "image/jpeg";
      return {
        mimeType: contentType,
        buffer: Buffer.from(arrayBuffer),
      };
    } catch (err) {
      console.error("Failed to fetch image from URL:", str, err);
      return null;
    }
  }
  return null;
};

/**
 * Maps a database product model (with BLOB Bytes fields) to the expected API response format.
 * Converts thumbnail and image buffers to base64 Data URLs.
 * @param {Object} product
 * @returns {Object|null}
 */
export const mapProductFromDb = (product) => {
  if (!product) return null;
  const mapped = { ...product };

  if (mapped.thumbnail) {
    const mime = mapped.thumbnail_mime || "image/jpeg";
    mapped.thumbnail_url = `data:${mime};base64,${Buffer.from(mapped.thumbnail).toString("base64")}`;
  } else {
    mapped.thumbnail_url = null;
  }

  if (mapped.images) {
    mapped.images = mapped.images.map((img) => {
      const mappedImg = { ...img };
      if (mappedImg.image) {
        const mime = mappedImg.image_mime || "image/jpeg";
        mappedImg.image_url = `data:${mime};base64,${Buffer.from(mappedImg.image).toString("base64")}`;
      } else {
        mappedImg.image_url = null;
      }
      delete mappedImg.image;
      return mappedImg;
    });
  }

  delete mapped.thumbnail;
  return mapped;
};

/**
 * Maps multiple database products.
 * @param {Array} products
 * @returns {Array}
 */
export const mapProductsFromDb = (products) => {
  if (!products) return products;
  if (Array.isArray(products)) {
    return products.map(mapProductFromDb);
  }
  return mapProductFromDb(products);
};

/**
 * Find a product by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findProductById = async (id) => {
  const product = await prisma.product.findUnique({
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
  return mapProductFromDb(product);
};

/**
 * Find a product by its unique slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export const findProductBySlug = async (slug) => {
  const product = await prisma.product.findUnique({
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
  return mapProductFromDb(product);
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

  const products = await prisma.product.findMany({
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
  return mapProductsFromDb(products);
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

  const thumbResult = await getBufferFromUrlOrBase64(finalThumbnailUrl);

  const resolvedImages = [];
  for (const img of finalImages) {
    const imgStr = img.image_url || img;
    const res = await getBufferFromUrlOrBase64(imgStr);
    if (res) {
      resolvedImages.push({
        buffer: res.buffer,
        mimeType: res.mimeType,
        display_order: img.display_order !== undefined ? img.display_order : undefined,
      });
    }
  }

  const product = await prisma.product.create({
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
      thumbnail: thumbResult ? thumbResult.buffer : null,
      thumbnail_mime: thumbResult ? thumbResult.mimeType : null,
      is_active: is_active !== undefined ? is_active : true,
      images: {
        create: resolvedImages.map((img, idx) => ({
          image: img.buffer,
          image_mime: img.mimeType,
          display_order: img.display_order !== undefined ? img.display_order : idx,
        })),
      },
    },
    include: {
      category: true,
      images: true,
    },
  });

  return mapProductFromDb(product);
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
        include: { images: true },
      });
      finalImages = currentProduct?.images.map(img => {
        const mime = img.image_mime || "image/jpeg";
        return `data:${mime};base64,${Buffer.from(img.image).toString("base64")}`;
      }) || [];
    }

    if (finalThumbnailUrl === undefined) {
      const currentProduct = await prisma.product.findUnique({
        where: { id: BigInt(id) },
      });
      if (currentProduct?.thumbnail) {
        const mime = currentProduct.thumbnail_mime || "image/jpeg";
        finalThumbnailUrl = `data:${mime};base64,${Buffer.from(currentProduct.thumbnail).toString("base64")}`;
      } else {
        finalThumbnailUrl = "";
      }
    }

    // Now check sync
    if (finalImages.length === 0 && finalThumbnailUrl) {
      finalImages = [finalThumbnailUrl];
    } else if (finalImages.length > 0 && !finalThumbnailUrl) {
      const firstImg = finalImages[0];
      finalThumbnailUrl = firstImg.image_url || firstImg;
    }

    const thumbResult = await getBufferFromUrlOrBase64(finalThumbnailUrl);
    if (thumbResult) {
      data.thumbnail = thumbResult.buffer;
      data.thumbnail_mime = thumbResult.mimeType;
    } else if (finalThumbnailUrl === "") {
      data.thumbnail = null;
      data.thumbnail_mime = null;
    }

    const resolvedImages = [];
    for (const img of finalImages) {
      const imgStr = img.image_url || img;
      const res = await getBufferFromUrlOrBase64(imgStr);
      if (res) {
        resolvedImages.push({
          buffer: res.buffer,
          mimeType: res.mimeType,
          display_order: img.display_order !== undefined ? img.display_order : undefined,
        });
      }
    }

    await prisma.productImage.deleteMany({
      where: { product_id: BigInt(id) },
    });

    data.images = {
      create: resolvedImages.map((img, idx) => ({
        image: img.buffer,
        image_mime: img.mimeType,
        display_order: img.display_order !== undefined ? img.display_order : idx,
      })),
    };
  }

  const updatedProduct = await prisma.product.update({
    where: { id: BigInt(id) },
    data,
    include: {
      category: true,
      images: true,
    },
  });

  return mapProductFromDb(updatedProduct);
};

/**
 * Delete a product.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object>}
 */
export const deleteProduct = async (id) => {
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
        where: { id: BigInt(prod.category_id) },
      });
      if (!category) {
        throw new Error(`Category ID ${prod.category_id} not found for product "${prod.name}"`);
      }

      // 2. Verify slug uniqueness
      const existingSlug = await tx.product.findUnique({
        where: { slug: prod.slug },
      });
      if (existingSlug) {
        throw new Error(`Product with slug "${prod.slug}" already exists`);
      }

      // 3. Verify SKU uniqueness
      const existingSku = await tx.product.findUnique({
        where: { sku: prod.sku },
      });
      if (existingSku) {
        throw new Error(`Product with SKU "${prod.sku}" already exists`);
      }

      const thumbResult = await getBufferFromUrlOrBase64(prod.thumbnail_url);

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
          thumbnail: thumbResult ? thumbResult.buffer : null,
          thumbnail_mime: thumbResult ? thumbResult.mimeType : null,
          is_active: prod.is_active,
        },
        include: {
          category: true,
          images: true,
        },
      });
      results.push(mapProductFromDb(newProduct));
    }
    return results;
  });
};

