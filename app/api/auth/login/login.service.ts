import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { setSession } from "@/lib/session";
import { Inject, Injectable } from "@/lib/core";
import { ActivityType } from "@/db/schema/activityLogs";
import { NotFoundException, UnauthorizedException } from "@/lib/exceptions";

import { LoginUser } from "./login.validation";
import { ActivityLogsService } from "../../activity-logs/activity-logs.service";

@Injectable()
export class LoginService {
  constructor(
    @Inject(ActivityLogsService)
    private readonly activityLogs: ActivityLogsService,
  ) {}

  async checkPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  async login(loginUser: LoginUser) {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, loginUser.email),
    });

    if (!existingUser) {
      throw new NotFoundException("User not Found");
    }

    const isPasswordValid = await this.checkPassword(
      loginUser.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid Credentials");
    }

    const [data] = await Promise.all([
      setSession(existingUser),
      this.activityLogs.createActivityLog({
        userId: existingUser?.id,
        action: ActivityType.SIGN_IN,
      }),
    ]);

    return { data };
  }
}
