import { successResponse, errorResponse } from "@/lib/response";
import { getAllUsers } from "@/features/auth/auth.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/admin/users
 * Protected endpoint (SUPER_ADMIN only) to list all users.
 */
export const GET = withAuth(["SUPER_ADMIN"])(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const is_active = searchParams.get("is_active");

    const filters = {};
    if (role) filters.role = role;
    if (is_active !== null && is_active !== undefined) {
      filters.is_active = is_active === "true";
    }

    const users = await getAllUsers(filters);
    return successResponse(users, "Users list retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
});
