import { successResponse, errorResponse } from "@/lib/response";
import * as categoryService from "@/features/category/category.service";
import { withAuth } from "@/lib/auth";

/**
 * POST /api/categories/bulk
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to bulk upload categories.
 * Expects an array of categories in the request body.
 */
export const POST = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req) => {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return errorResponse("Request body must be an array of categories", 400);
    }

    const createdCategories = await categoryService.bulkCreateCategories(body);

    return successResponse(
      createdCategories,
      `${createdCategories.length} categories uploaded successfully`,
      201
    );
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
