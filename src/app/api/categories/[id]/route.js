import { successResponse, errorResponse } from "@/lib/response";
import { validateUpdateCategory } from "@/features/category/category.validation";
import * as categoryService from "@/features/category/category.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/categories/[id]
 * Public endpoint to fetch a single category by ID or Slug.
 */
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const category = await categoryService.getCategoryByIdOrSlug(id);
    return successResponse(category, "Category retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 404);
  }
}

/**
 * PUT /api/categories/[id]
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to update a category.
 */
export const PUT = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate update fields
    const { isValid, errors } = validateUpdateCategory(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const updatedCategory = await categoryService.updateCategory(id, body);
    return successResponse(updatedCategory, "Category updated successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});

/**
 * DELETE /api/categories/[id]
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to delete a category.
 */
export const DELETE = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    await categoryService.deleteCategory(id);
    return successResponse(null, "Category deleted successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
