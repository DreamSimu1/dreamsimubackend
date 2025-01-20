// routes/ideaRoutes.js
import express from "express";
import {
  createIdea,
  deleteIdea,
  getIdeasByVision,
  updateIdea,
} from "../controller/ideaController.js";
import authenticateUser from "../middleware/authMiddleware.js";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import dotenv from "dotenv";
const router = express.Router();

// Create an idea

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Temporary directory where multer saves files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // Unique filename for each upload
//   },
// });

// const upload = multer({ storage: storage });
dotenv.config();

// AWS S3 Configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Set up multer with multer-s3 for direct S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "eduprosolution",
    acl: "private", // Set access control list for the uploaded file
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set the content type
    key: (req, file, cb) => {
      const fileKey = `idea/${Date.now()}-${file.originalname}`; // Unique filename
      cb(null, fileKey); // Upload to "visions" folder in the S3 bucket
    },
  }),
});
router.post(
  "/create-idea",
  upload.single("image"),
  authenticateUser,
  createIdea
);
router.get("/ideas/:visionId", authenticateUser, getIdeasByVision);
router.put("/editidea/:id", authenticateUser, updateIdea);
// Delete an idea
router.delete("/:id", authenticateUser, deleteIdea);

export default router;
