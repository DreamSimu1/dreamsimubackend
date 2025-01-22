import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import Sprint from "../models/sprintModel.js"; // Assuming the Sprint model exists
import Task from "../models/taskModel.js"; // Assuming the Sprint model exists
import Refine from "../models/refineModel.js"; // Assuming the Refine model exists
import { S3Client } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import multerS3 from "multer-s3";

dotenv.config();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

// Create a sprint
// export const createSprint = async (req, res) => {
//   const { day, activity, refineId } = req.body;
//   console.log(req.body); // Check the fields in the body
//   console.log(req.file); // Check if the file is coming through correctly

//   // Validate all required fields
//   if (!day || !activity || !refineId) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // Validate refineId before querying the database
//   if (!mongoose.Types.ObjectId.isValid(refineId)) {
//     return res.status(400).json({ message: "Invalid Refine ID" });
//   }

//   try {
//     // Check if the refine exists
//     const refine = await Refine.findById(refineId);
//     if (!refine) {
//       return res.status(404).json({ message: "Refine not found" });
//     }

//     // Create the sprint
//     const sprint = await Sprint.create({
//       day,
//       activity,
//       refineId,
//       createdBy: req.user.userId, // Ensure `req.user.userId` is populated by the auth middleware
//     });

//     res.status(201).json({
//       message: "Sprint created successfully",
//       sprint,
//     });
//   } catch (error) {
//     console.error("Error creating sprint:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// Create a sprint
export const createSprint = async (req, res) => {
  const { day, activity, refineId, tasks } = req.body; // Tasks will be added in the request body
  console.log(req.body); // Check the fields in the body

  // Validate all required fields
  if (!day || !activity || !refineId || !tasks || tasks.length === 0) {
    return res.status(400).json({
      message: "All fields are required and tasks should not be empty",
    });
  }

  // Validate refineId before querying the database
  if (!mongoose.Types.ObjectId.isValid(refineId)) {
    return res.status(400).json({ message: "Invalid Refine ID" });
  }

  try {
    // Check if the refine exists
    const refine = await Refine.findById(refineId);
    if (!refine) {
      return res.status(404).json({ message: "Refine not found" });
    }

    // Create the sprint
    const sprint = await Sprint.create({
      day,
      activity,
      refineId,
      tasks: tasks, // Store the tasks for the specific day
      createdBy: req.user.userId, // Ensure `req.user.userId` is populated by the auth middleware
    });

    res.status(201).json({
      message: "Sprint created successfully",
      sprint,
    });
  } catch (error) {
    console.error("Error creating sprint:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getTask = async (req, res) => {
  const { activity } = req.query; // You can send the activity as a query parameter

  console.log("Activity:", activity); // Log the activity value

  if (!activity) {
    return res.status(400).json({ message: "Activity is required" });
  }

  try {
    // Find tasks by user and activity
    const tasks = await Task.find({
      createdBy: req.user.userId, // Get tasks created by the authenticated user
      activity: activity, // Filter by activity
    }).sort({ day: 1 }); // Optionally, sort by day

    console.log("Tasks found:", tasks); // Log the tasks retrieved

    if (tasks.length === 0) {
      return res
        .status(404)
        .json({ message: "No tasks found for this activity" });
    }

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error retrieving tasks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const saveTask = async (req, res) => {
//   const { title, day, activities } = req.body; // Destructure 'title' instead of 'task'

//   // Log the received data to check if it's being sent correctly
//   console.log("Received task data:", req.body); // Debugging line

//   if (!title || !day || !activities) {
//     return res
//       .status(400)
//       .json({ message: "Title, day, and activities are required" });
//   }

//   try {
//     // Save the task for the activity (or update if it exists)
//     const newTask = await Task.create({
//       title: title, // Use 'title' here instead of 'task.title'
//       day,
//       activity: activities,
//       createdBy: req.user.userId, // Assume authentication middleware sets userId
//     });

//     res.status(201).json({ message: "Task saved successfully", task: newTask });
//   } catch (error) {
//     console.error("Error saving task:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const saveTask = async (req, res) => {
  const { title, day, activities, status } = req.body; // Destructure 'status' along with other fields

  // Log the received data to check if it's being sent correctly
  console.log("Received task data:", req.body); // Debugging line

  if (!title || !day || !activities) {
    return res
      .status(400)
      .json({ message: "Title, day, and activities are required" });
  }

  try {
    // If status is not provided, it will default to 'todo' (as per the schema)
    const newTask = await Task.create({
      title,
      day,
      activity: activities,
      createdBy: req.user.userId, // Assuming authentication middleware sets userId
      status: status || "todo", // Use the status provided or default to 'todo'
    });

    res.status(201).json({ message: "Task saved successfully", task: newTask });
  } catch (error) {
    console.error("Error saving task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const editTask = async (req, res) => {
  const { id } = req.params; // Get the task ID from the route parameters
  const { title, day, activities } = req.body; // Destructure the updated fields from the request body

  // Validate that at least one field is provided (title or day)
  if (!title && !day) {
    return res.status(400).json({ message: "Either title or day is required" });
  }

  try {
    // Find the task by ID and update it, only updating provided fields
    const updatedTask = await Task.findByIdAndUpdate(
      id, // Task ID
      {
        ...(title && { title }), // Only update title if provided
        ...(day && { day }), // Only update day if provided
        // We are leaving activities and archived alone for now
      },
      { new: true } // Return the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // Find the task by ID
    const task = await Task.findById(taskId);

    // If task not found, return 404 error
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update the task's status
    task.status = status;
    await task.save();

    // Return success response
    res.status(200).json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Error updating task" });
  }
};

// GET API to fetch all sprints by activity
export const getSprintsByActivity = async (req, res) => {
  const { activities } = req.query;
  const decodedActivities = decodeURIComponent(activities); // Decode activity name if needed

  try {
    // Fetch sprints related to the decoded activity
    const sprints = await Sprint.find({ activity: decodedActivities }).populate(
      "refineId"
    );
    if (sprints.length === 0) {
      return res
        .status(404)
        .json({ message: "No sprints found for this activity" });
    }

    res.status(200).json({
      message: "Sprints fetched successfully",
      sprints,
    });
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getSprintByRefineTitlt = async (req, res) => {
  try {
    const { activities } = req.query;

    if (!activities) {
      return res.status(400).json({ message: "Activities is required" });
    }

    // Step 1: Find the refine document by activities
    const refine = await Refine.findOne({ activities }); // Fixed field name

    if (!refine) {
      return res.status(404).json({ message: "Refine not found" });
    }

    // Step 2: Use the refineId to find related sprints
    const sprints = await Sprint.find({ refineId: refine._id })
      .populate("refineId", "activities") // Adjusted field to match database structure
      .sort({ createdAt: -1 });

    // Step 3: Return the data
    res.status(200).json({
      message: "Sprints fetched successfully",
      refineId: refine._id,
      refineActivities: refine.activities, // Adjusted field
      refineEstimatedTime: refine.estimatedtime || 0,
      sprints,
    });
  } catch (error) {
    console.error("Error fetching sprints by refine activity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a sprint
export const deleteSprint = async (req, res) => {
  const { id } = req.params;

  try {
    const sprint = await Sprint.findById(id);
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }

    // Ensure only the creator can delete the sprint
    if (sprint.createdBy.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this sprint" });
    }

    await sprint.deleteOne();
    res.status(200).json({ message: "Sprint deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all sprints for a specific refine
export const getSprintsByRefine = async (req, res) => {
  const { refineId } = req.params;

  try {
    // Find sprints that match the provided refineId
    const sprints = await Sprint.find({ refineId }).populate(
      "createdBy",
      "name email"
    ); // Populate `createdBy` field with user details (optional)

    if (!sprints || sprints.length === 0) {
      return res
        .status(404)
        .json({ message: "No sprints found for this refine" });
    }

    res.status(200).json({
      message: "Sprints fetched successfully",
      sprints,
    });
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
