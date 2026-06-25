import { successResponse, errorResponse } from "@/lib/response";
import { validateCreateProduct } from "@/features/product/product.validation";
import * as productService from "@/features/product/product.service";
import { withAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

/**
 * GET /api/products
 * Fetch products (public active list, or admin detailed list using ?all=true).
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";
    const category_id = searchParams.get("category_id");
    const search = searchParams.get("search");

    const filters = {};
    if (category_id) {
      filters.category_id = category_id;
    }
    if (search) {
      filters.search = search;
    }

    if (all) {
      // Require Authentication to see inactive products
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse("Authentication required to view all products", 401);
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN")) {
        return errorResponse("Access denied: Insufficient permissions", 403);
      }
    } else {
      // Public view only gets active products
      filters.is_active = true;
    }

    const products = await productService.getAllProducts(filters);
    return successResponse(products, "Products retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/products
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to create a new product.
 */
export const POST = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req) => {
  try {
    const body = await req.json();

    // Validate Input
    const { isValid, errors } = validateCreateProduct(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const newProduct = await productService.createProduct(body);
    return successResponse(newProduct, "Product created successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
