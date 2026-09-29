import { Router } from "express";
import { validate } from "../../lib/validation-middleware";
import { download, find, topUp, findById, transfer } from "./transaction.controller";
import { DownloadDTO, Filter, TopUpDto, TransferDto, TypeID } from "./transaction.dto";

const router = Router({ mergeParams: true });

// Rotta per recuperare i movimenti (gestisce sia la radice che /recenti per il frontend)
router.get("/", validate(Filter, "query"), find);
router.get("/download", validate(DownloadDTO, "query"), download);

router.get("/:id", validate(TypeID, "params"), findById);
router.post("/transfer", validate(TransferDto, "body"), transfer);
router.post("/topup", validate(TopUpDto, "body"), topUp);

export default router;
