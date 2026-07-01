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
    const contentType = req.headers.get("content-type") || "";
    let updateData = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      updateData = {};
      if (formData.has("name")) updateData.name = formData.get("name").toString();
      if (formData.has("sku")) updateData.sku = formData.get("sku").toString();
      if (formData.has("price")) updateData.price = parseFloat(formData.get("price").toString());
      if (formData.has("gst")) updateData.gst = parseFloat(formData.get("gst").toString());
      if (formData.has("quantity")) updateData.quantity = parseInt(formData.get("quantity").toString(), 10);
      if (formData.has("category_id")) updateData.category_id = formData.get("category_id").toString();
      if (formData.has("short_description")) updateData.short_description = formData.get("short_description").toString();
      if (formData.has("description")) updateData.description = formData.get("description").toString();
      if (formData.has("is_active")) updateData.is_active = formData.get("is_active") === "true";

      const thumbnailFile = formData.get("thumbnail");
      if (thumbnailFile && typeof thumbnailFile !== "string") {
        const arrayBuffer = await thumbnailFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = thumbnailFile.type || "image/jpeg";
        updateData.thumbnail_url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (thumbnailFile) {
        updateData.thumbnail_url = thumbnailFile.toString();
      }

      const imagesFiles = formData.getAll("images");
      if (imagesFiles.length > 0) {
        const imagesList = [];
        for (const file of imagesFiles) {
          if (file && typeof file !== "string") {
            const ab = await file.arrayBuffer();
            const buf = Buffer.from(ab);
            const mime = file.type || "image/jpeg";
            imagesList.push(`data:${mime};base64,${buf.toString("base64")}`);
          } else if (file) {
            imagesList.push(file.toString());
          }
        }
        updateData.images = imagesList;
      }
    } else {
      updateData = await req.json();
    }

    // Validate update fields
    const { isValid, errors } = validateUpdateProduct(updateData);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    await productService.updateProduct(id, updateData);
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
