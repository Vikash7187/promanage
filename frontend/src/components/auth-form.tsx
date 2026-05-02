"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Eye, EyeOff, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordStrength } from "@/components/password-strength";
import { GoogleAuthButton, MicrosoftAuthButton } from "@/components/social-auth-buttons";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "VIEWER"]),
  terms: z.boolean().refine((v) => v === true, { message: "You must accept the terms" })
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match"
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean()
});

type Mode = "login" | "signup";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getApiErrorMessage(error: unknown): string | null {
  if (!isRecord(error)) return null;
  const response = error.response;
  if (!isRecord(response)) return null;
  const data = response.data;
  if (!isRecord(data)) return null;
  return typeof data.message === "string" ? data.message : null;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "TEAM_MEMBER",
      terms: false
    }
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  });

  const passwordValue = signupForm.watch("password");

  const onSignup = async (values: z.infer<typeof signupSchema>) => {
    try {
      const { terms: _terms, ...payload } = values;
      void _terms;
      const path = await signup(payload);
      toast.success("Account created successfully.");
      router.push(path);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? "Signup failed.");
    }
  };

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    try {
      const path = await login(values);
      toast.success("Logged in successfully.");
      router.push(path);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? "Login failed.");
    }
  };

  return (
    <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl shadow-violet-100/50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "signup" ? "Create an account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "signup" ? "Please enter your details to sign up" : "Please enter your details to sign in"}
        </p>
      </div>

      {mode === "signup" ? (
        <form className="space-y-4" onSubmit={signupForm.handleSubmit(onSignup)}>
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <Input id="fullName" placeholder="John Doe" {...signupForm.register("fullName")} className="h-11" />
            {signupForm.formState.errors.fullName && (
              <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <Input id="signup-email" type="email" placeholder="you@company.com" {...signupForm.register("email")} className="h-11" />
            {signupForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...signupForm.register("password")} className="h-11 pr-10" />
              <button suppressHydrationWarning type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {signupForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.password.message}</p>
            )}
            <div className="mt-2">
              <PasswordStrength password={passwordValue} />
            </div>
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
            <div className="relative">
              <Input id="confirm-password" type={showConfirm ? "text" : "password"} placeholder="••••••••" {...signupForm.register("confirmPassword")} className="h-11 pr-10" />
              <button suppressHydrationWarning type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowConfirm((s) => !s)}>
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {signupForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{signupForm.formState.errors.confirmPassword.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: "ADMIN", label: "Admin", desc: "Full workspace access", icon: Shield },
                  { value: "TEAM_MEMBER", label: "Member", desc: "Collaborate on tasks", icon: User },
                ] as const
              ).map((role) => {
                const selected = signupForm.watch("role") === role.value;
                return (
                  <button
                    suppressHydrationWarning
                    key={role.value}
                    type="button"
                    onClick={() => signupForm.setValue("role", role.value, { shouldValidate: true })}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? "border-violet-500 bg-violet-50 ring-1 ring-violet-500"
                        : "border-slate-200 bg-white hover:border-violet-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                      <role.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${selected ? "text-violet-900" : "text-slate-700"}`}>{role.label}</p>
                      <p className="text-xs text-slate-500">{role.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" {...signupForm.register("terms")} className="mt-0.5 size-4 rounded border-slate-300 text-violet-600" />
            <span>I agree to the <Link href="#" className="font-medium text-violet-600 hover:text-violet-700">Terms of Service</Link> and <Link href="#" className="font-medium text-violet-600 hover:text-violet-700">Privacy Policy</Link></span>
          </label>
          {signupForm.formState.errors.terms && (
            <p className="text-xs text-red-500">{signupForm.formState.errors.terms.message}</p>
          )}
          <Button type="submit" className="h-11 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            Sign Up
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLogin)}>
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
            <Input id="login-email" type="email" placeholder="you@company.com" {...loginForm.register("email")} className="h-11" />
            {loginForm.formState.errors.email && (
              <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <Input id="login-password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...loginForm.register("password")} className="h-11 pr-10" />
              <button suppressHydrationWarning type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {loginForm.formState.errors.password && (
              <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" {...loginForm.register("rememberMe")} className="size-4 rounded border-slate-300 text-violet-600" />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-violet-600 hover:text-violet-700">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="h-11 w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            Sign In
          </Button>
        </form>
      )}

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">or continue with</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <GoogleAuthButton />
          <MicrosoftAuthButton />
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
        <Link href={mode === "signup" ? "/login" : "/signup"} className="font-semibold text-violet-600 hover:text-violet-700">
          {mode === "signup" ? "Sign in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
