import bcrypt from "bcryptjs";
import { count, eq } from "drizzle-orm";

import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from "@/lib/exceptions";
import { db } from "@/db";
import { Injectable } from "@/lib/core";
import { users } from "@/db/schema/users";
import { QueryBuilder } from "@/lib/query-builder";

import { User } from "./users.validation";

@Injectable()
export class UsersService {
  constructor() {}

  async getUsers(searchParams: URLSearchParams) {
    const queryBuilder = new QueryBuilder(searchParams)
      .configureSearch({
        searchableFields: {
          name: users.name,
          email: users.email,
        },
      })
      .configureSort({
        sortableFields: {
          name: users.name,
          email: users.email,
          age: users.age,
          createdAt: users.createdAt,
        },
      });

    const { data, pagination } = await queryBuilder.executeQuery(
      async ({ limit, offset, orderBy, where }, tx) => {
        return tx
          .select()
          .from(users)
          .limit(limit)
          .offset(offset)
          .orderBy(...orderBy)
          .where(where);
      },
      async (tx) => {
        const query = tx.select({ count: count() }).from(users);
        const res = await query.execute();
        return res[0]?.count ?? 0;
      },
    );

    return { data, pagination };
  }

  async getUserById(
    params: Promise<{
      id: string;
    }>,
  ) {
    const userId = Number.parseInt((await params).id);

    if (!userId) {
      throw new BadRequestException("Invalid User Id");
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    return { data: existingUser };
  }

  async createUser(user: User) {
    const existingUserWithEmail = await db.query.users.findFirst({
      where: eq(users.email, user.email),
    });

    if (existingUserWithEmail) {
      throw new ConflictException("Email already used");
    }

    const passwordHash = await bcrypt.hash(user.password, 10);

    const [newUser] = await db
      .insert(users)
      .values({ ...user, password: passwordHash })
      .returning({ id: users.id })
      .onConflictDoNothing();

    if (!newUser) {
      throw new InternalServerErrorException(
        "Failed to create user. Please try again.",
      );
    }

    return { data: newUser };
  }
}
