import { NextRequest } from "next/server";

import { HttpException } from "@/lib/exceptions";

type RouteHandler<T> = (
  req: NextRequest,
  context: T,
) => Promise<Response> | Response;

function httpExceptionToResponse(exception: HttpException): Response {
  return Response.json(
    {
      message: exception.message,
      statusCode: exception.statusCode,
    },
    { status: exception.statusCode },
  );
}

export function withHttpException<T>(
  handler: RouteHandler<T>,
): RouteHandler<T> {
  return async (request: NextRequest, args) => {
    try {
      return await handler(request, args);
    } catch (error) {
      if (error instanceof HttpException) {
        return httpExceptionToResponse(error);
      }

      return Response.json(
        { message: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
