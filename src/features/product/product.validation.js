/**
 * Validate input for creating a product.
 * @param {Object} data - The request body data.
 * @returns {Object} { isValid, errors }
 */
export const validateCreateProduct = (data) => {
  const errors = {};
  const {
    category_id,
    name,
    slug,
    price,
    quantity,
    sku,
    thumbnail_url,
    is_active,
  } = data;

  // Validate Category ID
  if (category_id === undefined || category_id === null || category_id === "") {
    errors.category_id = "Category is required";
  } else {
    const categoryIdNum = Number(category_id);
    if (isNaN(categoryIdNum) || categoryIdNum <= 0 || !Number.isInteger(categoryIdNum)) {
      errors.category_id = "Category ID must be a valid positive integer";
    }
  }

  // Validate Name
  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.name = "Product name is required";
  } else if (name.length > 255) {
    errors.name = "Product name cannot exceed 255 characters";
  }

  // Validate Slug if provided
  if (slug !== undefined && slug !== null && slug !== "") {
    if (typeof slug !== "string") {
      errors.slug = "Slug must be a string";
    } else if (slug.length > 255) {
      errors.slug = "Slug cannot exceed 255 characters";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Invalid slug format. Use lowercase alphanumeric characters and hyphens";
    }
  }

  // Validate Price
  if (price === undefined || price === null || price === "") {
    errors.price = "Price is required";
  } else {
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = "Price must be a valid non-negative number";
    }
  }

  // Validate Quantity
  if (quantity === undefined || quantity === null || quantity === "") {
    errors.quantity = "Quantity is required";
  } else {
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum < 0 || !Number.isInteger(quantityNum)) {
      errors.quantity = "Quantity must be a valid non-negative integer";
    }
  }

  // Validate SKU
  if (!sku || typeof sku !== "string" || sku.trim() === "") {
    errors.sku = "SKU is required";
  } else if (sku.length > 100) {
    errors.sku = "SKU cannot exceed 100 characters";
  }

  // Validate Thumbnail URL if provided
  if (thumbnail_url !== undefined && thumbnail_url !== null && thumbnail_url !== "") {
    if (typeof thumbnail_url !== "string" || thumbnail_url.length > 500) {
      errors.thumbnail_url = "Thumbnail URL cannot exceed 500 characters";
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
 * Validate input for updating a product.
 * @param {Object} data - The request body data.
 * @returns {Object} { isValid, errors }
 */
export const validateUpdateProduct = (data) => {
  const errors = {};
  const {
    category_id,
    name,
    slug,
    price,
    quantity,
    sku,
    thumbnail_url,
    is_active,
  } = data;

  // Validate Category ID if provided
  if (category_id !== undefined && category_id !== null && category_id !== "") {
    const categoryIdNum = Number(category_id);
    if (isNaN(categoryIdNum) || categoryIdNum <= 0 || !Number.isInteger(categoryIdNum)) {
      errors.category_id = "Category ID must be a valid positive integer";
    }
  }

  // Validate Name if provided
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      errors.name = "Product name cannot be empty";
    } else if (name.length > 255) {
      errors.name = "Product name cannot exceed 255 characters";
    }
  }

  // Validate Slug if provided
  if (slug !== undefined && slug !== null && slug !== "") {
    if (typeof slug !== "string") {
      errors.slug = "Slug must be a string";
    } else if (slug.length > 255) {
      errors.slug = "Slug cannot exceed 255 characters";
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      errors.slug = "Invalid slug format. Use lowercase alphanumeric characters and hyphens";
    }
  }

  // Validate Price if provided
  if (price !== undefined && price !== null && price !== "") {
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum < 0) {
      errors.price = "Price must be a valid non-negative number";
    }
  }

  // Validate Quantity if provided
  if (quantity !== undefined && quantity !== null && quantity !== "") {
    const quantityNum = Number(quantity);
    if (isNaN(quantityNum) || quantityNum < 0 || !Number.isInteger(quantityNum)) {
      errors.quantity = "Quantity must be a valid non-negative integer";
    }
  }

  // Validate SKU if provided
  if (sku !== undefined) {
    if (typeof sku !== "string" || sku.trim() === "") {
      errors.sku = "SKU cannot be empty";
    } else if (sku.length > 100) {
      errors.sku = "SKU cannot exceed 100 characters";
    }
  }

  // Validate Thumbnail URL if provided
  if (thumbnail_url !== undefined && thumbnail_url !== null && thumbnail_url !== "") {
    if (typeof thumbnail_url !== "string" || thumbnail_url.length > 500) {
      errors.thumbnail_url = "Thumbnail URL cannot exceed 500 characters";
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
