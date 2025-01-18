// routes/ideaRoutes.js
import express from "express";
import {
  createIdea,
  deleteIdea,
  getIdeasByVision,
} from "../controller/ideaController.js";
import authenticateUser from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();

// Create an idea

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary directory where multer saves files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename for each upload
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create-idea",
  upload.single("image"),
  authenticateUser,
  createIdea
);
router.get("/ideas/:visionId", authenticateUser, getIdeasByVision);

// Delete an idea
router.delete("/:id", authenticateUser, deleteIdea);

export default router;
