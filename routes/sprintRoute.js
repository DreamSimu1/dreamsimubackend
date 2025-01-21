import express from "express";
import {
  createSprint,
  deleteSprint,
  getSprintByRefineTitlt,
  getSprintsByRefine,
  getTask,
  saveTask,
} from "../controller/sprintController.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a sprint
router.post("/sprints", authenticateUser, createSprint);

router.post("/save-task", authenticateUser, saveTask);

router.get("/tasks", authenticateUser, getTask);

router.get(
  "/sprint-by-refine-activity",
  authenticateUser,
  getSprintByRefineTitlt
);

router.get("/sprints/refine/:refineId", authenticateUser, getSprintsByRefine);
// Delete a sprint
router.delete("/sprints/:id", authenticateUser, deleteSprint);

// Get all sprints for a specific refine

export default router;
