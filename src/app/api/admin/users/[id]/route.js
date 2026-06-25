import { successResponse, errorResponse } from "@/lib/response";
import { getAdminProfile, adminUpdateUser } from "@/features/auth/auth.service";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(["SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    const result = await getAdminProfile(id);
    return successResponse(result, "Admin profile retrieved successfully", 200);
  } catch (error) {
    return errorResponse(error.message, 404);
  }
});

export const PATCH = withAuth(["SUPER_ADMIN"])(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await adminUpdateUser(id, body);
    return successResponse(result, "User profile updated successfully", 200);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
