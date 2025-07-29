import express from "express";
import { uploadImageHandler, uploadImageMiddleware } from "../uploads/upload-image.js";

const router = express.Router();

router.post("/", uploadImageMiddleware, uploadImageHandler);

export default router;
