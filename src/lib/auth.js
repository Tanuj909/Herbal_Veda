import { verifyToken } from "./jwt";
import { errorResponse } from "./response";

export const withAuth = (roles = []) => {
  return (handler) => {
    return async (req, context) => {
      try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return errorResponse("Authentication token required", 401);
        }

        const token = authHeader.split(" ")[1];
        const decoded = verifyToken(token);
        if (!decoded) {
          return errorResponse("Invalid or expired authentication token", 401);
        }

        // Attach user info to the request object
        req.user = decoded;

        // Check if role is authorized
        if (roles.length > 0 && !roles.includes(decoded.role)) {
          return errorResponse("Access denied: Insufficient permissions", 403);
        }

        return handler(req, context);
      } catch (error) {
        return errorResponse(error.message, 500);
      }
    };
  };
};
