import { NextRequest } from "next/server";

import { resolve } from "@/lib/core";
import { HttpStatus } from "@/lib/exceptions/http-status.enum";
import { withHttpException, withValidation } from "@/lib/middlewares";

import { LoginService } from "./login.service";
import { loginSchema, LoginUser } from "./login.validation";

export const POST = withHttpException(
  withValidation(
    loginSchema,
    async (request: NextRequest, loginUser: LoginUser) => {
      const loginService = resolve(LoginService);
      const { data } = await loginService.login(loginUser);

      return Response.json(
        { data, message: "Login successful" },
        { status: HttpStatus.OK },
      );
    },
  ),
);
