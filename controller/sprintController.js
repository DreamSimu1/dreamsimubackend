import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import Sprint from "../models/sprintModel.js"; // Assuming the Sprint model exists
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
export const createSprint = async (req, res) => {
  const { day, activity, refineId } = req.body;
  console.log(req.body); // Check the fields in the body
  console.log(req.file); // Check if the file is coming through correctly

  // Validate all required fields
  if (!day || !activity || !refineId) {
    return res.status(400).json({ message: "All fields are required" });
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
export const getSprintByRefineTitlt = async (req, res) => {
  try {
    const { activities } = req.query;

    if (!activities) {
      return res.status(400).json({ message: "Activities is required" });
    }

    console.log("Activities query parameter:", activities);

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
