import { errorResponse } from "@/lib/response";

const handleNotFound = () => {
  return errorResponse("API endpoint not found", 404);
};

export const GET = handleNotFound;
export const POST = handleNotFound;
export const PUT = handleNotFound;
export const PATCH = handleNotFound;
export const DELETE = handleNotFound;
export const HEAD = handleNotFound;
export const OPTIONS = handleNotFound;
