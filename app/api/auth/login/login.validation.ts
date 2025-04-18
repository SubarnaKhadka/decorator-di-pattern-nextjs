import z from "zod";

export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email" }),
  password: z
    .string({ message: "Password is required" })
    .trim()
    .min(4, { message: "Password must be at least 4 chars long" }),
});

export type LoginUser = z.infer<typeof loginSchema>;
