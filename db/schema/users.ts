import {
    integer,
    pgTable,
    text,
    timestamp,
    varchar,
  } from "drizzle-orm/pg-core";
  
  export const users = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    age: integer(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  });
  
  export type User = typeof users.$inferSelect;
  export type NewUser = typeof users.$inferInsert;