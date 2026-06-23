import { successResponse, errorResponse } from "@/lib/response";
import { validateRegisterInput } from "@/features/auth/auth.validation";
import { registerUser } from "@/features/auth/auth.service";

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Validate request body
    const { isValid, errors } = validateRegisterInput(body);
    if (!isValid) {
      return errorResponse("Validation failed", 400, errors);
    }

    // Call service
    const result = await registerUser(body);

    return successResponse(result, "Registration successful", 201);
  } catch (error) {
    return errorResponse(error.message, 400);
  }
}
