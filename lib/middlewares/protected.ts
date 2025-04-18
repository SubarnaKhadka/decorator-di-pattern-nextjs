import { NextRequest, NextResponse } from "next/server";

import { type JwtPayload } from "jsonwebtoken";

import { verifyToken } from "@/lib/session";
import { HttpStatus } from "@/lib/exceptions/http-status.enum";

type RouteHandler<T> = (
  req: NextRequest,
  payload: JwtPayload
) => Promise<Response> | Response;

export function withAuth<T>(handler: RouteHandler<T>): RouteHandler<T> {
  return async (request: NextRequest) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized", statusCode: HttpStatus.UNAUTHORIZED },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }

    const token = authHeader.split(" ")[1];

    try {
      const user = await verifyToken(token);

      if (!user) {
        return NextResponse.json(
          { message: "Invalid token", statusCode: HttpStatus.UNAUTHORIZED },
          { status: HttpStatus.UNAUTHORIZED }
        );
      }

      return handler(request, user as JwtPayload);
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication failed", statusCode: HttpStatus.UNAUTHORIZED },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }
  };
}
