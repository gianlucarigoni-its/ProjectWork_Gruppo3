import { validationHandler } from "./validation-error";
import { genericErrorHandler } from "./generic";
import { notFoundHandler } from "./not-found.error";

export const errorHandlers = [
  validationHandler,
  notFoundHandler,
  genericErrorHandler,
];
