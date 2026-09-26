import jwt from "jsonwebtoken";
import { RoleName } from "@prisma/client";

export interface TokenPayload {
 userId: string;
 email: string;
 fullName: string;
 role: RoleName;
}

const JWT_SECRET = process.env.JWT_SECRET || "wms-fallback-secret-key-2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export function signJwtToken(payload: TokenPayload): string {
 return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
}

export function verifyJwtToken(token: string): TokenPayload {
 return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
