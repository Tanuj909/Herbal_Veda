import { NextResponse } from "next/server";

export const successResponse = (data, message = "Success", statusCode = 200) => {
  // Deep clone data and convert BigInt values to string to avoid serialization errors in NextResponse.json
  const serializedData = JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  return NextResponse.json(
    {
      success: true,
      message,
      data: serializedData,
    },
    { status: statusCode }
  );
};

export const errorResponse = (message = "Internal Server Error", statusCode = 500, errors = null) => {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status: statusCode }
  );
};
