import { z } from "zod";

export const activityLogsSchema = z.object({
  userId: z.number({ message: "User Id is required" }),
  action: z.string({ message: "Action is required" }),
  ipAdress: z.string().ip().optional(),
});

export type ActivityLog = z.infer<typeof activityLogsSchema>;
