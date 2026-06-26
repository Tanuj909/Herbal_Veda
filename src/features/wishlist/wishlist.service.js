import * as wishlistRepository from "./wishlist.repository";
import { findProductById } from "@/features/product/product.repository";

/**
 * Get all wishlist items for a user.
 * @param {string|number|BigInt} userId
 * @returns {Promise<Array>}
 */
export const getUserWishlist = async (userId) => {
  return wishlistRepository.findWishlistByUserId(userId);
};

/**
 * Add a product to the user's wishlist.
 * Checks if product exists and if it is already in the wishlist.
 * @param {string|number|BigInt} userId
 * @param {string|number|BigInt} productId
 * @returns {Promise<Object>}
 */
export const addToWishlist = async (userId, productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  // 1. Verify that the product actually exists
  const product = await findProductById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  // 2. Check if the product is already in user's wishlist
  const existingItem = await wishlistRepository.findWishlistItemByUserAndProduct(userId, productId);
  if (existingItem) {
    // Return the existing item gracefully
    return existingItem;
  }

  // 3. Create the wishlist entry
  return wishlistRepository.createWishlistItem(userId, productId);
};

/**
 * Remove a specific wishlist item by its ID.
 * Validates ownership before deletion.
 * @param {string|number|BigInt} id
 * @param {string|number|BigInt} userId
 * @returns {Promise<Object>}
 */
export const removeFromWishlistById = async (id, userId) => {
  const item = await wishlistRepository.findWishlistItemById(id);
  if (!item) {
    throw new Error("Wishlist item not found");
  }

  // Verify ownership
  if (item.user_id.toString() !== userId.toString()) {
    throw new Error("Access denied: You do not own this wishlist item");
  }

  return wishlistRepository.deleteWishlistItem(id);
};

/**
 * Remove a wishlist item using the user and product IDs.
 * @param {string|number|BigInt} userId
 * @param {string|number|BigInt} productId
 * @returns {Promise<Object>}
 */
export const removeFromWishlistByProductId = async (userId, productId) => {
  if (!productId) {
    throw new Error("Product ID is required");
  }

  const existingItem = await wishlistRepository.findWishlistItemByUserAndProduct(userId, productId);
  if (!existingItem) {
    throw new Error("Product is not in your wishlist");
  }

  return wishlistRepository.deleteWishlistItemByUserAndProduct(userId, productId);
};
