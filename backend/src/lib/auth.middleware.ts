import { RequestHandler } from "express";
import { verificaToken } from "./jwt.util";

declare global {
  namespace Express {
    interface Request {
      contoCorrenteId?: string;
    }
  }
}

export const richiedeAutenticazione: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token mancante" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verificaToken(token);
    req.contoCorrenteId = payload.contoCorrenteId;
    next();
  } catch {
    res.status(401).json({ message: "Token non valido o scaduto" });
  }
};