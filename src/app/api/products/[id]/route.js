import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { validateUpdateProduct } from "@/features/product/product.validation";
import * as productService from "@/features/product/product.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/products/[id]
 * Fetch a single product by ID or Slug.
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    // Check if it's a numeric ID or a string slug
    const product = isNaN(Number(id))
      ? await productService.getProductBySlug(id)
      : await productService.getProductById(id);
    return successResponse(product, "Product retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 404);
  }
}

/**
 * PUT /api/products/[id]
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to update a product.
 * Returns simple success message: {"message": "Product Updated"}
 */
export const PUT = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate update fields
    const { isValid, errors } = validateUpdateProduct(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    await productService.updateProduct(id, body);
    return NextResponse.json({ message: "Product Updated" });
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});

/**
 * PATCH /api/products/[id]
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to toggle the product is_active status.
 * Returns simple success message: {"message": "Product Updated"}
 */
export const PATCH = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    const currentProduct = await productService.getProductById(id);
    const newActiveState = !currentProduct.is_active;
    await productService.updateProduct(id, { is_active: newActiveState });
    return NextResponse.json({ message: "Product Updated" });
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});

/**
 * DELETE /api/products/[id]
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to delete a product.
 */
export const DELETE = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    await productService.deleteProduct(id);
    return successResponse(null, "Product deleted successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
