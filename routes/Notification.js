import express from "express";
import { notify, notifyAll ,deleteOld } from "../controllers/Notification.js";

const router = express.Router();

router.post("/notify", notify);
router.post("/notifyall", notifyAll);
router.get("/deleteold",deleteOld);

export default router;
