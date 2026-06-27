/**
 * Validate input for creating a category.
 * @param {Object} data - The request body data.
 * @returns {Object} { isValid, errors }
 */
export const validateCreateCategory = (data) => {
  const errors = {};
  const { name, slug, parent_id, is_active, description, image_url } = data;

  // Validate Name
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.name = "Category name is required";
  } else if (name.length > 100) {
    errors.name = "Category name cannot exceed 100 characters";
  }

  // Validate Slug if provided
  if (slug !== undefined && slug !== null) {
    if (typeof slug !== "string" || slug.trim() === "") {
      errors.slug = "Slug must be a non-empty string";
    } else if (slug.length > 150) {
      errors.slug = "Slug cannot exceed 150 characters";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Invalid slug format. Use lowercase alphanumeric characters and hyphens (e.g. herbal-teas)";
    }
  }

  // Validate Description if provided
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      errors.description = "Description must be a string";
    }
  }

  // Validate Image URL if provided
  if (image_url !== undefined && image_url !== null && image_url !== "") {
    if (typeof image_url !== "string") {
      errors.image_url = "Image URL must be a string";
    } else if (image_url.length > 255) {
      errors.image_url = "Image URL cannot exceed 255 characters";
    }
  }

  // Validate Parent ID if provided
  if (parent_id !== undefined && parent_id !== null && parent_id !== "") {
    const parentIdNum = Number(parent_id);
    if (isNaN(parentIdNum) || parentIdNum <= 0 || !Number.isInteger(parentIdNum)) {
      errors.parent_id = "Parent ID must be a valid positive integer";
    }
  }

  // Validate Is Active if provided
  if (is_active !== undefined && is_active !== null) {
    if (typeof is_active !== "boolean") {
      errors.is_active = "is_active must be a boolean value";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate input for updating a category.
 * @param {Object} data - The request body data.
 * @returns {Object} { isValid, errors }
 */
export const validateUpdateCategory = (data) => {
  const errors = {};
  const { name, slug, parent_id, is_active, description, image_url } = data;

  // Validate Name if provided
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      errors.name = "Category name cannot be empty";
    } else if (name.length > 100) {
      errors.name = "Category name cannot exceed 100 characters";
    }
  }

  // Validate Slug if provided
  if (slug !== undefined && slug !== null) {
    if (typeof slug !== "string" || slug.trim() === "") {
      errors.slug = "Slug cannot be empty";
    } else if (slug.length > 150) {
      errors.slug = "Slug cannot exceed 150 characters";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Invalid slug format. Use lowercase alphanumeric characters and hyphens";
    }
  }

  // Validate Description if provided
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") {
      errors.description = "Description must be a string";
    }
  }

  // Validate Image URL if provided
  if (image_url !== undefined && image_url !== null) {
    if (typeof image_url !== "string") {
      errors.image_url = "Image URL must be a string";
    } else if (image_url.length > 255) {
      errors.image_url = "Image URL cannot exceed 255 characters";
    }
  }

  // Validate Parent ID if provided
  if (parent_id !== undefined && parent_id !== null && parent_id !== "") {
    const parentIdNum = Number(parent_id);
    if (isNaN(parentIdNum) || parentIdNum <= 0 || !Number.isInteger(parentIdNum)) {
      errors.parent_id = "Parent ID must be a valid positive integer";
    }
  }

  // Validate Is Active if provided
  if (is_active !== undefined && is_active !== null) {
    if (typeof is_active !== "boolean") {
      errors.is_active = "is_active must be a boolean value";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};