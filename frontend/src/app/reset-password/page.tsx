"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

const resetSchema = z
  .object({
    token: z.string().min(10),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: z.infer<typeof resetSchema>) => {
    await resetPassword(values.token, values.password, values.confirmPassword);
    form.reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f4ff] p-6">
      <Card className="w-full max-w-md border-violet-200 p-7">
        <h1 className="text-2xl font-semibold text-violet-950">Reset password</h1>
        <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-sm text-violet-900">Reset Token</label>
            <Input {...form.register("token")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-violet-900">New Password</label>
            <Input type="password" {...form.register("password")} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-violet-900">Confirm Password</label>
            <Input type="password" {...form.register("confirmPassword")} />
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.confirmPassword?.message}</p>
          </div>
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-violet-700">
          Back to login
        </Link>
      </Card>
    </div>
  );
}
