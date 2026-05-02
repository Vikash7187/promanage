import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { env } from "../../lib/env";
import {
  comparePassword,
  hashPassword,
  hashValue,
  signRefreshToken,
  signToken,
  verifyToken,
  verifyRefreshToken
} from "../../utils/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema
} from "./auth.validation";

const REFRESH_COOKIE = "tasknest_refresh_token";

const setRefreshCookie = (res: Response, refreshToken: string, rememberMe = false) => {
  const defaultMaxAge = 7 * 24 * 60 * 60 * 1000;
  const longMaxAge = 30 * 24 * 60 * 60 * 1000;

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: rememberMe ? longMaxAge : defaultMaxAge
  });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const payload = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: payload.email } });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const user = await prisma.user.create({
      data: {
        name: payload.fullName,
        email: payload.email,
        password: await hashPassword(payload.password),
        role: payload.role
      }
    });

    const accessToken = signToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashValue(refreshToken) }
    });
    setRefreshCookie(res, refreshToken, true);

    return res.status(201).json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    if (error?.message?.includes("authentication failed") || error?.message?.includes("bad auth")) {
      return res.status(503).json({ message: "Database connection failed. Check MongoDB credentials." });
    }
    return res.status(500).json({ message: error?.message ?? "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await comparePassword(payload.password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signToken({ sub: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashValue(refreshToken) }
    });
    setRefreshCookie(res, refreshToken, payload.rememberMe);

    return res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    if (error?.message?.includes("authentication failed") || error?.message?.includes("bad auth")) {
      return res.status(503).json({ message: "Database connection failed. Check MongoDB credentials." });
    }
    return res.status(500).json({ message: error?.message ?? "Internal server error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) return res.status(401).json({ message: "Refresh token required" });

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.refreshToken) return res.status(401).json({ message: "Unauthorized" });

  if (user.refreshToken !== hashValue(token)) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }

  const accessToken = signToken({ sub: user.id, email: user.email, role: user.role });
  const newRefreshToken = signRefreshToken({ sub: user.id });
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashValue(newRefreshToken) }
  });
  setRefreshCookie(res, newRefreshToken, true);

  return res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
};

export const logout = async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;

  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await prisma.user.update({
        where: { id: payload.sub },
        data: { refreshToken: null }
      });
    } catch {
      // no-op
    }
  }

  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const payload = forgotPasswordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) return res.json({ message: "If this email exists, reset instructions were sent." });

  const rawToken = signToken({ sub: user.id, email: user.email, role: user.role });
  const tokenHash = hashValue(rawToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: tokenHash,
      resetTokenExp: new Date(Date.now() + 1000 * 60 * 30)
    }
  });

  return res.json({
    message: "Reset token generated. Integrate email provider to send this token.",
    resetToken: process.env.NODE_ENV === "production" ? undefined : rawToken
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const payload = resetPasswordSchema.parse(req.body);
  const hashedToken = hashValue(payload.token);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExp: {
        gt: new Date()
      }
    }
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired reset token" });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(payload.password),
      resetToken: null,
      resetTokenExp: null
    }
  });

  return res.json({ message: "Password reset successful" });
};

export const me = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
