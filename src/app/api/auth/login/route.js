import { successResponse, errorResponse } from "@/lib/response";
import { validateLoginInput } from "@/features/auth/auth.validation";
import { loginUser } from "@/features/auth/auth.service";

export async function POST(req) {
  try {
    const body = await req.json();

    // Validate request body
    const { isValid, errors } = validateLoginInput(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    // Call service
    const result = await loginUser(body.phone, body.password);

    return successResponse(result, "Login successful", 200);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
