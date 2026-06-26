import prisma from "@/lib/prisma";

/**
 * Find all wishlist items for a specific user.
 * Includes product details along with category and images.
 * @param {string|number|BigInt} userId
 * @returns {Promise<Array>}
 */
export const findWishlistByUserId = async (userId) => {
  return prisma.wishlist.findMany({
    where: { user_id: BigInt(userId) },
    include: {
      product: {
        include: {
          category: true,
          images: {
            orderBy: {
              display_order: "asc",
            },
          },
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

/**
 * Find a specific wishlist item by its ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object|null>}
 */
export const findWishlistItemById = async (id) => {
  return prisma.wishlist.findUnique({
    where: { id: BigInt(id) },
  });
};

/**
 * Find a specific wishlist item by user ID and product ID.
 * @param {string|number|BigInt} userId
 * @param {string|number|BigInt} productId
 * @returns {Promise<Object|null>}
 */
export const findWishlistItemByUserAndProduct = async (userId, productId) => {
  return prisma.wishlist.findUnique({
    where: {
      user_id_product_id: {
        user_id: BigInt(userId),
        product_id: BigInt(productId),
      },
    },
  });
};

/**
 * Create a new wishlist item for a user.
 * Includes full product details in the response.
 * @param {string|number|BigInt} userId
 * @param {string|number|BigInt} productId
 * @returns {Promise<Object>}
 */
export const createWishlistItem = async (userId, productId) => {
  return prisma.wishlist.create({
    data: {
      user_id: BigInt(userId),
      product_id: BigInt(productId),
    },
    include: {
      product: {
        include: {
          category: true,
          images: {
            orderBy: {
              display_order: "asc",
            },
          },
        },
      },
    },
  });
};

/**
 * Delete a wishlist item by its unique ID.
 * @param {string|number|BigInt} id
 * @returns {Promise<Object>}
 */
export const deleteWishlistItem = async (id) => {
  return prisma.wishlist.delete({
    where: { id: BigInt(id) },
  });
};

/**
 * Delete a wishlist item by user ID and product ID.
 * @param {string|number|BigInt} userId
 * @param {string|number|BigInt} productId
 * @returns {Promise<Object>}
 */
export const deleteWishlistItemByUserAndProduct = async (userId, productId) => {
  return prisma.wishlist.delete({
    where: {
      user_id_product_id: {
        user_id: BigInt(userId),
        product_id: BigInt(productId),
      },
    },
  });
};
