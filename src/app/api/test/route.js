import prisma from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new Response(
      JSON.stringify({
        success: true,
        message: "Database connected successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Prisma Database Connection Test Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        name: error?.name,
        message: error?.message,
        code: error?.code,
        clientVersion: error?.clientVersion,
        stack: error?.stack,
        cause: error?.cause,
        meta: error?.meta
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
