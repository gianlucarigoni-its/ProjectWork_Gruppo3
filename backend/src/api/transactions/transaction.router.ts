import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { find, topUp, transfer } from "./transaction.controller";
import { Filter, TopUpDto, TransferDto } from "./transaction.dto";

const router = Router({ mergeParams: true });

router.get("/", validate(Filter, "query"), find);
router.post("/transfer", validate(TransferDto, "body"), transfer);
router.post("/topup", validate(TopUpDto, "body"), topUp);

export default router;
