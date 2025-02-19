import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import Idea from "../models/ideaModel.js";
import Vision from "../models/visionModel.js";
import { S3Client } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import multerS3 from "multer-s3";
import Dream from "../models/DreamModel.js";
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

// export const createIdea = async (req, res) => {
//   try {
//     const { entries } = req.body; // Expecting an array of entries
//     console.log("Received entries:", entries);

//     if (!Array.isArray(entries) || entries.length === 0) {
//       return res.status(400).json({ message: "Entries array is required" });
//     }

//     for (const entry of entries) {
//       if (!entry.day || !entry.idea || !entry.visionId) {
//         return res.status(400).json({
//           message:
//             "All fields (day, idea, visionId) are required for each entry",
//         });
//       }

//       if (!mongoose.Types.ObjectId.isValid(entry.visionId)) {
//         return res
//           .status(400)
//           .json({ message: `Invalid Vision ID: ${entry.visionId}` });
//       }
//     }

//     const visionId = entries[0].visionId;
//     const vision = await Dream.findById(visionId);
//     if (!vision) {
//       return res.status(404).json({ message: "Vision not found" });
//     }

//     let ideaDocument = await Idea.findOne({ visionId });

//     if (!ideaDocument) {
//       // If no idea document exists for this vision, create a new one
//       ideaDocument = new Idea({
//         visionId,
//         createdBy: req.user.userId,
//         ideas: entries.map(({ day, idea }) => ({ day, idea })),
//       });
//     } else {
//       // If the document exists, update existing days or add new ones
//       entries.forEach(({ day, idea }) => {
//         const existingIdea = ideaDocument.ideas.find(
//           (entry) => entry.day === day
//         );

//         if (existingIdea) {
//           existingIdea.idea = idea; // Update idea for existing day
//         } else {
//           ideaDocument.ideas.push({ day, idea }); // Add new idea for new day
//         }
//       });
//     }

//     await ideaDocument.save();

//     res.status(201).json({
//       message: "Ideas updated successfully",
//       ideaDocument,
//     });
//   } catch (error) {
//     console.error("Error saving/updating ideas:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const createIdea = async (req, res) => {
  try {
    const { entries, visionId } = req.body; // Extract visionId properly

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: "Entries array is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(visionId)) {
      return res.status(400).json({ message: "Invalid Vision ID" });
    }

    const vision = await Dream.findById(visionId);
    if (!vision) {
      return res.status(404).json({ message: "Vision not found" });
    }

    let ideaDocument = await Idea.findOne({ visionId });

    if (!ideaDocument) {
      ideaDocument = new Idea({
        visionId,
        createdBy: req.user.userId,
        ideas: entries.map(({ day, idea }) => ({ day, idea })),
      });

      await ideaDocument.save();
      return res
        .status(201)
        .json({ message: "New idea document created", ideaDocument });
    }

    // Update or add new ideas
    entries.forEach(({ day, idea }) => {
      const existingIdea = ideaDocument.ideas.find(
        (entry) => entry.day === day
      );
      if (existingIdea) {
        existingIdea.idea = idea;
      } else {
        ideaDocument.ideas.push({ day, idea });
      }
    });

    await ideaDocument.save();

    res
      .status(200)
      .json({ message: "Ideas updated successfully", ideaDocument });
  } catch (error) {
    console.error("Error saving/updating ideas:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

//     // Handle image upload to AWS S3 (if file is provided)
//     if (req.file) {
//       imageUrl = req.file.location; // This is the S3 URL returned by multer-s3
//     }

//     // Create the idea
//     const idea = await Idea.create({
//       title,
//       description,
//       status,
//       visionId,
//       imageUrl, // Include image URL
//       createdBy: req.user.userId,
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
// Controller to fetch all ideas created by the authenticated user
export const getAllIdeas = async (req, res) => {
  try {
    // Fetch all ideas where the createdBy field matches the logged-in user's ID
    const ideas = await Idea.find({ createdBy: req.user.userId });

    // Check if no ideas were found
    if (!ideas || ideas.length === 0) {
      return res.status(404).json({ message: "No ideas found for this user" });
    }

    // Return the list of ideas
    res.status(200).json({
      message: "Ideas fetched successfully",
      ideas,
    });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res
      .status(500)
      .json({ message: "Error fetching ideas", error: error.message });
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
// export const updateIdea = async (req, res) => {
//   const { id } = req.params;
//   const { title, description, status, visionId } = req.body;

//   // Validate at least one field is provided for update
//   if (!title && !description && !status && !visionId) {
//     return res
//       .status(400)
//       .json({ message: "At least one field is required to update" });
//   }

//   const validStatuses = ["InProgress", "Refinement", "Completed"];
//   if (status && !validStatuses.includes(status)) {
//     return res.status(400).json({ message: "Invalid status value" });
//   }

//   try {
//     // Find the idea by ID
//     const idea = await Idea.findById(id);
//     if (!idea) {
//       return res.status(404).json({ message: "Idea not found" });
//     }

//     // Ensure only the creator can edit the idea
//     if (idea.createdBy.toString() !== req.user.userId) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to edit this idea" });
//     }

//     // Update only provided fields
//     if (title) idea.title = title;
//     if (description) idea.description = description;
//     if (status) idea.status = status;
//     if (visionId) idea.visionId = visionId;

//     // If a new image is uploaded, handle the image update
//     if (req.file) {
//       idea.imageUrl = req.file.location; // AWS S3 URL or Cloudinary URL
//     }

//     // Save the updated idea
//     await idea.save();

//     res.status(200).json({
//       message: "Idea updated successfully",
//       idea,
//     });
//   } catch (error) {
//     console.error("Error updating idea:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const updateIdea = async (req, res) => {
//   try {
//     const { id } = req.params; // Correct param name
//     const { day, idea } = req.body; // Extract data from body

//     if (!idea) {
//       return res.status(400).json({ message: "Idea text is required" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid Vision ID" });
//     }

//     const ideaDocument = await Idea.findOne({ visionId: id });

//     if (!ideaDocument) {
//       return res.status(404).json({ message: "Idea document not found" });
//     }

//     // Find the existing idea by day
//     let existingIdea = ideaDocument.ideas.find((entry) => entry.day == day);

//     if (existingIdea) {
//       existingIdea.idea = idea; // Update idea for that day
//     } else {
//       ideaDocument.ideas.push({ day, idea }); // Add new idea if not found
//     }

//     await ideaDocument.save();

//     res
//       .status(200)
//       .json({ message: "Idea updated successfully", ideaDocument });
//   } catch (error) {
//     console.error("Error updating idea:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
export const updateIdea = async (req, res) => {
  try {
    const { id } = req.params; // Vision ID from URL
    const { day, idea } = req.body; // Extract day and idea (single update)

    console.log("Updating idea for visionId:", id);
    console.log("Day:", day, "New Idea:", idea);

    if (!idea) {
      return res.status(400).json({ message: "Idea text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Vision ID" });
    }

    let ideaDocument = await Idea.findOne({ visionId: id });

    if (!ideaDocument) {
      return res.status(404).json({ message: "Idea document not found" });
    }

    // Fix: Ensure comparison is done with a string
    let existingIdea = ideaDocument.ideas.find(
      (entry) => entry.day === String(day)
    );

    if (existingIdea) {
      existingIdea.idea = idea; // ✅ Update the existing idea for that day
    } else {
      return res.status(400).json({ message: `Day ${day} not found` });
    }

    await ideaDocument.save();

    res.status(200).json({
      message: `Idea for Day ${day} updated successfully`,
      ideaDocument,
    });
  } catch (error) {
    console.error("Error updating idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const getIdeaById = async (req, res) => {
//   const { id } = req.params;

//   // Validate the ID
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Invalid idea ID" });
//   }

//   try {
//     // Find the idea by ID
//     const idea = await Idea.findById(id).populate("createdBy", "name email"); // Populate `createdBy` for additional details (optional)

//     if (!idea) {
//       return res.status(404).json({ message: "Idea not found" });
//     }

//     res.status(200).json({
//       message: "Idea fetched successfully",
//       idea,
//     });
//   } catch (error) {
//     console.error("Error fetching idea:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// export const getIdeaById = async (req, res) => {
//   try {
//     const { visionId, day } = req.params;

//     const ideaDocument = await Idea.findOne({ visionId });

//     if (!ideaDocument) {
//       return res.status(404).json({ message: "Idea document not found" });
//     }

//     const ideaEntry = ideaDocument.ideas.find((entry) => entry.day == day);

//     if (!ideaEntry) {
//       return res.status(404).json({ message: "Idea for this day not found" });
//     }

//     res.status(200).json({ idea: ideaEntry.idea });
//   } catch (error) {
//     console.error("Error fetching idea:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getIdeaById = async (req, res) => {
  try {
    const { id } = req.params; // Get visionId from params

    const ideaDocument = await Idea.findOne({ visionId: id });

    if (!ideaDocument) {
      return res.status(404).json({ message: "Idea document not found" });
    }

    res.status(200).json({ ideas: ideaDocument.ideas }); // Return all ideas
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
