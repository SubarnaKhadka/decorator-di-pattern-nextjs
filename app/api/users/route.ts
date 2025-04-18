import { NextRequest } from "next/server";

import { resolve } from "@/lib/core";
import { HttpStatus } from "@/lib/exceptions/http-status.enum";
import { withHttpException, withValidation } from "@/lib/middlewares";

import { UsersService } from "./users.service";
import { User, validateUserSchema } from "./users.validation";

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const usersService = resolve(UsersService);

  const { data, pagination } = await usersService?.getUsers(searchParams);

  return Response.json(
    { data, pagination, message: "Users list" },
    {
      status: HttpStatus.OK,
    }
  );
};

export const POST = withHttpException(
  withValidation(
    validateUserSchema,
    async (request: NextRequest, user: User) => {
      const usersService = resolve(UsersService);
      const { data } = await usersService?.createUser(user);

      return Response.json(
        {
          message: "User Created Successfully",
          data,
        },
        {
          status: HttpStatus.CREATED,
        }
      );
    }
  )
);
