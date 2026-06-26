import { successResponse, errorResponse } from "@/lib/response";
import * as productService from "@/features/product/product.service";
import { withAuth } from "@/lib/auth";

/**
 * POST /api/products/bulk
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to bulk upload products.
 * Expects an array of products in the request body.
 */
export const POST = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req) => {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return errorResponse("Request body must be an array of products", 400);
    }

    const createdProducts = await productService.bulkCreateProducts(body);

    return successResponse(
      createdProducts,
      `${createdProducts.length} products uploaded successfully`,
      201
    );
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
