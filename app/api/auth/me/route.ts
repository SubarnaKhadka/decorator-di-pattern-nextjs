import { NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { NotFoundException } from "@/lib/exceptions";
import { withAuth, withHttpException } from "@/lib/middlewares";

export const GET = withHttpException(
  withAuth(async (request: NextRequest, { user }) => {
    const existingUser = await db.query.users.findFirst({
      where: eq(users?.id, user?.id),
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    const { password, ...userDetailsWithoutPassword } = existingUser;

    return Response.json({
      data: userDetailsWithoutPassword,
      message: "User profile details",
    });
  })
);
