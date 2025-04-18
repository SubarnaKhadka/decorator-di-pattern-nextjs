import {
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
  } from "drizzle-orm/pg-core";
  import { users } from "./users";
  
  export enum ActivityType {
    SIGN_UP = "SIGN_UP",
    SIGN_IN = "SIGN_IN",
    SIGN_OUT = "SIGN_OUT",
    UPDATE_PASSWORD = "UPDATE_PASSWORD",
    DELETE_ACCOUNT = "DELETE_ACCOUNT",
    UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  }
  
  export const activityLogs = pgTable("activity_logs", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    timestamp: timestamp("timestamp").notNull().defaultNow(),
    ipAddress: varchar("ip_address", { length: 45 }),
  });
  
  export type ActivityLogs = typeof activityLogs.$inferSelect;
  export type NewActivityLog = typeof activityLogs.$inferInsert;
  