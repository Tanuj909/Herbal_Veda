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
    const contentType = req.headers.get("content-type") || "";
    let updateData = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      updateData = {};
      if (formData.has("name")) updateData.name = formData.get("name").toString();
      if (formData.has("slug")) updateData.slug = formData.get("slug").toString();
      if (formData.has("description")) updateData.description = formData.get("description").toString();
      if (formData.has("is_active")) updateData.is_active = formData.get("is_active") === "true";
      if (formData.has("parent_id")) {
        const val = formData.get("parent_id");
        updateData.parent_id = val ? val.toString() : null;
      }

      const imageFile = formData.get("image");
      if (imageFile && typeof imageFile !== "string") {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageFile.type || "image/jpeg";
        updateData.image_url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (imageFile) {
        updateData.image_url = imageFile.toString();
      }
    } else {
      updateData = await req.json();
    }

    // Validate update fields
    const { isValid, errors } = validateUpdateCategory(updateData);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const updatedCategory = await categoryService.updateCategory(id, updateData);
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
