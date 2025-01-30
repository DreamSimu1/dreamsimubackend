// routes/ideaRoutes.js
import express from "express";
import {
  createIdea,
  deleteIdea,
  getAllIdeas,
  getIdeaById,
  getIdeasByVision,
  updateIdea,
} from "../controller/ideaController.js";
import authenticateUser from "../middleware/authMiddleware.js";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
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
  requestHandler: new NodeHttpHandler({
    requestTimeout: 120000, // 2 minutes timeout
    connectionTimeout: 120000, // 2 minutes connection timeout
  }),
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
router.get("/get-single-idea/:id", authenticateUser, getIdeaById);

router.get("/ideas/:visionId", authenticateUser, getIdeasByVision);
// Define the route to get all ideas for the authenticated user
router.get("/all-ideas", authenticateUser, getAllIdeas);

router.put("/editidea/:id", authenticateUser, updateIdea);
// Delete an idea
router.delete("/idea/:id", authenticateUser, deleteIdea);

export default router;
