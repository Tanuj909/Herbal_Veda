import { successResponse, errorResponse } from "@/lib/response";
import * as wishlistService from "@/features/wishlist/wishlist.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/wishlist
 * Retrieve all items in the user's wishlist (includes product, category, and images).
 */
export const GET = withAuth()(async (req) => {
  try {
    const user = req.user;
    const wishlistItems = await wishlistService.getUserWishlist(user.id);
    return successResponse(wishlistItems, "Wishlist retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
});

/**
 * POST /api/wishlist
 * Add a product to the authenticated user's wishlist.
 * Body parameter: { product_id }
 */
export const POST = withAuth()(async (req) => {
  try {
    const user = req.user;
    const body = await req.json();
    const item = await wishlistService.addToWishlist(user.id, body.product_id);
    return successResponse(item, "Product added to wishlist successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});

/**
 * DELETE /api/wishlist
 * Remove a product from the user's wishlist using the product_id query parameter.
 * Example: DELETE /api/wishlist?product_id=123
 */
export const DELETE = withAuth()(async (req) => {
  try {
    const user = req.user;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("product_id");

    if (!productId) {
      return errorResponse("Product ID is required", 400);
    }

    await wishlistService.removeFromWishlistByProductId(user.id, productId);
    return successResponse(null, "Product removed from wishlist successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
