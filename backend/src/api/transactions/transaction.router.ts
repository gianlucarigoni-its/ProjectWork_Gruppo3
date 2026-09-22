import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { find } from "./transaction.controller";
import { Filter } from "./transaction.dto";

const router = Router({ mergeParams: true });

router.get("/", validate(Filter, "query"), find);

export default router;
