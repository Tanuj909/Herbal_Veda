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
    const contentType = req.headers.get("content-type") || "";
    let categoryData = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      categoryData = {
        name: formData.get("name")?.toString() || "",
        slug: formData.get("slug")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        is_active: formData.has("is_active") ? formData.get("is_active") === "true" : true,
        parent_id: formData.get("parent_id")?.toString() || null,
      };

      const imageFile = formData.get("image");
      if (imageFile && typeof imageFile !== "string") {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = imageFile.type || "image/jpeg";
        categoryData.image_url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (imageFile) {
        categoryData.image_url = imageFile.toString();
      }
    } else {
      categoryData = await req.json();
    }

    // Validate Input
    const { isValid, errors } = validateCreateCategory(categoryData);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const newCategory = await categoryService.createCategory(categoryData);

    return successResponse(newCategory, "Category created successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
