import { NextRequest } from "next/server";

import { resolve } from "@/lib/core";
import { withHttpException } from "@/lib/middlewares";
import { HttpStatus } from "@/lib/exceptions/http-status.enum";

import { UsersService } from "../../users/users.service";

export const GET = withHttpException(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const usersService = resolve(UsersService);
    const { data } = await usersService?.getUserById(params);

    return Response.json(
      { data, message: "Get User detail" },
      { status: HttpStatus.OK }
    );
  }
);
