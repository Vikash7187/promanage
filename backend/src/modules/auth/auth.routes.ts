import { Router } from "express";
import { forgotPassword, login, logout, me, refresh, resetPassword, signup } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/me", authenticate, me);
