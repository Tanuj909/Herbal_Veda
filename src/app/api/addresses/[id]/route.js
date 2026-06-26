import { successResponse, errorResponse } from "@/lib/response";
import * as addressService from "@/features/address/address.service";
import { withAuth } from "@/lib/auth";

/**
 * PUT /api/addresses/[id]
 * Update an existing address. Only the owner can modify.
 */
export const PUT = withAuth()(async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;
    const body = await req.json();

    const updated = await addressService.editUserAddress(id, user.id, body);
    return successResponse(updated, "Address updated successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});

/**
 * DELETE /api/addresses/[id]
 * Remove an address. Only the owner can delete.
 */
export const DELETE = withAuth()(async (req, { params }) => {
  try {
    const { id } = await params;
    const user = req.user;

    await addressService.removeUserAddress(id, user.id);
    return successResponse(null, "Address deleted successfully");
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
