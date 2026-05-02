"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const forgotSchema = z.object({
  email: z.string().email()
});

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (values: z.infer<typeof forgotSchema>) => {
    await forgotPassword(values.email);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4ff] p-6">
      <Card className="w-full max-w-md border-violet-200 p-7">
        <h1 className="text-2xl font-semibold text-violet-950">Forgot password</h1>
        <p className="mt-2 text-sm text-violet-500">Enter your email to request a reset token.</p>
        {submitted ? (
          <p className="mt-6 rounded-md bg-violet-50 p-3 text-sm text-violet-700">
            If the account exists, password reset instructions have been generated.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label className="mb-1 block text-sm text-violet-900">Email</label>
              <Input type="email" {...form.register("email")} />
              <p className="mt-1 text-xs text-red-500">{form.formState.errors.email?.message}</p>
            </div>
            <Button type="submit" className="w-full">
              Send reset link
            </Button>
          </form>
        )}
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-violet-700">
          Back to login
        </Link>
      </Card>
    </div>
  );
}
