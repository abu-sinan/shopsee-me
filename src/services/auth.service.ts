import { createClient } from "@/lib/supabase/client";
import type { LoginFormValues, RegisterFormValues } from "@/lib/validations/auth.schema";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function signIn(data: LoginFormValues): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signUp(data: RegisterFormValues): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { full_name: data.full_name, phone: data.phone } },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account/reset-password`,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
