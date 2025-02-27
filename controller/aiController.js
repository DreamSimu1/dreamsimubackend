import {
  generateMilestonePlan,
  generateMultipleImages,
} from "../services/openaiService.js";
import Dream from "../models/DreamModel.js";
import mongoose from "mongoose";
import axios from "axios";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";
import { promisify } from "util";
import { uploadImageToS3 } from "./s3Upload.js";

// const API_KEY =
//   "d77b7e4acfd7287d435857267292d85df59c1845c2e1cdcb0edda6c175264fce"; // Your API key

// export const requestFaceSwap = async (req, res) => {
//   try {
//     const { target_image, swap_image } = req.body;

//     console.log("Received request body:", req.body);

//     if (!target_image || !swap_image) {
//       console.error("Missing images: target_image or swap_image is missing");
//       return res.status(400).json({ error: "Both images are required" });
//     }

//     const requestBody = {
//       target_image,
//       swap_image,
//       result_type: "url",
//     };

//     console.log("Sending request to API with body:", requestBody);

//     const response = await axios.post(
//       "https://api.piapi.ai/api/face_swap/v1/async",
//       requestBody,
//       {
//         headers: {
//           "X-API-Key": API_KEY,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     console.log("API response:", response.data);

//     const task_id = response.data.data.task_id;
//     return res.json({ task_id });
//   } catch (error) {
//     console.error("Error requesting face swap:", error.response?.data || error);
//     return res.status(500).json({ error: "Face swap request failed" });
//   }
// };

const API_KEY =
  "d77b7e4acfd7287d435857267292d85df59c1845c2e1cdcb0edda6c175264fce";

// export const requestFaceSwap = async (req, res) => {
//   try {
//     const { target_image, swap_image } = req.files; // Use `req.files` for FormData

//     console.log("Received images:", target_image, swap_image);

//     if (!target_image || !swap_image) {
//       console.error("Missing images: target_image or swap_image is missing");
//       return res.status(400).json({ error: "Both images are required" });
//     }

//     const formData = new FormData();
//     formData.append("target_image", fs.createReadStream(target_image.path));
//     formData.append("swap_image", fs.createReadStream(swap_image.path));
//     formData.append("result_type", "url");

//     console.log("Sending request to API with FormData...");

//     const response = await axios.post(
//       "https://api.piapi.ai/api/face_swap/v1/async",
//       formData,
//       {
//         headers: {
//           "X-API-Key": API_KEY,
//           ...formData.getHeaders(),
//         },
//       }
//     );

//     console.log("API response:", response.data);

//     const task_id = response.data.data.task_id;
//     return res.json({ task_id });
//   } catch (error) {
//     console.error("Error requesting face swap:", error.response?.data || error);
//     return res.status(500).json({ error: "Face swap request failed" });
//   }
// };
export const requestFaceSwap = async (req, res) => {
  try {
    console.log("Received files:", req.files); // Debugging

    if (!req.files || !req.files["target_image"] || !req.files["swap_image"]) {
      console.error("Missing images: target_image or swap_image is missing");
      return res.status(400).json({ error: "Both images are required" });
    }

    const target_image = req.files["target_image"][0].location; // Get S3 URL
    const swap_image = req.files["swap_image"][0].location; // Get S3 URL

    const requestBody = {
      target_image,
      swap_image,
      result_type: "url",
    };

    console.log("Sending request to API with requestBody:", requestBody);

    const response = await axios.post(
      "https://api.piapi.ai/api/face_swap/v1/async",
      requestBody,
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    console.log("API response:", response.data);

    const task_id = response.data.data.task_id;
    return res.json({ task_id });
  } catch (error) {
    console.error("Error requesting face swap:", error.response?.data || error);
    return res.status(500).json({ error: "Face swap request failed" });
  }
};

// Function to fetch the swapped image

export const fetchFaceSwapResult = async (req, res) => {
  try {
    const { task_id } = req.body;

    if (!task_id) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const response = await axios.post(
      "https://api.piapi.ai/api/face_swap/v1/fetch",
      { task_id },
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching face swap result:",
      error.response?.data || error
    );
    return res.status(500).json({ error: "Fetching face swap result failed" });
  }
};

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

// const downloadImage = async (imageUrl) => {
//   const response = await axios({
//     url: imageUrl,
//     method: "GET",
//     responseType: "arraybuffer",
//   });

//   return Buffer.from(response.data, "binary"); // Convert to buffer
// };

// const downloadImage = async (imageUrl) => {
//   const response = await axios({
//     url: imageUrl,
//     method: "GET",
//     responseType: "arraybuffer",
//   });

//   const tempFilePath = `temp/${Date.now()}.png`;
//   await promisify(fs.writeFile)(tempFilePath, response.data);

//   return tempFilePath;
// };
const downloadImage = async (imageUrl) => {
  const response = await axios({
    url: imageUrl,
    method: "GET",
    responseType: "arraybuffer",
  });

  const tempFilePath = path.join(tempDir, `${Date.now()}.png`);

  await promisify(fs.writeFile)(tempFilePath, response.data);

  return tempFilePath;
};
// export const saveTemplateVision = async (req, res) => {
//   const { title, imageUrl, userId } = req.body;

//   // Validate required fields
//   if (!title || !imageUrl || !userId) {
//     return res
//       .status(400)
//       .json({ error: "Title, imageUrl, and userId are required" });
//   }

//   // Ensure userId is a valid ObjectId
//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     // Save the vision as a new dream entry
//     const dream = new Dream({
//       title,
//       content: `Images generated for: ${title}`,
//       userImageUrl: imageUrl, // Storing the selected image
//       imageUrls: [imageUrl], // Save the selected image in the array
//       userId,
//       isSaved: true,
//     });

//     await dream.save();

//     res.status(201).json({
//       message: "Vision saved successfully",
//       dream,
//     });
//   } catch (error) {
//     console.error("Error saving vision:", error);
//     res.status(500).json({ error: "Failed to save vision" });
//   }
// };

// Get all visions for a specific user

// export const saveTemplateVision = async (req, res) => {
//   const { title, imageUrl, userId } = req.body;
//   let uploadedFileUrl = null;

//   if (!title || !userId) {
//     return res.status(400).json({ error: "Title and userId are required" });
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     if (req.file) {
//       // If user uploaded a file via Multer-S3
//       uploadedFileUrl = req.file.location;
//     } else if (imageUrl) {
//       // If an OpenAI image URL is provided, download and upload
//       const tempFilePath = await downloadImage(imageUrl);
//       const tempFile = {
//         path: tempFilePath,
//         originalname: "openai-generated.png",
//       };

//       // Manually upload using Multer-S3
//       upload.single("file")(req, res, async (err) => {
//         if (err) {
//           console.error("Multer-S3 upload error:", err);
//           return res.status(500).json({ error: "Upload to S3 failed" });
//         }

//         uploadedFileUrl = req.file.location;

//         // Remove the temporary file
//         fs.unlinkSync(tempFilePath);

//         // Save to MongoDB
//         const dream = new Dream({
//           title,
//           content: `Images generated for: ${title}`,
//           userImageUrl: uploadedFileUrl,
//           imageUrls: [uploadedFileUrl],
//           userId,
//           isSaved: true,
//         });

//         await dream.save();

//         return res.status(201).json({
//           message: "Vision saved successfully",
//           dream,
//         });
//       });
//       return;
//     }

//     if (!uploadedFileUrl) {
//       return res
//         .status(400)
//         .json({ error: "No file or valid image URL provided" });
//     }

//     // Save to MongoDB
//     const dream = new Dream({
//       title,
//       content: `Images generated for: ${title}`,
//       userImageUrl: uploadedFileUrl,
//       imageUrls: [uploadedFileUrl],
//       userId,
//       isSaved: true,
//     });

//     await dream.save();

//     res.status(201).json({
//       message: "Vision saved successfully",
//       dream,
//     });
//   } catch (error) {
//     console.error("Error saving vision:", error);
//     res.status(500).json({ error: "Failed to save vision" });
//   }
// };

export const saveTemplateVision = async (req, res) => {
  const { title, imageUrl, userId } = req.body;
  let uploadedFileUrl = null;

  if (!title || !userId) {
    return res.status(400).json({ error: "Title and userId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    if (req.file) {
      // If user uploaded a file via Multer-S3
      uploadedFileUrl = req.file.location;
    } else if (imageUrl) {
      // Upload OpenAI image directly to S3
      uploadedFileUrl = await uploadImageToS3(imageUrl);
    }

    if (!uploadedFileUrl) {
      return res
        .status(400)
        .json({ error: "No file or valid image URL provided" });
    }

    // Save to MongoDB
    const dream = new Dream({
      title,
      content: `Images generated for: ${title}`,
      userImageUrl: uploadedFileUrl,
      imageUrls: [uploadedFileUrl],
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
