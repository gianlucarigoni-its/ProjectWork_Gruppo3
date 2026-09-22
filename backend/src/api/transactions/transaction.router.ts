import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { find, transfer } from "./transaction.controller";
import { Filter, TransferDto } from "./transaction.dto";

const router = Router({ mergeParams: true });

router.get("/", validate(Filter, "query"), find);
router.post("/transfer", validate(TransferDto, "body"), transfer);

export default router;
