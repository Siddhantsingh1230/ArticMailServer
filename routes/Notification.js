import express from "express";
import { notify, notifyAll ,deleteOld,getNotifications } from "../controllers/Notification.js";

const router = express.Router();

router.post("/notify", notify);
router.post("/notifyall", notifyAll);
router.get("/deleteold",deleteOld);
router.post("/getnotifications",getNotifications);

export default router;
