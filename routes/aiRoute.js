import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import { generateDream } from "../controller/aiController.js";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "eduprosolution",
    acl: "private",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileKey = `dreams/${Date.now()}-${file.originalname}`;
      cb(null, fileKey);
    },
  }),
});

const router = express.Router();

// Route to generate dream with uploaded image
router.post(
  "/generate-dream",
  upload.single("image"),
  authenticateUser,
  generateDream
);

export default router;
