import { RequestHandler } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

type Source = "body" | "query" | "params";

export function validate_(dtoClass: new () => object, source: Source = "body"): RequestHandler {
  return async (req, res, next) => {
    const dtoObject = plainToInstance(dtoClass, req[source]);
    const errors = await validate(dtoObject, { whitelist: true, forbidNonWhitelisted: false });

    if (errors.length > 0) {
      res.status(400).json({
        error: "ValidationError",
        message: errors
          .flatMap((e) => Object.values(e.constraints ?? {}))
          .join(", "),
      });
      return;
    }

    req[source] = dtoObject as never;
    next();
  };
}

export { validate_ as validate };
