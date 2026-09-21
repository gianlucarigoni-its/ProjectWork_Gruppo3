import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  username?: string;
  email?: string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Accesso negato. Token non fornito o formato non valido.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET non configurata nel file .env');
    }

    // Verifica il token con la nuova chiave
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    (req as any).user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token non valido o scaduto.' });
    return;
  }
};