import { z } from "zod";

export const registerUserSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(1, "Name must be atleast one character"),
  age: z.number().nonnegative().optional(),
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Email is required" }),
  password: z
    .string({ message: "Password is required" })
    .trim()
    .min(4, "Password must be at least 4 chars long"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
