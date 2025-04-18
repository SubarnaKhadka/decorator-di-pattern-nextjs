import { NextResponse, type NextRequest } from "next/server";

import { z, ZodIssue } from "zod";

export function withValidation<T extends z.ZodType>(
  schema: T,
  handler: (
    req: NextRequest,
    validData: z.infer<T>
  ) => Promise<Response> | Response
) {
  return async (request: NextRequest) => {
    try {
      const clone = request.clone();
      const body = await clone.json();

      const result = schema.safeParse(body);

      if (!result.success) {
        const errors = result.error.issues.map((issue: ZodIssue) => {
          const path = issue.path.join(".");

          return {
            path,
            message: issue.message,
            code: issue.code,
          };
        });

        return NextResponse.json(
          {
            message: "Validation failed",
            errors: errors,
          },
          { status: 422 }
        );
      }

      return handler(request, result.data);
    } catch (error) {
      return NextResponse.json(
        {
          message: "Invalid request",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 400 }
      );
    }
  };
}
