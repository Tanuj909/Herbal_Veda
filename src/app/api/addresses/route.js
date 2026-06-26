import { successResponse, errorResponse } from "@/lib/response";
import * as addressService from "@/features/address/address.service";
import { withAuth } from "@/lib/auth";

/**
 * GET /api/addresses
 * Fetch all addresses belonging to the authenticated user.
 */
export const GET = withAuth()(async (req) => {
  try {
    const user = req.user;
    const addresses = await addressService.getUserAddresses(user.id);
    return successResponse(addresses, "Addresses retrieved successfully");
  } catch (error) {
    return errorResponse(error.message, 500);
  }
});

/**
 * POST /api/addresses
 * Add a new shipping/billing address for the user.
 */
export const POST = withAuth()(async (req) => {
  try {
    const user = req.user;
    const body = await req.json();

    const address = await addressService.addUserAddress(user.id, body);
    return successResponse(address, "Address added successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
