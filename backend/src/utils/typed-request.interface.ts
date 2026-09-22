import { Request } from "express";

export interface TypedRequest<TBody = unknown, TQuery = unknown> extends Request {
  body: TBody;
  query: TQuery & Request["query"];
}
