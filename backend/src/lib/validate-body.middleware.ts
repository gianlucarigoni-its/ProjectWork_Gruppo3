import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { RequestHandler } from "express";

export function validateBody<T extends object>(dtoClass: new () => T): RequestHandler {
  return async (req, res, next) => {
    const dto = plainToInstance(dtoClass, req.body);
    const errors = await validate(dto, { whitelist: true });

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      return res.status(400).json({ message: "Dati non validi", errors: messages });
    }

    req.body = dto;
    next();
  };
}
