import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be 20 characters or fewer")
  .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers and underscores only");

export const emailSchema = z
  .string()
  .trim()
  .max(255, "Email is too long")
  .email("Enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer");

export const bankSchema = z.object({
  account_holder: z.string().trim().min(2, "Enter the account holder name").max(120),
  bank_name: z.string().trim().min(2, "Enter your bank name").max(120),
  account_number: z
    .string()
    .trim()
    .min(6, "Enter a valid account number")
    .max(34, "Account number is too long")
    .regex(/^[a-zA-Z0-9 -]+$/, "Use letters, numbers, spaces and dashes only"),
  iban_or_routing: z.string().trim().max(34, "Too long").optional().or(z.literal("")),
});

export type BankDetails = z.infer<typeof bankSchema>;

/** What the signed-in account still has to complete before entering the app. */
export async function accountSetupState() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;

  const [profileRes, bankRes] = await Promise.all([
    supabase.from("profiles").select("username, full_name").eq("id", user.id).maybeSingle(),
    supabase.from("bank_accounts").select("id").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    userId: user.id,
    email: user.email ?? "",
    username: profileRes.data?.username ?? null,
    needsUsername: !profileRes.data?.username,
    needsBank: !bankRes.data,
  };
}
