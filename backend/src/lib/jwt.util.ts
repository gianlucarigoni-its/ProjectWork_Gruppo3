import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET non configurata nel file .env");
}

export interface PayloadToken {
  contoCorrenteId: string;
}

export function firmaToken(payload: PayloadToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
}

export function verificaToken(token: string): PayloadToken {
  return jwt.verify(token, JWT_SECRET) as PayloadToken;
}