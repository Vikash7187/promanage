import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../lib/env";
import { AuthPayload, RefreshPayload } from "../types/auth";

export const hashPassword = (rawPassword: string) => bcrypt.hash(rawPassword, 10);
export const comparePassword = (rawPassword: string, hashedPassword: string) =>
  bcrypt.compare(rawPassword, hashedPassword);

export const signToken = (payload: { sub: string; email: string; role: Role }) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

export const signRefreshToken = (payload: { sub: string }) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

export const verifyToken = (token: string) => jwt.verify(token, env.JWT_SECRET) as AuthPayload;
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;

export const hashValue = (value: string) => crypto.createHash("sha256").update(value).digest("hex");
