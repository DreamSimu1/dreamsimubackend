import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import Idea from "../models/ideaModel.js";
import Vision from "../models/visionModel.js";
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

// Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Temporary file storage location
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname); // Unique filename
//   },
// });

// export const upload = multer({ storage: storage }); // Exported for route usage

// // Create an idea with image
// export const createIdea = async (req, res) => {
//   let { title, description, status, visionId } = req.body;
//   console.log(req.body); // Check the fields in the body
//   console.log(req.file); // Check if the file is coming through correctly

//   // Trim any leading/trailing spaces from the `status` field
//   status = status ? status.trim() : "";

//   // Validate all required fields
//   if (!title || !description || !visionId || !status) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // Ensure the status is valid
//   const validStatuses = ["InProgress", "Refinement", "Completed"];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ message: "Invalid status value" });
//   }

//   try {
//     // Check if the vision exists
//     const vision = await Vision.findById(visionId);
//     if (!vision) {
//       return res.status(404).json({ message: "Vision not found" });
//     }

//     let imageUrl = "";

//     // Handle image upload to Cloudinary (if file is provided)
//     if (req.file) {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: "ideas", // Folder in Cloudinary
//         use_filename: true,
//       });
//       imageUrl = result.secure_url; // Store the Cloudinary URL
//     }

//     // Create the idea
//     const idea = await Idea.create({
//       title,
//       description,
//       status,
//       visionId,
//       imageUrl, // Include image URL
//       createdBy: req.user.userId, // Ensure `req.user.id` is populated by the auth middleware
//     });

//     res.status(201).json({
//       message: "Idea created successfully",
//       idea,
//     });
//   } catch (error) {
//     console.error("Error creating idea:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const createIdea = async (req, res) => {
//   let { title, description, status, visionId } = req.body;
//   console.log(req.body); // Check the fields in the body
//   console.log(req.file); // Check if the file is coming through correctly

//   // Trim any leading/trailing spaces from the `status` field
//   status = status ? status.trim() : "";

//   // Validate all required fields
//   if (!title || !description || !visionId || !status) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // Ensure the status is valid
//   const validStatuses = ["InProgress", "Refinement", "Completed"];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({ message: "Invalid status value" });
//   }

//   // Validate visionId before querying the database
//   if (!mongoose.Types.ObjectId.isValid(visionId)) {
//     return res.status(400).json({ message: "Invalid Vision ID" });
//   }

//   try {
//     // Check if the vision exists
//     const vision = await Vision.findById(visionId);
//     if (!vision) {
//       return res.status(404).json({ message: "Vision not found" });
//     }

//     let imageUrl = "";

//     // Handle image upload to Cloudinary (if file is provided)
//     if (req.file) {
//       const result = await cloudinary.v2.uploader.upload(req.file.path, {
//         folder: "ideas", // Folder in Cloudinary
//         use_filename: true,
//       });
//       imageUrl = result.secure_url; // Store the Cloudinary URL
//     }

//     // Create the idea
//     const idea = await Idea.create({
//       title,
//       description,
//       status,
//       visionId,
//       imageUrl, // Include image URL
//       createdBy: req.user.userId, // Ensure `req.user.id` is populated by the auth middleware
//     });

//     res.status(201).json({
//       message: "Idea created successfully",
//       idea,
//     });
//   } catch (error) {
//     console.error("Error creating idea:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const createIdea = async (req, res) => {
  let { title, description, status, visionId } = req.body;
  console.log(req.body); // Check the fields in the body
  console.log(req.file); // Check if the file is coming through correctly

  // Trim any leading/trailing spaces from the `status` field
  status = status ? status.trim() : "";

  // Validate all required fields
  if (!title || !description || !visionId || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Ensure the status is valid
  const validStatuses = ["InProgress", "Refinement", "Completed"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  // Validate visionId before querying the database
  if (!mongoose.Types.ObjectId.isValid(visionId)) {
    return res.status(400).json({ message: "Invalid Vision ID" });
  }

  try {
    // Check if the vision exists
    const vision = await Vision.findById(visionId);
    if (!vision) {
      return res.status(404).json({ message: "Vision not found" });
    }

    let imageUrl = "";

    // Handle image upload to AWS S3 (if file is provided)
    if (req.file) {
      imageUrl = req.file.location; // This is the S3 URL returned by multer-s3
    }

    // Create the idea
    const idea = await Idea.create({
      title,
      description,
      status,
      visionId,
      imageUrl, // Include image URL
      createdBy: req.user.userId, // Ensure `req.user.id` is populated by the auth middleware
    });

    res.status(201).json({
      message: "Idea created successfully",
      idea,
    });
  } catch (error) {
    console.error("Error creating idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete an idea
export const deleteIdea = async (req, res) => {
  const { id } = req.params;

  try {
    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    if (idea.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this idea" });
    }

    await idea.deleteOne();
    res.status(200).json({ message: "Idea deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch all ideas for a specific vision
export const getIdeasByVision = async (req, res) => {
  const { visionId } = req.params;

  try {
    // Find ideas that match the provided visionId
    const ideas = await Idea.find({ visionId }).populate(
      "createdBy",
      "name email"
    ); // Populate `createdBy` field with user details (optional)

    if (!ideas || ideas.length === 0) {
      return res
        .status(404)
        .json({ message: "No ideas found for this vision" });
    }

    res.status(200).json({
      message: "Ideas fetched successfully",
      ideas,
    });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const updateIdea = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, visionId } = req.body;

  // Validate at least one field is provided for update
  if (!title && !description && !status && !visionId) {
    return res
      .status(400)
      .json({ message: "At least one field is required to update" });
  }

  const validStatuses = ["InProgress", "Refinement", "Completed"];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    // Find the idea by ID
    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    // Ensure only the creator can edit the idea
    if (idea.createdBy.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this idea" });
    }

    // Update only provided fields
    if (title) idea.title = title;
    if (description) idea.description = description;
    if (status) idea.status = status;
    if (visionId) idea.visionId = visionId;

    // If a new image is uploaded, handle the image update
    if (req.file) {
      idea.imageUrl = req.file.location; // AWS S3 URL or Cloudinary URL
    }

    // Save the updated idea
    await idea.save();

    res.status(200).json({
      message: "Idea updated successfully",
      idea,
    });
  } catch (error) {
    console.error("Error updating idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getIdeaById = async (req, res) => {
  const { id } = req.params;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid idea ID" });
  }

  try {
    // Find the idea by ID
    const idea = await Idea.findById(id).populate("createdBy", "name email"); // Populate `createdBy` for additional details (optional)

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    res.status(200).json({
      message: "Idea fetched successfully",
      idea,
    });
  } catch (error) {
    console.error("Error fetching idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
