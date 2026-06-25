import prisma from "@/lib/prisma";

/**
 * Find a category by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findCategoryById = async (id) => {
  return prisma.category.findUnique({
    where: { id: BigInt(id) },
    include: {
      parent: true,
      children: true,
    },
  });
};

/**
 * Find a category by its unique slug.
 * @param {string} slug
 * @returns {Promise<Object|null>}
 */
export const findCategoryBySlug = async (slug) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: true,
    },
  });
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

  return prisma.category.findMany({
    where,
    orderBy: {
      name: "asc",
    },
  });
};

/**
 * Create a new category.
 * @param {Object} categoryData
 * @param {string} categoryData.name
 * @param {string} categoryData.slug
 * @param {string|number|BigInt|null} [categoryData.parent_id]
 * @param {boolean} [categoryData.is_active]
 * @returns {Promise<Object>}
 */
export const createCategory = async (categoryData) => {
  const { name, slug, parent_id, is_active } = categoryData;
  
  const data = {
    name,
    slug,
    is_active: is_active !== undefined ? is_active : true,
  };

  if (parent_id) {
    data.parent_id = BigInt(parent_id);
  }

  return prisma.category.create({
    data,
  });
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
  if (updateData.is_active !== undefined) data.is_active = updateData.is_active;

  if (updateData.parent_id !== undefined) {
    data.parent_id = updateData.parent_id ? BigInt(updateData.parent_id) : null;
  }

  return prisma.category.update({
    where: { id: BigInt(id) },
    data,
  });
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
