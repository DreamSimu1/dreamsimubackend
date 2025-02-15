import {
  generateMilestonePlan,
  generateMultipleImages,
} from "../services/openaiService.js";
import Dream from "../models/DreamModel.js";
import mongoose from "mongoose";

export const generateDream = async (req, res) => {
  const { title, userId } = req.body;
  const { location: userImageUrl } = req.file ? req.file : {}; // S3 Image URL

  // Validate required fields
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!userImageUrl) {
    return res.status(400).json({ error: "User image URL is required" });
  }

  // Ensure userId is valid
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // Generate images
    const imageUrls = await generateMultipleImages(
      title,
      "1024x1024",
      userImageUrl
    );

    // Save to database
    const dream = new Dream({
      title,
      content: `Images generated for: ${title}`,
      imageUrls,
      userImageUrl,
      userId,
    });

    await dream.save();

    res.status(201).json({
      message: "Dream generated successfully",
      dream,
    });
  } catch (error) {
    console.error("Error generating dream:", error);
    res.status(500).json({ error: "Failed to generate dream images" });
  }
};

// export const saveTemplateVision = async (req, res) => {
//   const { title, imageUrl, userId } = req.body;

//   // Validate required fields
//   if (!title || !imageUrl || !userId) {
//     return res
//       .status(400)
//       .json({ error: "Title, imageUrl, and userId are required" });
//   }

//   // Ensure userId is valid
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     // Save selected vision to the database
//     const vision = new Vision({
//       title,
//       imageUrl,
//       userId,
//     });

//     await vision.save();

//     res.status(201).json({
//       message: "Vision saved successfully",
//       vision,
//     });
//   } catch (error) {
//     console.error("Error saving vision:", error);
//     res.status(500).json({ error: "Failed to save vision" });
//   }
// };

export const saveTemplateVision = async (req, res) => {
  const { title, imageUrl, userId } = req.body;

  // Validate required fields
  if (!title || !imageUrl || !userId) {
    return res
      .status(400)
      .json({ error: "Title, imageUrl, and userId are required" });
  }

  // Ensure userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // Save the vision as a new dream entry
    const dream = new Dream({
      title,
      content: `Images generated for: ${title}`,
      userImageUrl: imageUrl, // Storing the selected image
      imageUrls: [imageUrl], // Save the selected image in the array
      userId,
      isSaved: true,
    });

    await dream.save();

    res.status(201).json({
      message: "Vision saved successfully",
      dream,
    });
  } catch (error) {
    console.error("Error saving vision:", error);
    res.status(500).json({ error: "Failed to save vision" });
  }
};

// Get all visions for a specific user
export const getTemplateVisions = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const visions = await Dream.find({ userId, isSaved: true }); // Only fetch saved visions
    res.status(200).json(visions);
  } catch (error) {
    console.error("Error fetching visions:", error);
    res.status(500).json({ error: "Failed to fetch visions" });
  }
};

// Get a single vision by ID
export const getTemplateVisionById = async (req, res) => {
  const { visionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(visionId)) {
    return res.status(400).json({ error: "Invalid vision ID" });
  }

  try {
    const vision = await Dream.findById(visionId);

    if (!vision) {
      return res.status(404).json({ error: "Vision not found" });
    }

    res.status(200).json(vision);
  } catch (error) {
    console.error("Error fetching vision:", error);
    res.status(500).json({ error: "Failed to fetch vision" });
  }
};
export const getMilestonePlan = async (req, res) => {
  const { title } = req.params;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const milestonePlan = await generateMilestonePlan(title);
    res.json({ title, milestones: milestonePlan });
  } catch (error) {
    console.error("Error generating milestone plan:", error);
    res.status(500).json({ error: "Failed to generate milestone plan" });
  }
};
