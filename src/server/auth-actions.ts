"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email("Email invalido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  fullName: z.string().trim().optional(),
});

function getField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signInAction(formData: FormData) {
  const input = credentialsSchema.omit({ fullName: true }).parse({
    email: getField(formData, "email"),
    password: getField(formData, "password"),
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(input);

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const input = credentialsSchema.parse({
    email: getField(formData, "email"),
    password: getField(formData, "password"),
    fullName: getField(formData, "fullName"),
  });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Conta criada. Verifique seu email para confirmar o acesso.",
      )}`,
    );
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
