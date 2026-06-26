import * as categoryRepository from "./category.repository";

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
 * Helper to recursively verify if a target category is a descendant of a category.
 * Used to prevent circular hierarchies.
 * @param {string|number|BigInt} parentCandidateId - The ID of the category being set as parent
 * @param {string|number|BigInt} categoryId - The ID of the category being updated
 * @returns {Promise<boolean>} - True if parentCandidateId is a descendant of categoryId
 */
const isDescendant = async (parentCandidateId, categoryId) => {
  let currentId = parentCandidateId;
  const targetId = BigInt(categoryId);

  while (currentId) {
    const currentCategory = await categoryRepository.findCategoryById(currentId);
    if (!currentCategory || !currentCategory.parent_id) {
      break;
    }
    
    if (BigInt(currentCategory.parent_id) === targetId) {
      return true;
    }
    
    currentId = currentCategory.parent_id;
  }
  
  return false;
};

/**
 * Format flat array of categories into a tree structure.
 * @param {Array} categories
 * @returns {Array}
 */
const buildCategoryTree = (categories) => {
  const map = {};
  const tree = [];

  // Convert categories to plain objects and map them by ID
  categories.forEach((cat) => {
    const idStr = cat.id.toString();
    map[idStr] = {
      id: idStr,
      name: cat.name,
      slug: cat.slug,
      parent_id: cat.parent_id ? cat.parent_id.toString() : null,
      is_active: cat.is_active,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
      children: [],
    };
  });

  // Build the hierarchical tree
  categories.forEach((cat) => {
    const idStr = cat.id.toString();
    const parentIdStr = cat.parent_id ? cat.parent_id.toString() : null;

    if (parentIdStr && map[parentIdStr]) {
      map[parentIdStr].children.push(map[idStr]);
    } else {
      // If there is no parent, or if parent is inactive (hence not present in the list)
      if (!parentIdStr) {
        tree.push(map[idStr]);
      }
    }
  });

  return tree;
};

/**
 * Create a new category.
 */
export const createCategory = async (categoryData) => {
  const name = categoryData.name.trim();
  let slug = categoryData.slug ? categoryData.slug.trim() : "";

  if (!slug) {
    slug = generateSlug(name);
  }

  // Ensure slug is unique
  const existingCategoryBySlug = await categoryRepository.findCategoryBySlug(slug);
  if (existingCategoryBySlug) {
    throw new Error(`Category slug '${slug}' is already in use`);
  }

  // Validate parent_id if provided
  if (categoryData.parent_id) {
    const parentCategory = await categoryRepository.findCategoryById(categoryData.parent_id);
    if (!parentCategory) {
      throw new Error(`Parent category with ID ${categoryData.parent_id} does not exist`);
    }
  }

  return categoryRepository.createCategory({
    name,
    slug,
    parent_id: categoryData.parent_id || null,
    is_active: categoryData.is_active,
  });
};

/**
 * Get category by ID or slug.
 */
export const getCategoryByIdOrSlug = async (idOrSlug) => {
  let category = null;

  // Try finding by ID if the input is a valid number/ID format
  if (/^\d+$/.test(idOrSlug.toString())) {
    category = await categoryRepository.findCategoryById(idOrSlug);
  }

  // Fallback to finding by slug
  if (!category) {
    category = await categoryRepository.findCategoryBySlug(idOrSlug);
  }

  if (!category) {
    throw new Error(`Category not found with identifier '${idOrSlug}'`);
  }

  return category;
};

/**
 * Fetch all categories (flat or tree representation).
 */
export const getAllCategories = async (options = {}) => {
  const includeInactive = options.includeInactive === true;
  const structure = options.structure || "flat";

  const filters = {};
  if (!includeInactive) {
    filters.is_active = true;
  }

  const categories = await categoryRepository.findAllCategories(filters);

  if (structure === "tree") {
    return buildCategoryTree(categories);
  }

  // For flat structure, return formatted objects (ensuring BigInt IDs are converted to strings)
  return categories.map((cat) => ({
    id: cat.id.toString(),
    name: cat.name,
    slug: cat.slug,
    parent_id: cat.parent_id ? cat.parent_id.toString() : null,
    is_active: cat.is_active,
    created_at: cat.created_at,
    updated_at: cat.updated_at,
  }));
};

/**
 * Update an existing category.
 */
export const updateCategory = async (id, updateData) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new Error(`Category not found`);
  }

  const preparedData = {};

  if (updateData.name !== undefined) {
    preparedData.name = updateData.name.trim();
  }

  // Handle Slug Update
  if (updateData.slug !== undefined && updateData.slug !== null) {
    const slug = updateData.slug.trim();
    if (slug !== category.slug) {
      const existingSlug = await categoryRepository.findCategoryBySlug(slug);
      if (existingSlug && BigInt(existingSlug.id) !== BigInt(id)) {
        throw new Error(`Category slug '${slug}' is already in use`);
      }
      preparedData.slug = slug;
    }
  }

  if (updateData.is_active !== undefined) {
    preparedData.is_active = updateData.is_active;
  }

  // Handle Parent Category Update
  if (updateData.parent_id !== undefined) {
    if (updateData.parent_id === null || updateData.parent_id === "") {
      preparedData.parent_id = null;
    } else {
      const parentId = BigInt(updateData.parent_id);
      
      // Cannot set self as parent
      if (parentId === BigInt(id)) {
        throw new Error("A category cannot be its own parent");
      }

      // Check if parent category exists
      const parentCategory = await categoryRepository.findCategoryById(parentId);
      if (!parentCategory) {
        throw new Error(`Parent category with ID ${parentId} does not exist`);
      }

      // Prevent circular reference: check if parentCandidate is a descendant of current category
      const isCircular = await isDescendant(parentId, id);
      if (isCircular) {
        throw new Error("Cannot set parent: this would create a circular hierarchy loop");
      }

      preparedData.parent_id = parentId;
    }
  }

  return categoryRepository.updateCategory(id, preparedData);
};

/**
 * Delete a category.
 */
export const deleteCategory = async (id) => {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) {
    throw new Error("Category not found");
  }

  // Check child subcategories constraint
  const childrenCount = await categoryRepository.countChildrenByCategoryId(id);
  if (childrenCount > 0) {
    throw new Error("Cannot delete category: it has active subcategories");
  }

  // Check associated products constraint
  const productsCount = await categoryRepository.countProductsByCategoryId(id);
  if (productsCount > 0) {
    throw new Error("Cannot delete category: it has associated products");
  }

  return categoryRepository.deleteCategory(id);
};

/**
 * Bulk create categories.
 * @param {Array} categoriesArray
 * @returns {Promise<Array>}
 */
export const bulkCreateCategories = async (categoriesArray) => {
  if (!Array.isArray(categoriesArray)) {
    throw new Error("Input must be an array of categories");
  }

  const slugsInBatch = new Set();
  const processedCategories = [];

  for (let i = 0; i < categoriesArray.length; i++) {
    const item = categoriesArray[i];
    const name = item.name?.trim();
    if (!name) {
      throw new Error(`Category item at index ${i} is missing a name`);
    }

    let slug = item.slug ? item.slug.trim() : "";
    if (!slug) {
      slug = generateSlug(name);
    }

    if (slugsInBatch.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" detected in the bulk upload batch`);
    }
    slugsInBatch.add(slug);

    processedCategories.push({
      name,
      slug,
      parent_id: item.parent_id || null,
      is_active: item.is_active !== undefined ? item.is_active : true,
    });
  }

  return categoryRepository.bulkCreateCategories(processedCategories);
};
