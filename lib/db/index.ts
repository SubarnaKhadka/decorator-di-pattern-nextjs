import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import * as usersSchema from "./schema/users";
import * as activityLogsSchema from "./schema/activityLogs";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema: { ...usersSchema, ...activityLogsSchema },
});
