import dotenv from "dotenv";
import cloudinary from "cloudinary";
import multer from "multer";
import Idea from "../models/ideaModel.js";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import Refine from "../models/refineModel.js";

// export const createRefine = async (req, res) => {
//   let { activities, estimatedtime, resources, ideaId } = req.body;
//   console.log(req.body); // Check the fields in the body
//   console.log(req.file); // Check if the file is coming through correctly

//   // Validate all required fields
//   if (!activities || !estimatedtime || !resources || !ideaId) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   // Validate ideaId (not visionId) before querying the database
//   if (!mongoose.Types.ObjectId.isValid(ideaId)) {
//     return res.status(400).json({ message: "Invalid Idea ID" });
//   }

//   try {
//     // Check if the idea exists using the ideaId
//     const idea = await Idea.findById(ideaId).populate("visionId"); // Populate visionId
//     if (!idea) {
//       return res.status(404).json({ message: "Idea not found" });
//     }

//     // Extract the vision information from the populated idea
//     const vision = idea.visionId; // This will give you the full vision object if populated correctly

//     // Create the Refine document
//     const refine = await Refine.create({
//       activities,
//       estimatedtime,
//       resources,
//       ideaId, // This is the ideaId reference in Refine
//       visionId: vision._id, // Add the visionId to the Refine document if needed
//       createdBy: req.user.userId, // Ensure `req.user.id` is populated by the auth middleware
//     });

//     res.status(201).json({
//       message: "Refine created successfully",
//       refine,
//       vision: vision, // You can send the vision back in the response if you want
//     });
//   } catch (error) {
//     console.error("Error creating refine:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Delete an idea

export const createRefine = async (req, res) => {
  const { activities, estimatedtime, resources, ideaId } = req.body;

  if (
    !activities ||
    !estimatedtime?.startDate ||
    !estimatedtime?.endDate ||
    !resources ||
    !ideaId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(ideaId)) {
    return res.status(400).json({ message: "Invalid Idea ID" });
  }

  try {
    const idea = await Idea.findById(ideaId).populate("visionId");
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const vision = idea.visionId;

    const refine = await Refine.create({
      activities,
      estimatedtime: JSON.stringify(estimatedtime),
      resources,
      ideaId,
      visionId: vision._id,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Refine created successfully",
      refine,
      vision,
    });
  } catch (error) {
    console.error("Error creating refine:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Controller for getting all refinements by a specific user
export const getAllRefinesByUser = async (req, res) => {
  try {
    // Find all refinements created by the authenticated user
    const refines = await Refine.find({ createdBy: req.user.userId })
      .populate("ideaId") // Optionally populate related idea details if needed
      .populate("visionId"); // Populate related vision data if needed

    if (refines.length === 0) {
      return res
        .status(404)
        .json({ message: "No refinements found for this user" });
    }

    res.status(200).json(refines);
  } catch (error) {
    console.error("Error fetching refinements:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const deleteRefine = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const idea = await Idea.findById(id);
//     if (!idea) {
//       return res.status(404).json({ message: "Idea not found" });
//     }

//     // Ensure only the creator can delete the idea
//     if (idea.createdBy.toString() !== req.user._id) {
//       return res
//         .status(403)
//         .json({ message: "Not authorized to delete this idea" });
//     }

//     await idea.deleteOne();
//     res.status(200).json({ message: "Idea deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Fetch all ideas for a specific vision
// export const getRefineByIdea = async (req, res) => {
//   const { visionId } = req.params;

//   try {
//     // Find ideas that match the provided visionId
//     const ideas = await Idea.find({ visionId }).populate(
//       "createdBy",
//       "name email"
//     ); // Populate `createdBy` field with user details (optional)

//     if (!ideas || ideas.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No ideas found for this vision" });
//     }

//     res.status(200).json({
//       message: "Ideas fetched successfully",
//       ideas,
//     });
//   } catch (error) {
//     console.error("Error fetching ideas:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
export const getAllRefines = async (req, res) => {
  try {
    // Fetch all refines and populate the related Idea and Vision data
    const refines = await Refine.find()
      .populate("ideaId") // Populate ideaId (Idea document)
      .populate("visionId") // Populate visionId (Vision document)
      .sort({ createdAt: -1 }); // Optionally, sort by creation date, descending

    if (!refines || refines.length === 0) {
      return res.status(404).json({ message: "No refines found" });
    }

    res.status(200).json({
      message: "Refines fetched successfully",
      refines,
    });
  } catch (error) {
    console.error("Error fetching refines:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRefinesByIdea = async (req, res) => {
  try {
    const { ideaId } = req.query;

    if (!ideaId) {
      return res.status(400).json({ message: "ideaId is required" });
    }

    // Fetch refines for the specific idea
    const refines = await Refine.find({ ideaId })
      .populate("ideaId") // Populate idea details
      .populate("visionId") // Populate vision details
      .sort({ createdAt: -1 }); // Optionally sort by creation date

    if (!refines || refines.length === 0) {
      return res
        .status(404)
        .json({ message: "No refines found for this idea" });
    }

    res.status(200).json({
      message: "Refines fetched successfully",
      refines,
    });
  } catch (error) {
    console.error("Error fetching refines by idea:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const getRefinesByIdeaTitlt = async (req, res) => {
//   try {
//     const { title } = req.query; // Use title instead of ideaId

//     if (!title) {
//       return res.status(400).json({ message: "Idea title is required" });
//     }

//     // Step 1: Fetch the ideaId using the title
//     const idea = await Idea.findOne({ title });

//     if (!idea) {
//       return res.status(404).json({ message: "Idea not found" });
//     }

//     const ideaId = idea._id;

//     // Step 2: Fetch refinements using the ideaId
//     const refines = await Refine.find({ ideaId })
//       .populate("ideaId") // Populate idea details
//       .populate("visionId") // Populate vision details
//       .sort({ createdAt: -1 }); // Optionally sort by creation date

//     if (!refines || refines.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No refines found for this idea" });
//     }

//     res.status(200).json({
//       message: "Refines fetched successfully",
//       refines,
//     });
//   } catch (error) {
//     console.error("Error fetching refines by idea title:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getRefinesByIdeaTitlt = async (req, res) => {
//   try {
//     const { title } = req.query; // Use title instead of ideaId

//     if (!title) {
//       return res.status(400).json({ message: "Idea title is required" });
//     }

//     // Step 1: Fetch the ideaId using the title
//     const idea = await Idea.findOne({ title });

//     if (!idea) {
//       return res.status(404).json({ message: "Idea not found" });
//     }

//     const ideaId = idea._id;

//     // Step 2: Fetch refinements using the ideaId
//     const refines = await Refine.find({ ideaId })
//       .populate("ideaId") // Populate idea details
//       // .populate("visionId") // Populate vision details
//       .sort({ createdAt: -1 }); // Optionally sort by creation date

//     // Step 3: Return both the refinements and the ideaId
//     res.status(200).json({
//       message: "Refines fetched successfully",
//       ideaId, // Include ideaId in the response

//       refines,
//     });
//   } catch (error) {
//     console.error("Error fetching refines by idea title:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const getRefinesByIdeaTitlt = async (req, res) => {
  try {
    const { title } = req.query; // Use title instead of ideaId

    if (!title) {
      return res.status(400).json({ message: "Idea title is required" });
    }

    // Step 1: Fetch the idea details using the title
    const idea = await Idea.findOne({ title });

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const ideaId = idea._id;
    const ideaDescription = idea.description; // Fetch the description of the idea

    // Step 2: Fetch refinements using the ideaId
    const refines = await Refine.find({ ideaId })
      .populate("ideaId") // Populate idea details
      .sort({ createdAt: -1 }); // Optionally sort by creation date

    // Step 3: Return the refinements, ideaId, and idea description
    res.status(200).json({
      message: "Refines fetched successfully",
      ideaId, // Include ideaId in the response
      ideaDescription, // Include idea description in the response
      refines,
    });
  } catch (error) {
    console.error("Error fetching refines by idea title:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit Refine API
export const editRefine = async (req, res) => {
  const { activities, estimatedtime, resources, ideaId } = req.body;
  const { refineId } = req.params; // Extract refine ID from the URL

  if (
    !activities ||
    !estimatedtime?.startDate ||
    !estimatedtime?.endDate ||
    !resources ||
    !ideaId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(ideaId)) {
    return res.status(400).json({ message: "Invalid Idea ID" });
  }

  if (!mongoose.Types.ObjectId.isValid(refineId)) {
    return res.status(400).json({ message: "Invalid Refine ID" });
  }

  try {
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const refine = await Refine.findById(refineId);
    if (!refine) {
      return res.status(404).json({ message: "Refine not found" });
    }

    // Update refine fields
    refine.activities = activities;
    refine.estimatedtime = JSON.stringify(estimatedtime);
    refine.resources = resources;
    refine.ideaId = ideaId;

    // Save the updated refine
    await refine.save();

    res.status(200).json({
      message: "Refine updated successfully",
      refine,
    });
  } catch (error) {
    console.error("Error editing refine:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// In your controller file
export const getRefinesByIdeaId = async (req, res) => {
  try {
    const { id } = req.query; // Use id instead of title

    if (!id) {
      return res.status(400).json({ message: "Idea ID is required" });
    }

    // Step 1: Fetch the idea details using the ID
    const idea = await Idea.findById(id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    const ideaDescription = idea.description; // Fetch the description of the idea

    // Step 2: Fetch refinements using the ideaId
    const refines = await Refine.find({ ideaId: id })
      .populate("ideaId") // Populate idea details
      .sort({ createdAt: -1 }); // Optionally sort by creation date

    // Step 3: Return the refinements, ideaId, and idea description
    res.status(200).json({
      message: "Refines fetched successfully",
      ideaId: id, // Include ideaId in the response
      ideaDescription, // Include idea description in the response
      refines,
    });
  } catch (error) {
    console.error("Error fetching refines by idea id:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete Refine API
export const deleteRefine = async (req, res) => {
  const { refineId } = req.params; // Extract refine ID from the URL

  if (!mongoose.Types.ObjectId.isValid(refineId)) {
    return res.status(400).json({ message: "Invalid Refine ID" });
  }

  try {
    // Find and delete the refine by its ID
    const refine = await Refine.findByIdAndDelete(refineId);

    if (!refine) {
      return res.status(404).json({ message: "Refine not found" });
    }

    res.status(200).json({
      message: "Refine deleted successfully",
      refine,
    });
  } catch (error) {
    console.error("Error deleting refine:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRefineById = async (req, res) => {
  const { refineId } = req.params; // Extract refine ID from the URL

  if (!mongoose.Types.ObjectId.isValid(refineId)) {
    return res.status(400).json({ message: "Invalid Refine ID" });
  }

  try {
    const refine = await Refine.findById(refineId)
      .populate("ideaId") // Populate related idea if necessary
      .populate("visionId"); // If needed, populate other fields

    if (!refine) {
      return res.status(404).json({ message: "Refine not found" });
    }

    res.status(200).json({ refine });
  } catch (error) {
    console.error("Error fetching refine:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
