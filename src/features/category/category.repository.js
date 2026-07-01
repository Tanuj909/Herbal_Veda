import prisma from "@/lib/prisma";
import { getBufferFromUrlOrBase64 } from "../product/product.repository";

/**
 * Maps a database category model (with BLOB image column) to the expected API response format.
 * Converts image buffer to a base64 Data URL.
 * @param {Object} cat
 * @returns {Object|null}
 */
export const mapCategoryFromDb = (cat) => {
  if (!cat) return null;
  const mapped = { ...cat };

  if (mapped.image) {
    const mime = mapped.image_mime || "image/jpeg";
    mapped.image_url = `data:${mime};base64,${Buffer.from(mapped.image).toString("base64")}`;
  } else {
    mapped.image_url = null;
  }

  delete mapped.image;
  delete mapped.image_mime;

  if (mapped.parent) {
    mapped.parent = mapCategoryFromDb(mapped.parent);
  }
  if (mapped.children) {
    mapped.children = mapped.children.map(mapCategoryFromDb);
  }

  return mapped;
};

/**
 * Maps multiple database categories.
 * @param {Array} categories
 * @returns {Array}
 */
export const mapCategoriesFromDb = (categories) => {
  if (!categories) return categories;
  if (Array.isArray(categories)) {
    return categories.map(mapCategoryFromDb);
  }
  return mapCategoryFromDb(categories);
};

/**
 * Find a category by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findCategoryById = async (id) => {
  const cat = await prisma.category.findUnique({
    where: { id: BigInt(id) },
    include: {
      parent: true,
      children: true,
    },
  });
  return mapCategoryFromDb(cat);
};

/**
 * Find a category by its unique slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export const findCategoryBySlug = async (slug) => {
  const cat = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
    },
  });
  return mapCategoryFromDb(cat);
};

/**
 * Find all categories.
 * @param {Object} [filters]
 * @param {boolean} [filters.is_active] - Optional filter for active status
 * @returns {Promise<Array>}
 */
export const findAllCategories = async (filters = {}) => {
  const where = {};
  
  if (filters.is_active !== undefined) {
    where.is_active = filters.is_active;
  }

  const categories = await prisma.category.findMany({
    where,
    orderBy: {
      name: "asc",
    },
  });
  return mapCategoriesFromDb(categories);
};

/**
 * Create a new category.
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
export const createCategory = async (categoryData) => {
  const { name, slug, parent_id, is_active, description, image_url } = categoryData;
  
  const thumbResult = await getBufferFromUrlOrBase64(image_url);

  const data = {
    name,
    slug,
    description: description || null,
    image: thumbResult ? thumbResult.buffer : null,
    image_mime: thumbResult ? thumbResult.mimeType : null,
    is_active: is_active !== undefined ? is_active : true,
  };

  if (parent_id) {
    data.parent_id = BigInt(parent_id);
  }

  const category = await prisma.category.create({
    data,
  });
  return mapCategoryFromDb(category);
};

/**
 * Update an existing category.
 * @param {string|number|BigInt} id
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateCategory = async (id, updateData) => {
  const data = {};

  if (updateData.name !== undefined) data.name = updateData.name;
  if (updateData.slug !== undefined) data.slug = updateData.slug;
  if (updateData.description !== undefined) data.description = updateData.description;
  if (updateData.is_active !== undefined) data.is_active = updateData.is_active;

  if (updateData.parent_id !== undefined) {
    data.parent_id = updateData.parent_id ? BigInt(updateData.parent_id) : null;
  }

  if (updateData.image_url !== undefined) {
    const thumbResult = await getBufferFromUrlOrBase64(updateData.image_url);
    if (thumbResult) {
      data.image = thumbResult.buffer;
      data.image_mime = thumbResult.mimeType;
    } else if (updateData.image_url === "" || updateData.image_url === null) {
      data.image = null;
      data.image_mime = null;
    }
  }

  const category = await prisma.category.update({
    where: { id: BigInt(id) },
    data,
  });
  return mapCategoryFromDb(category);
};

/**
 * Delete a category.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object>}
 */
export const deleteCategory = async (id) => {
  return prisma.category.delete({
    where: { id: BigInt(id) },
  });
};

/**
 * Count the number of subcategories direct under this category.
 * @param {string|number|BigInt} categoryId
 * @returns {Promise<number>}
 */
export const countChildrenByCategoryId = async (categoryId) => {
  return prisma.category.count({
    where: {
      parent_id: BigInt(categoryId),
    },
  });
};

/**
 * Count the number of products belonging to this category.
 * @param {string|number|BigInt} categoryId
 * @returns {Promise<number>}
 */
export const countProductsByCategoryId = async (categoryId) => {
  return prisma.product.count({
    where: {
      category_id: BigInt(categoryId),
    },
  });
};

/**
 * Bulk create categories in a transaction.
 * @param {Array} categories
 * @returns {Promise<Array>}
 */
export const bulkCreateCategories = async (categories) => {
  return prisma.$transaction(async (tx) => {
    const results = [];
    for (const cat of categories) {
      let parent_id_bigint = null;
      if (cat.parent_id) {
        const parentId = BigInt(cat.parent_id);
        const parentCategory = await tx.category.findUnique({
          where: { id: parentId }
        });
        if (!parentCategory) {
          throw new Error(`Parent category with ID ${cat.parent_id} not found for category "${cat.name}"`);
        }
        parent_id_bigint = parentId;
      }

      const existing = await tx.category.findUnique({
        where: { slug: cat.slug }
      });
      if (existing) {
        throw new Error(`Category with slug "${cat.slug}" already exists`);
      }

      const thumbResult = await getBufferFromUrlOrBase64(cat.image_url);

      const created = await tx.category.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description || null,
          image: thumbResult ? thumbResult.buffer : null,
          image_mime: thumbResult ? thumbResult.mimeType : null,
          parent_id: parent_id_bigint,
          is_active: cat.is_active,
        }
      });
      results.push(mapCategoryFromDb(created));
    }
    return results;
  });
};
