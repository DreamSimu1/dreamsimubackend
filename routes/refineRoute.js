// routes/ideaRoutes.js
import express from "express";

import authenticateUser from "../middleware/authMiddleware.js";
import multer from "multer";
import {
  createRefine,
  deleteRefine,
  editRefine,
  getAllRefines,
  getRefineById,
  getRefinesByIdea,
  getRefinesByIdeaId,
  getRefinesByIdeaTitlt,
} from "../controller/refineController.js";
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

router.post("/create-refine", authenticateUser, createRefine);
router.get("/refine/:refineId", authenticateUser, getRefineById);

router.get("/refines-by-idea-title", authenticateUser, getRefinesByIdeaTitlt);
router.get("/refines-by-idea", authenticateUser, getRefinesByIdea);
// In your routes file
router.get("/refines-by-idea-id", authenticateUser, getRefinesByIdeaId);

router.get("/refines", authenticateUser, getAllRefines);
// Edit Refine
router.put("/refine/:refineId", authenticateUser, editRefine); // Use PUT for update

// Delete Refine
router.delete("/refine/:refineId", authenticateUser, deleteRefine); // Use DELETE for deletion

// router.get("/ideas/:visionId", authenticateUser, getIdeasByVision);

// // Delete an idea
// router.delete("/:id", authenticateUser, deleteIdea);

export default router;
