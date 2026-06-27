// Force recompile to clear error cache
import { successResponse, errorResponse } from "@/lib/response";
import { validateCreateCategory } from "@/features/category/category.validation";
import * as categoryService from "@/features/category/category.service";
import { withAuth } from "@/lib/auth";
import { verifyToken } from "@/lib/jwt";

/**
 * GET /api/categories
 * Public endpoint to fetch categories (flat or tree).
 * Optional: Pass ?all=true (admin required) to view inactive categories.
 * Optional: Pass ?structure=tree to get a hierarchical structure.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const structure = searchParams.get("structure") || "flat";
    const all = searchParams.get("all") === "true";

    let includeInactive = false;

    if (all) {
      // Required Authentication to see inactive categories
      const authHeader = req.headers.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return errorResponse("Authentication required to view inactive categories", 401);
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      if (!decoded || (decoded.role !== "ADMIN" && decoded.role !== "SUPER_ADMIN")) {
        return errorResponse("Access denied: Insufficient permissions to view inactive categories", 403);
      }
      
      includeInactive = true;
    }

    const categories = await categoryService.getAllCategories({
      includeInactive,
      structure,
    });

    return successResponse(categories, "Categories retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

/**
 * POST /api/categories
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to create a new category.
 */
export const POST = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req) => {
  try {
    const body = await req.json();

    // Validate Input
    const { isValid, errors } = validateCreateCategory(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const newCategory = await categoryService.createCategory(body);

    return successResponse(newCategory, "Category created successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
