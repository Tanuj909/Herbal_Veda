import { successResponse, errorResponse } from "@/lib/response";
import * as wishlistService from "@/features/wishlist/wishlist.service";
import { withAuth } from "@/lib/auth";

/**
 * DELETE /api/wishlist/[id]
 * Remove an item from the wishlist by its database wishlist entry ID.
 * Only the owner of the wishlist item can delete.
 */
export const DELETE = withAuth()(async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;

    await wishlistService.removeFromWishlistById(id, user.id);
    return successResponse(null, "Wishlist item removed successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
