import { successResponse, errorResponse } from "@/lib/response";
import { validateRegisterInput } from "@/features/auth/auth.validation";
import { createAdmin } from "@/features/auth/auth.service";
import { withAuth } from "@/lib/auth";

export const POST = withAuth(["SUPER_ADMIN"])(async (req) => {
  try {
    const body = await req.json();

    // Reuse registration validation since input requirements match
    const { isValid, errors } = validateRegisterInput(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    const result = await createAdmin(body);

    return successResponse(result, "Admin created successfully", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
});
