// backend/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const { user } = await authService.register(req.body);
        res.status(201).json({
            success: true,
            message:
                "Registration successful. Please check your email to verify your account.",
            data: { id: user.id, email: user.email, role: user.role },
        });
    } catch (err) {
        next(err);
    }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("🔐 Login controller called"); // ← LOG
        const result = await authService.login(req.body); // ← authService.login
        console.log("✅ Login successful"); // ← LOG

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            success: true,
            data: { accessToken: result.accessToken, user: result.user },
        });
    } catch (err) {
        console.error("❌ Login controller error:", err); // ← LOG
        next(err);
    }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            res.status(401).json({
                success: false,
                message: "No refresh token",
            });
            return;
        }
        const result = await authService.refreshTokens(token);

        res.cookie("refreshToken", result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ success: true, data: { accessToken: result.accessToken } });
    } catch (err) {
        next(err);
    }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.user) {
            await authService.logout(req.user.userId);
        }
        res.clearCookie("refreshToken");
        res.json({ success: true, message: "Logged out" });
    } catch (err) {
        next(err);
    }
}

export async function verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        await authService.verifyEmail(req.params.token);
        res.json({ success: true, message: "Email verified successfully" });
    } catch (err) {
        next(err);
    }
}
