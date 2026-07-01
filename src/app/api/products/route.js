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
    const contentType = req.headers.get("content-type") || "";
    let productData = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      
      productData = {
        name: formData.get("name")?.toString() || "",
        sku: formData.get("sku")?.toString() || "",
        price: formData.get("price") ? parseFloat(formData.get("price").toString()) : undefined,
        gst: formData.get("gst") ? parseFloat(formData.get("gst").toString()) : undefined,
        quantity: formData.get("quantity") ? parseInt(formData.get("quantity").toString(), 10) : undefined,
        category_id: formData.get("category_id") ? formData.get("category_id").toString() : "",
        short_description: formData.get("short_description")?.toString() || "",
        description: formData.get("description")?.toString() || "",
        is_active: formData.get("is_active") === "true",
      };

      // Extract raw image file from "thumbnail"
      const thumbnailFile = formData.get("thumbnail");
      if (thumbnailFile && typeof thumbnailFile !== "string") {
        const arrayBuffer = await thumbnailFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = thumbnailFile.type || "image/jpeg";
        productData.thumbnail_url = `data:${mimeType};base64,${buffer.toString("base64")}`;
      } else if (thumbnailFile) {
        productData.thumbnail_url = thumbnailFile.toString();
      }

      // Extract other images (if any)
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
        productData.images = imagesList;
      }
    } else {
      productData = await req.json();
    }

    // Validate Input
    const { isValid, errors } = validateCreateProduct(productData);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const newProduct = await productService.createProduct(productData);
    return successResponse(newProduct, "Product created successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
