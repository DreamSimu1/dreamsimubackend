import express from "express";
import {
  createSprint,
  deleteSprint,
  editTask,
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
// Update a task
router.put("/edit-task/:id", authenticateUser, editTask);

// Delete a sprint
router.delete("/sprints/:id", authenticateUser, deleteSprint);

// Get all sprints for a specific refine

export default router;
