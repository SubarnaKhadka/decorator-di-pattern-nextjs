import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { setSession } from "@/lib/session";
import { Injectable, Inject } from "@/lib/core";
import { ActivityType } from "@/db/schema/activityLogs";
import { ConflictException, InternalServerErrorException } from "@/lib/exceptions";

import { RegisterUser } from "./register.validation";
import { ActivityLogsService } from "../../activity-logs/activity-logs.service";

@Injectable()
export class RegisterService {
  constructor(
    @Inject(ActivityLogsService)
    private readonly activityLogs: ActivityLogsService
  ) {}

  async createUser(user: RegisterUser) {
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
        "Failed to create user. Please try again."
      );
    }

    const [data] = await Promise.all([
      setSession(newUser),
      this.activityLogs.createActivityLog({
        userId: newUser?.id,
        action: ActivityType.SIGN_UP,
      }),
    ]);

    return { data };
  }
}
