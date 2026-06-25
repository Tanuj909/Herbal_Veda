import { successResponse, errorResponse } from "@/lib/response";
import { getDashboardStats } from "@/features/order/order.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/admin/stats
 * Protected endpoint (ADMIN/SUPER_ADMIN only) to fetch general dashboard metrics.
 */
export const GET = withAuth(["ADMIN", "SUPER_ADMIN"])(async (req) => {
  try {
    const stats = await getDashboardStats();
    return successResponse(stats, "Dashboard statistics retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
});
