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
// import { pipeline } from "stream";
import { promisify } from "util";
import { uploadImageToS3 } from "./s3Upload.js";
import { pipeline } from "stream/promises";
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import util from "util";
import stream from "stream";
import path from "path";
import { Jimp } from "jimp";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
// const streamPipeline = promisify(pipeline);

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

// const API_KEY =
//   "d77b7e4acfd7287d435857267292d85df59c1845c2e1cdcb0edda6c175264fce";

// // export const requestFaceSwap = async (req, res) => {
// //   try {
// //     const { target_image, swap_image } = req.files; // Use `req.files` for FormData

// //     console.log("Received images:", target_image, swap_image);

// //     if (!target_image || !swap_image) {
// //       console.error("Missing images: target_image or swap_image is missing");
// //       return res.status(400).json({ error: "Both images are required" });
// //     }

// //     const formData = new FormData();
// //     formData.append("target_image", fs.createReadStream(target_image.path));
// //     formData.append("swap_image", fs.createReadStream(swap_image.path));
// //     formData.append("result_type", "url");

// //     console.log("Sending request to API with FormData...");

// //     const response = await axios.post(
// //       "https://api.piapi.ai/api/face_swap/v1/async",
// //       formData,
// //       {
// //         headers: {
// //           "X-API-Key": API_KEY,
// //           ...formData.getHeaders(),
// //         },
// //       }
// //     );

// //     console.log("API response:", response.data);

// //     const task_id = response.data.data.task_id;
// //     return res.json({ task_id });
// //   } catch (error) {
// //     console.error("Error requesting face swap:", error.response?.data || error);
// //     return res.status(500).json({ error: "Face swap request failed" });
// //   }
// // };
// export const requestFaceSwap = async (req, res) => {
//   try {
//     console.log("Received files:", req.files); // Debugging

//     if (!req.files || !req.files["target_image"] || !req.files["swap_image"]) {
//       console.error("Missing images: target_image or swap_image is missing");
//       return res.status(400).json({ error: "Both images are required" });
//     }

//     const target_image = req.files["target_image"][0].location; // Get S3 URL
//     const swap_image = req.files["swap_image"][0].location; // Get S3 URL

//     const requestBody = {
//       target_image,
//       swap_image,
//       result_type: "url",
//     };

//     console.log("Sending request to API with requestBody:", requestBody);

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
const API_URL = process.env.FACE_SWAP_API_URL;
const API_KEY = process.env.FACE_SWAP_API_KEY;

// export const requestFaceSwap = async (req, res) => {
//   try {
//     console.log("Received files:", req.files); // Debugging

//     if (!req.files || !req.files["target_image"] || !req.files["swap_image"]) {
//       console.error("Missing images: target_image or swap_image is missing");
//       return res.status(400).json({ error: "Both images are required" });
//     }

//     const target_image = req.files["target_image"][0].location; // Get S3 URL
//     const swap_image = req.files["swap_image"][0].location; // Get S3 URL

//     const requestBody = {
//       target_image,
//       swap_image,
//       result_type: "url",
//     };

//     console.log("Sending request to API with requestBody:", requestBody);

//     const response = await axios.post(API_URL, requestBody, {
//       headers: {
//         "X-API-Key": API_KEY,
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//     });

//     console.log("API response:", response.data);

//     const task_id = response.data.data.task_id;
//     return res.json({ task_id });
//   } catch (error) {
//     console.error("Error requesting face swap:", error.response?.data || error);
//     return res.status(500).json({ error: "Face swap request failed" });
//   }
// };
// // Function to fetch the swapped image

// export const fetchFaceSwapResult = async (req, res) => {
//   try {
//     const { task_id } = req.body;

//     if (!task_id) {
//       return res.status(400).json({ error: "Task ID is required" });
//     }

//     const response = await axios.post(
//       "https://api.piapi.ai/api/face_swap/v1/fetch",
//       { task_id },
//       {
//         headers: {
//           "X-API-Key": API_KEY,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     return res.json(response.data);
//   } catch (error) {
//     console.error(
//       "Error fetching face swap result:",
//       error.response?.data || error
//     );
//     return res.status(500).json({ error: "Fetching face swap result failed" });
//   }
// };

// export const generateDream = async (req, res) => {
//   const { title, userId } = req.body;
//   const { location: userImageUrl } = req.file ? req.file : {}; // S3 Image URL

//   // Validate required fields
//   if (!title) {
//     return res.status(400).json({ error: "Title is required" });
//   }

//   if (!userImageUrl) {
//     return res.status(400).json({ error: "User image URL is required" });
//   }

//   // Ensure userId is valid
//   if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     // Generate images
//     const imageUrls = await generateMultipleImages(
//       title,
//       "1024x1024",
//       userImageUrl
//     );

//     // Save to database
//     const dream = new Dream({
//       title,
//       content: `Images generated for: ${title}`,
//       imageUrls,
//       userImageUrl,
//       userId,
//     });

//     await dream.save();

//     res.status(201).json({
//       message: "Dream generated successfully",
//       dream,
//     });
//   } catch (error) {
//     console.error("Error generating dream:", error);
//     res.status(500).json({ error: "Failed to generate dream images" });
//   }
// };

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

// export const generateDream = async (req, res) => {
//   const { title, userId } = req.body;
//   const { location: userImageUrl } = req.file ? req.file : {}; // S3 Image URL

//   if (!title || !userId || !userImageUrl) {
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     // Step 1: Generate AI Images
//     const generatedImages = await generateMultipleImages(
//       title,
//       "1024x1024",
//       userImageUrl
//     );
//     if (!generatedImages.length) throw new Error("Image generation failed");

//     const targetImageUrl = generatedImages[0]; // Use first AI-generated image

//     // Step 2: Call Face Swap API
//     const swapResponse = await axios.post(
//       // `${process.env.FACE_SWAP_API_URL}/face-swap`,
//       `${process.env.FACE_SWAP_API_URL}`,
//       { target_image: targetImageUrl, swap_image: userImageUrl },
//       { headers: { Authorization: `Bearer ${process.env.FACE_SWAP_API_KEY}` } }
//     );

//     if (!swapResponse.data || !swapResponse.data.swappedImageUrl) {
//       throw new Error("Face swap failed");
//     }

//     const swappedImageUrl = swapResponse.data.swappedImageUrl;

//     // Step 3: Save the result in MongoDB
//     const dream = new Dream({
//       title,
//       content: `Vision created for: ${title}`,
//       userImageUrl,
//       imageUrls: [swappedImageUrl], // Store swapped image
//       userId,
//     });

//     await dream.save();

//     res.status(201).json({ message: "Dream generated successfully", dream });
//   } catch (error) {
//     console.error("Error generating dream:", error);
//     res.status(500).json({ error: "Failed to generate vision" });
//   }
// };
// export const generateDream = async (req, res) => {
//   console.log("Received request to generate dream...");

//   const { title, userId } = req.body;
//   const { location: userImageUrl } = req.file ? req.file : {}; // S3 Image URL

//   console.log("Received Data:", { title, userId, userImageUrl });

//   if (!title || !userId || !userImageUrl) {
//     console.error("Missing required fields:", { title, userId, userImageUrl });
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     console.error("Invalid userId:", userId);
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     console.log("Generating AI Images...");
//     const generatedImages = await generateMultipleImages(
//       title,
//       "1024x1024",
//       userImageUrl
//     );

//     console.log("Generated Images:", generatedImages);

//     if (!generatedImages.length) throw new Error("Image generation failed");

//     const targetImageUrl = generatedImages[0]; // Use first AI-generated image

//     console.log("Calling Face Swap API...");
//     const swapResponse = await axios.post(
//       `${process.env.FACE_SWAP_API_URL}`,
//       { target_image: targetImageUrl, swap_image: userImageUrl },
//       { headers: { Authorization: `Bearer ${process.env.FACE_SWAP_API_KEY}` } }
//     );

//     console.log("Face Swap API Response:", swapResponse.data);

//     if (!swapResponse.data || !swapResponse.data.swappedImageUrl) {
//       throw new Error("Face swap failed");
//     }

//     const swappedImageUrl = swapResponse.data.swappedImageUrl;

//     console.log("Saving dream to database...");

//     const dream = new Dream({
//       title,
//       content: `Vision created for: ${title}`,
//       userImageUrl,
//       imageUrls: [swappedImageUrl], // Store swapped image
//       userId,
//     });

//     await dream.save();

//     console.log("Dream successfully saved:", dream);

//     res.status(201).json({ message: "Dream generated successfully", dream });
//   } catch (error) {
//     console.error("Error generating dream:", error);
//     res.status(500).json({ error: "Failed to generate vision" });
//   }
// };

// export const generateDream = async (req, res) => {
//   console.log("Received request to generate dream...");

//   const { title, userId } = req.body;
//   const { location: userImageUrl } = req.file ? req.file : {}; // S3 Image URL

//   console.log("Received Data:", { title, userId, userImageUrl });

//   if (!title || !userId || !userImageUrl) {
//     console.error("Missing required fields:", { title, userId, userImageUrl });
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     console.error("Invalid userId:", userId);
//     return res.status(400).json({ error: "Invalid user ID" });
//   }

//   try {
//     console.log("Generating AI Images...");
//     const generatedImages = await generateMultipleImages(
//       title,
//       "1024x1024",
//       userImageUrl
//     );

//     console.log("Generated Images:", generatedImages);

//     if (!generatedImages.length) throw new Error("Image generation failed");

//     const targetImageUrl = generatedImages[0]; // Use first AI-generated image

//     console.log("Calling Face Swap API...");
//     const swapResponse = await axios.post(
//       "http://localhost:8000/api/face-swap",
//       { target_image: targetImageUrl, swap_image: userImageUrl }
//     );

//     console.log("Face Swap API Response:", swapResponse.data);

//     if (!swapResponse.data || !swapResponse.data.task_id) {
//       throw new Error("Face swap initiation failed");
//     }

//     const taskId = swapResponse.data.task_id;

//     // Wait and fetch the final swapped image result
//     console.log("Fetching Face Swap Result...");
//     let swappedImageUrl = null;
//     for (let i = 0; i < 10; i++) {
//       await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s before polling

//       const fetchResponse = await axios.get(
//         `http://localhost:8000/api/fetch-result`,
//         { params: { task_id: taskId } }
//       );

//       console.log("Fetch Result API Response:", fetchResponse.data);

//       if (fetchResponse.data?.data?.status === "success") {
//         swappedImageUrl = fetchResponse.data.data.image;
//         break;
//       }
//     }

//     if (!swappedImageUrl) {
//       throw new Error("Face swap result not available");
//     }

//     console.log("Saving dream to database...");

//     const dream = new Dream({
//       title,
//       content: `Vision created for: ${title}`,
//       userImageUrl,
//       imageUrls: [swappedImageUrl], // Store swapped image
//       userId,
//     });

//     await dream.save();

//     console.log("Dream successfully saved:", dream);

//     res.status(201).json({ message: "Dream generated successfully", dream });
//   } catch (error) {
//     console.error("Error generating dream:", error);
//     res.status(500).json({ error: "Failed to generate vision" });
//   }
// };

// export const generateDream = async (req, res) => {
//   console.log("📩 Received request to generate dream...");

//   const { title, userId } = req.body;
//   const { location: userImageUrl } = req.file || {}; // User-uploaded image URL

//   console.log("📥 Received Data:", { title, userId, userImageUrl });

//   if (!title || !userId || !userImageUrl) {
//     console.error("⚠️ Missing required fields:", {
//       title,
//       userId,
//       userImageUrl,
//     });
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   let tempTargetFilePath = "./temp_target_image.jpg";
//   let tempUserFilePath = "./temp_user_image.jpg";

//   try {
//     console.log("🖼️ Generating AI Images...");
//     const generatedImages = await generateMultipleImages(
//       title,
//       "1024x1024",
//       userImageUrl
//     );

//     if (!generatedImages.length)
//       throw new Error("🚫 AI Image generation failed");

//     const targetImageUrl = generatedImages[0]; // AI-generated image URL
//     console.log("✅ AI Generated Image (Target):", targetImageUrl);

//     // 🔽 Step 1: Download the AI-generated image
//     console.log("⬇️ Downloading AI-generated image...");
//     const targetImageResponse = await axios({
//       url: targetImageUrl,
//       responseType: "stream",
//     });
//     const targetWriter = fs.createWriteStream(tempTargetFilePath);
//     await pipeline(targetImageResponse.data, targetWriter);
//     console.log("📥 AI-generated image saved to:", tempTargetFilePath);

//     // 🔽 Step 2: Download the user-uploaded image
//     console.log("⬇️ Downloading user image for face swap...");
//     const userImageResponse = await axios({
//       url: userImageUrl,
//       responseType: "stream",
//     });
//     const userWriter = fs.createWriteStream(tempUserFilePath);
//     await pipeline(userImageResponse.data, userWriter);
//     console.log("📥 User image saved to:", tempUserFilePath);

//     // 🔄 Step 3: Prepare FormData for Face Swap API
//     const formData = new FormData();
//     formData.append("target_image", fs.createReadStream(tempTargetFilePath));
//     formData.append("swap_image", fs.createReadStream(tempUserFilePath));

//     console.log("🚀 Calling Face Swap API...");
//     let swapResponse;

//     try {
//       swapResponse = await axios.post(
//         "http://localhost:8000/api/face-swap",
//         formData,
//         {
//           headers: { ...formData.getHeaders(), Accept: "application/json" },
//         }
//       );
//       console.log("🔥 Raw API Response:", swapResponse?.data);
//     } catch (error) {
//       console.error("🚨 Face Swap API request failed:", error.message);
//       return res.status(500).json({ error: "Face Swap API request failed" });
//     }

//     // Extract task ID
//     const taskId = swapResponse?.data?.task_id;

//     if (!taskId) {
//       console.error("❌ No task_id found in response:", swapResponse?.data);
//       return res.status(500).json({ error: "No task ID returned." });
//     }

//     console.log("🆔 Task ID received:", taskId);

//     let swappedImageUrl = null;

//     for (let i = 0; i < 10; i++) {
//       console.log(`⏳ Checking face swap status... Attempt ${i + 1}`);
//       await new Promise((resolve) => setTimeout(resolve, 20000));

//       try {
//         const fetchResponse = await axios.get(
//           // `https://api.piapi.ai/api/v1/task/${taskId}`,
//           `https://api.piapi.ai/api/v1/task/${taskId}`,

//           {
//             headers: {
//               "X-API-Key": API_KEY,
//               "Content-Type": "application/json",
//               Accept: "application/json",
//             },
//           }
//         );

//         console.log("📡 Task Status API Response:", fetchResponse.data);

//         if (fetchResponse.data?.data?.status === "completed") {
//           swappedImageUrl = fetchResponse.data.data.output.image_url;
//           console.log("🎭 Face swap successful! Image URL:", swappedImageUrl);
//           break;
//         }
//       } catch (error) {
//         console.error(
//           "🚨 Error fetching from PiAPI task endpoint:",
//           error.message
//         );
//       }
//     }

//     if (!swappedImageUrl) {
//       throw new Error(
//         "❌ Face swap result not available after multiple attempts."
//       );
//     }

//     // 💾 Step 5: Save the swapped image in the database
//     console.log("💾 Saving dream to database...");
//     const dream = new Dream({
//       title,
//       content: `Vision created for: ${title}`,
//       userImageUrl,
//       imageUrls: [swappedImageUrl],
//       userId,
//     });

//     await dream.save();
//     console.log("✅ Dream successfully saved:", dream);

//     res.status(201).json({
//       message: "Dream generated successfully",
//       image: swappedImageUrl,
//       dream,
//     });
//   } catch (error) {
//     console.error("🚨 Error generating dream:", error.message);

//     res
//       .status(500)
//       .json({ error: "Failed to generate vision", details: error.message });
//   } finally {
//     // 🧹 Cleanup temp files
//     if (fs.existsSync(tempTargetFilePath)) fs.unlinkSync(tempTargetFilePath);
//     if (fs.existsSync(tempUserFilePath)) fs.unlinkSync(tempUserFilePath);
//   }
// };
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  signatureVersion: "v4",
});
const BUCKET_NAME = "eduprosolution";
// export const generateDream = async (req, res) => {
//   try {
//     console.log("📩 Received request to generate dream...");
//     const { title, userId } = req.body;
//     const userImageFile = req.file;

//     if (!title || !userId || !userImageFile?.location) {
//       console.error("🚨 Missing required fields");
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     console.log("✅ File is available at:", userImageFile.location);
//     const fileKey = userImageFile.key;

//     // Step 1: Download the image from S3
//     const tempFilePath = await downloadFileFromS3(BUCKET_NAME, fileKey);
//     console.log("📥 Image downloaded from S3:", tempFilePath);

//     // Step 2: Send the image to Remove.bg API
//     const formData = new FormData();
//     formData.append("image_file", fs.createReadStream(tempFilePath));
//     formData.append("size", "auto");
//     formData.append("format", "png");

//     console.log("📤 Sending image to Remove.bg...");
//     const bgRemovalResponse = await axios.post(
//       "https://api.remove.bg/v1.0/removebg",
//       formData,
//       {
//         headers: {
//           "X-Api-Key": REMOVE_BG_API_KEY,
//           ...formData.getHeaders(),
//         },
//         responseType: "arraybuffer",
//       }
//     );

//     console.log("✅ Background removed successfully");

//     // Step 3: Save the processed image locally
//     const processedFilePath = `/tmp/processed_${Date.now()}_${
//       path.parse(fileKey).name
//     }.png`;
//     fs.writeFileSync(processedFilePath, bgRemovalResponse.data);

//     // Step 4: Use Sharp to optimize the image
//     const finalOutputPath = `/tmp/final_${Date.now()}_${
//       path.parse(fileKey).name
//     }.png`;
//     await sharp(processedFilePath)
//       .png({ quality: 100 })
//       .toFile(finalOutputPath);

//     console.log("✅ Image optimized with Sharp");

//     // Step 5: Upload the final processed image to S3
//     const processedImageUrl = await uploadToS3(
//       finalOutputPath,
//       `processed/${Date.now()}_${path.parse(fileKey).name}.png`
//     );
//     console.log("📤 Processed image uploaded to S3:", processedImageUrl);

//     // Step 6: Cleanup local temp files
//     fs.unlinkSync(tempFilePath);
//     fs.unlinkSync(processedFilePath);
//     fs.unlinkSync(finalOutputPath);
//     console.log("🗑️ Temporary files deleted");

//     // Step 7: Delete the original image from S3
//     await s3.send(
//       new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey })
//     );
//     console.log("🗑️ Original file deleted from S3:", fileKey);

//     // Return the final processed image URL
//     res.json({ imagePath: processedImageUrl });
//   } catch (error) {
//     console.error("🚨 Error generating dream:", error.message);
//     res.status(500).json({ error: "Failed to process image" });
//   }
// };

// Function to download file from S3
// const downloadFileFromS3 = async (bucket, key) => {
//   const tempFilePath = `/tmp/${Date.now()}_${path.basename(key)}`;
//   const { Body } = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
//   const fileStream = fs.createWriteStream(tempFilePath);
//   await new Promise((resolve, reject) => {
//     Body.pipe(fileStream)
//       .on("finish", resolve)
//       .on("error", reject);
//   });
//   return tempFilePath;
// };
// export const generateDream = async (req, res) => {
//   try {
//     console.log("📩 Received request to generate dream...");
//     const { title, userId } = req.body;
//     const userImageFile = req.file;

//     if (!title || !userId || !userImageFile?.location) {
//       console.error("🚨 Missing required fields");
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     console.log("✅ File is available at:", userImageFile.location);
//     const fileKey = userImageFile.key;

//     // Step 1: Download the image from S3
//     const tempFilePath = await downloadFileFromS3(BUCKET_NAME, fileKey);
//     console.log("📥 Image downloaded from S3:", tempFilePath);

//     // Step 2: Send the image to Remove.bg API
//     const formData = new FormData();
//     formData.append("image_file", fs.createReadStream(tempFilePath));
//     formData.append("size", "auto");
//     formData.append("format", "png");

//     console.log("📤 Sending image to Remove.bg...");
//     const bgRemovalResponse = await axios.post(
//       "https://api.remove.bg/v1.0/removebg",
//       formData,
//       {
//         headers: {
//           "X-Api-Key": REMOVE_BG_API_KEY,
//           ...formData.getHeaders(),
//         },
//         responseType: "arraybuffer",
//       }
//     );

//     console.log("✅ Background removed successfully");

//     // Step 3: Save the processed image locally
//     const processedFilePath = `/tmp/processed_${Date.now()}_${
//       path.parse(fileKey).name
//     }.png`;
//     fs.writeFileSync(processedFilePath, bgRemovalResponse.data);

//     // Step 4: Generate AI background image
//     const generatedImages = await generateMultipleImages(title, "1024x1024");
//     console.log("📩 AI Image Generation Response:", generatedImages);

//     if (!generatedImages || generatedImages.length === 0) {
//       console.error("🚨 AI Image generation failed: No images received.");
//       return res.status(500).json({ error: "AI Image generation failed" });
//     }

//     const targetImageUrl = generatedImages[0];
//     console.log("✅ AI Generated Image URL:", targetImageUrl);

//     // Step 5: Download AI-generated image
//     const aiImageFileKey = `ai_generated/${Date.now()}_${title.replace(
//       /\s+/g,
//       "_"
//     )}.png`;
//     const aiImagePath = await downloadImageFromURL(
//       targetImageUrl,
//       `/tmp/${aiImageFileKey}`
//     );
//     console.log("📥 AI Generated Image downloaded:", aiImagePath);

//     // Step 6: Overlay the removed background image onto the AI-generated image using Sharp
//     const finalCompositePath = `/tmp/composite_${Date.now()}_${
//       path.parse(fileKey).name
//     }.png`;
//     await sharp(aiImagePath)
//       .composite([{ input: processedFilePath, gravity: "center" }])
//       .png({ quality: 100 })
//       .toFile(finalCompositePath);

//     console.log("✅ Image composition completed");

//     // Step 7: Upload the final composite image to S3
//     const finalImageUrl = await uploadToS3(
//       finalCompositePath,
//       `final_composites/${Date.now()}_${path.parse(fileKey).name}.png`
//     );
//     console.log("📤 Final composite image uploaded to S3:", finalImageUrl);

//     // Step 8: Cleanup temporary files
//     fs.unlinkSync(tempFilePath);
//     fs.unlinkSync(processedFilePath);
//     fs.unlinkSync(aiImagePath);
//     fs.unlinkSync(finalCompositePath);
//     console.log("🗑️ Temporary files deleted");

//     // Step 9: Delete the original image from S3
//     await s3.send(
//       new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey })
//     );
//     console.log("🗑️ Original file deleted from S3:", fileKey);

//     // Return the final processed image URL
//     res.json({ imagePath: finalImageUrl });
//   } catch (error) {
//     console.error("🚨 Error generating dream:", error.message);
//     res.status(500).json({ error: "Failed to process image" });
//   }
// };

// Ensure this function downloads an image from a URL
const downloadImage = async (imageUrl, outputPath) => {
  const response = await axios({
    url: imageUrl,
    responseType: "arraybuffer",
  });
  fs.writeFileSync(outputPath, response.data);
};

// const downloadImage = async (imageUrl) => {
//   const response = await axios({
//     url: imageUrl,
//     method: "GET",
//     responseType: "arraybuffer",
//   });

//   const tempFilePath = path.join(tempDir, `${Date.now()}.png`);

//   await promisify(fs.writeFile)(tempFilePath, response.data);

//   return tempFilePath;
// };

export const generateDream = async (req, res) => {
  try {
    console.log("📩 Received request to generate dream...");
    const { title, userId } = req.body;
    const userImageFile = req.file;

    if (!title || !userId || !userImageFile?.location) {
      console.error("🚨 Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    console.log("✅ File is available at:", userImageFile.location);
    const fileKey = userImageFile.key;

    // Step 1: Download the image from S3
    const tempFilePath = `/tmp/${path.basename(fileKey)}`;
    await downloadImage(userImageFile.location, tempFilePath);
    console.log("📥 Image downloaded from S3:", tempFilePath);

    // Step 2: Remove Background
    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(tempFilePath));
    formData.append("size", "auto");
    formData.append("format", "png");

    console.log("📤 Sending image to Remove.bg...");
    const bgRemovalResponse = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    console.log("✅ Background removed successfully");

    // Save the removed background image
    const removedBgPath = `/tmp/removed_bg_${Date.now()}.png`;
    fs.writeFileSync(removedBgPath, bgRemovalResponse.data);

    // Step 3: Generate AI Image
    const generatedImages = await generateMultipleImages(title, "1024x1024");
    console.log("📩 AI Image Generation Response:", generatedImages);

    if (!generatedImages || generatedImages.length === 0) {
      console.error("🚨 AI Image generation failed: No images received.");
      return res.status(500).json({ error: "AI Image generation failed" });
    }

    const aiImageUrl = generatedImages[0];
    console.log("✅ AI Generated Image URL:", aiImageUrl);

    // Step 4: Download AI-generated image
    const aiImagePath = `/tmp/ai_generated_${Date.now()}.png`;
    await downloadImage(aiImageUrl, aiImagePath);
    console.log("📥 AI Generated Image downloaded:", aiImagePath);

    // Step 5: Overlay removed background image on AI-generated image
    const finalImagePath = `/tmp/final_dream_${Date.now()}.png`;

    await sharp(aiImagePath)
      .composite([{ input: removedBgPath, gravity: "center" }])
      .toFile(finalImagePath);

    console.log("✅ Image composited successfully:", finalImagePath);

    // Step 6: Upload final image to S3
    const finalImageUrl = await uploadToS3(
      finalImagePath,
      `final_dreams/${Date.now()}_${path.basename(finalImagePath)}`
    );
    console.log("📤 Final image uploaded to S3:", finalImageUrl);

    // Cleanup temporary files
    [tempFilePath, removedBgPath, aiImagePath, finalImagePath].forEach((file) =>
      fs.unlinkSync(file)
    );
    console.log("🗑️ Temporary files deleted");

    res.json({ imagePath: finalImageUrl });
  } catch (error) {
    console.error("🚨 Error generating dream:", error.message);
    res.status(500).json({ error: "Failed to process image" });
  }
};

const REMOVE_BG_API_KEY = process.env.REMOVE_API_KEY;

// export const RemoveBg = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded" });
//     }

//     const filePath = req.file.path;
//     const formData = new FormData();
//     formData.append("image_file", fs.createReadStream(filePath));
//     formData.append("size", "auto");

//     const response = await axios.post(
//       "https://api.remove.bg/v1.0/removebg",
//       formData,
//       {
//         headers: {
//           "X-Api-Key": REMOVE_BG_API_KEY,
//           ...formData.getHeaders(),
//         },
//         responseType: "arraybuffer", // Expect binary data as response
//       }
//     );

//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath); // Cleanup uploaded file

//     res.set("Content-Type", "image/png");
//     res.send(response.data);
//   } catch (error) {
//     console.error(
//       "Error removing background:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({ error: "Failed to process image" });
//   }
// };

// export const requestFaceSwap = async (req, res) => {
//   try {
//     console.log("📩 Received face swap request...");
//     console.log("📸 Uploaded Files:", req.files);

//     if (!req.files || !req.files["target_image"] || !req.files["swap_image"]) {
//       console.error(
//         "⚠️ Missing images: Both target and swap images are required."
//       );
//       return res.status(400).json({ error: "Both images are required" });
//     }

//     const target_image = req.files["target_image"][0].location;
//     const swap_image = req.files["swap_image"][0].location;
//     console.log("🖼️ Target Image URL:", target_image);
//     console.log("🖼️ Swap Image URL:", swap_image);
//     console.log("🔑 API Key Being Used:", API_KEY || "No API key found!");
//     console.log("🌍 API URL:", API_URL || "No API URL found!");

//     console.log("🖼️ Target Image URL:", target_image);
//     console.log("🖼️ Swap Image URL:", swap_image);

//     const requestBody = {
//       target_image,
//       swap_image,
//       result_type: "url",
//     };

//     console.log("📤 Sending request to Face Swap API with:", requestBody);

//     const response = await axios.post(API_URL, requestBody, {
//       headers: {
//         "X-API-Key": API_KEY,
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//     });
//     console.log("🔑 API Key Being Used:", API_KEY);

//     console.log("🌐 API Response:", response.data);

//     if (!response.data || !response.data.data || !response.data.data.task_id) {
//       console.error("❌ API did not return a valid task_id!");
//       return res.status(500).json({ error: "Face swap request failed" });
//     }

//     const task_id = response.data.data.task_id;
//     console.log("🆔 Task ID from API:", task_id);

//     return res.json({ task_id });
//   } catch (error) {
//     console.error(
//       "🚨 Error requesting face swap:",
//       error.response?.data || error
//     );
//     return res.status(500).json({ error: "Face swap request failed" });
//   }
// };
// export const checkFaceSwapStatus = async (req, res) => {
//   try {
//     const { task_id } = req.params;

//     if (!task_id) {
//       return res.status(400).json({ error: "Task ID is required" });
//     }

//     console.log(`🔍 Checking status for task ID: ${task_id}`);

//     const response = await axios.get(
//       `https://api.piapi.ai/api/face_swap/v1/status/${task_id}`,
//       {
//         headers: {
//           "X-API-Key": API_KEY,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );

//     console.log("🔍 Full Status Response:", response.data); // Log full response

//     return res.json(response.data);
//   } catch (error) {
//     console.error(
//       "🚨 Error checking face swap status:",
//       error.response?.data || error
//     );
//     return res.status(500).json({ error: "Failed to check face swap status" });
//   }
// };

// Utility function to download file from S3
const downloadFileFromS3 = async (bucket, key) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const { Body } = await s3.send(command);
  const pipeline = util.promisify(stream.pipeline);
  const tempFilePath = path.join("/tmp", path.basename(key)); // Temporary file path

  const writeStream = fs.createWriteStream(tempFilePath);
  await pipeline(Body, writeStream);
  return tempFilePath;
};
const processedDir = "/tmp/processed_dreams";
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}
const uploadToS3 = async (filePath, key) => {
  const fileStream = fs.createReadStream(filePath);
  const uploadParams = {
    Bucket: "eduprosolution",
    Key: key,
    Body: fileStream,
    ContentType: "image/png", // Ensure correct content type
  };

  const uploadCommand = new PutObjectCommand(uploadParams);
  await s3.send(uploadCommand);
  return `https://eduprosolution.s3.eu-north-1.amazonaws.com/${key}`;
};

// Remove background function
// export const RemoveBg = async (req, res) => {
//   try {
//     console.log("Received file:", req.file);

//     if (!req.file) {
//       return res.status(400).json({ error: "No image uploaded" });
//     }

//     const fileUrl = req.file.location;
//     const fileKey = req.file.key;
//     const bucketName = "eduprosolution";

//     console.log("File URL:", fileUrl);
//     console.log("File Key:", fileKey);

//     // Step 1: Download image from S3
//     const tempFilePath = await downloadFileFromS3(bucketName, fileKey);
//     console.log("Temporary File Path:", tempFilePath);

//     // Step 2: Send image to Remove.bg API
//     const formData = new FormData();
//     formData.append("image_file", fs.createReadStream(tempFilePath));
//     formData.append("size", "auto");
//     formData.append("format", "png");
//     const response = await axios.post(
//       "https://api.remove.bg/v1.0/removebg",
//       formData,
//       {
//         headers: {
//           "X-Api-Key": REMOVE_BG_API_KEY,
//           ...formData.getHeaders(),
//         },
//         responseType: "arraybuffer",
//         params: {
//           format: "png", // 🔥 Ensure output is PNG (supports transparency)
//         },
//       }
//     );

//     console.log("✅ Background removed successfully");
//     console.log("Response Headers:", response.headers);

//     // const processedFilePath = `/tmp/processed_${fileKey}`;

//     const processedFilePath = `/tmp/processed_${Date.now()}_${
//       path.parse(fileKey).name
//     }.png`;

//     fs.writeFileSync(processedFilePath, response.data); // Save locally
//     await sharp(processedFilePath)
//       .png({ force: true }) // Ensure PNG format
//       .toFile(processedFilePath);

//     // Upload processed image back to S3
//     const processedImageUrl = await uploadToS3(
//       processedFilePath,
//       // `processed/${fileKey}`
//       `processed/${path.parse(fileKey).name}.png`
//     );

//     console.log("📤 Processed image uploaded to S3:", processedImageUrl);

//     // Cleanup
//     fs.unlinkSync(tempFilePath);
//     fs.unlinkSync(processedFilePath);
//     console.log("🗑️ Temporary files deleted");

//     // Step 4: Delete original file from S3
//     await s3.send(
//       new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey })
//     );
//     console.log("🗑️ Original file deleted from S3:", fileKey);

//     // Step 5: Return processed image URL
//     res.json({ imagePath: processedImageUrl });
//   } catch (error) {
//     console.error("🚨 Error removing background:", error.message);
//     res.status(500).json({ error: "Failed to process image" });
//   }
// };
// ✅ Main RemoveBg function
export const RemoveBg = async (req, res) => {
  try {
    console.log("Received file:", req.file);
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const bucketName = "eduprosolution"; // ✅ Define bucketName here
    const fileUrl =
      req.file.location || `https://s3.amazonaws.com/${bucketName}/${fileKey}`;
    const fileKey = req.file.key;
    console.log("File URL:", fileUrl);
    console.log("File Key:", fileKey);

    // Step 1: Download image from S3
    const tempFilePath = await downloadFileFromS3(bucketName, fileKey);
    console.log("Temporary File Path:", tempFilePath);

    // Step 2: Send image to Remove.bg API
    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(tempFilePath));
    formData.append("size", "auto");
    formData.append("format", "png");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          "X-Api-Key": REMOVE_BG_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      }
    );

    console.log("✅ Background removed successfully");

    // Step 3: Save Remove.bg processed image
    const processedFilePath = `/tmp/processed_${Date.now()}_${
      path.parse(fileKey).name
    }.png`;
    fs.writeFileSync(processedFilePath, response.data);

    // Step 4: Ensure image has transparency using Sharp
    const finalOutputPath = `/tmp/final_${Date.now()}_${
      path.parse(fileKey).name
    }.png`;
    await sharp(processedFilePath)
      .png({ quality: 100 })
      .toFile(finalOutputPath);

    console.log("✅ Sharp processing completed");

    // Step 5: Upload final transparent PNG to S3
    const processedImageUrl = await uploadToS3(
      finalOutputPath,
      `processed/${Date.now()}_${path.parse(fileKey).name}.png`
    );
    console.log("📤 Processed image uploaded to S3:", processedImageUrl);

    // Cleanup
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(processedFilePath);
    fs.unlinkSync(finalOutputPath);
    console.log("🗑️ Temporary files deleted");

    // Step 6: Delete original file from S3
    await s3.send(
      new DeleteObjectCommand({ Bucket: bucketName, Key: fileKey })
    );
    console.log("🗑️ Original file deleted from S3:", fileKey);

    // Return processed image URL
    res.json({ imagePath: processedImageUrl });
  } catch (error) {
    console.error("🚨 Error removing background:", error.message);
    res.status(500).json({ error: "Failed to process image" });
  }
};

export const requestFaceSwap = async (req, res) => {
  try {
    console.log("📩 Received face swap request...");

    if (!req.files || !req.files["target_image"] || !req.files["swap_image"]) {
      return res.status(400).json({ error: "Both images are required" });
    }

    const target_image = req.files["target_image"][0].location;
    const swap_image = req.files["swap_image"][0].location;

    const requestBody = {
      target_image,
      swap_image,
      result_type: "url",
    };

    console.log("📤 Sending request to Face Swap API...");

    const response = await axios.post(API_URL, requestBody, {
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    if (!response.data?.data?.task_id) {
      return res.status(500).json({ error: "Face swap request failed" });
    }

    return res.json({ task_id: response.data.data.task_id });
  } catch (error) {
    console.error("🚨 Error:", error.response?.data || error);
    return res.status(500).json({ error: "Face swap request failed" });
  }
};

export const checkFaceSwapStatus = async (req, res) => {
  try {
    const { task_id } = req.params;
    if (!task_id) return res.status(400).json({ error: "Task ID is required" });

    console.log(`🔍 Checking status for task ID: ${task_id}`);

    const response = await axios.get(
      `https://api.piapi.ai/api/v1/task/${task_id}`,
      {
        headers: { "X-API-Key": API_KEY },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error("🚨 Error:", error.response?.data || error);
    return res.status(500).json({ error: "Failed to check status" });
  }
};

// export const fetchFaceSwapResult = async (req, res) => {
//   try {
//     console.log("📩 Received request to fetch face swap result...");
//     console.log("📥 Request Body:", req.body);

//     const { task_id } = req.body;
//     if (!task_id) {
//       console.error("⚠️ Task ID is missing in the request.");
//       return res.status(400).json({ error: "Task ID is required" });
//     }

//     console.log("🔍 Fetching face swap result for Task ID:", task_id);

//     const response = await axios.post(
//       "https://api.piapi.ai/api/face_swap/v1/fetch",
//       { task_id },
//       {
//         headers: {
//           "X-API-Key": API_KEY,
//           "Content-Type": "application/json",
//           Accept: "application/json",
//         },
//       }
//     );
//     console.log("🔑 API Key Being Used:333", API_KEY);

//     console.log("📡 API Fetch Response:", response.data);

//     if (!response.data || !response.data.data) {
//       console.error("❌ No valid response data received!");
//       return res
//         .status(500)
//         .json({ error: "Fetching face swap result failed" });
//     }

//     return res.json(response.data);
//   } catch (error) {
//     console.error(
//       "🚨 Error fetching face swap result:",
//       error.response?.data || error
//     );
//     return res.status(500).json({ error: "Fetching face swap result failed" });
//   }
// };

// export const generateDream = async (req, res) => {
//   console.log("Received request to generate dream...");

//   const { title, userId } = req.body;
//   const { location: userImageUrl } = req.file ? req.file : {}; // User-uploaded image (swap image)

//   console.log("Received Data:", { title, userId, userImageUrl });

//   if (!title || !userId || !userImageUrl) {
//     console.error("Missing required fields:", { title, userId, userImageUrl });
//     return res.status(400).json({ error: "Missing required fields" });
//   }

//   try {
//     console.log("Generating AI Images...");
//     const generatedImages = await generateMultipleImages(
//       title,
//       "1024x1024",
//       userImageUrl
//     );

//     if (!generatedImages.length) throw new Error("Image generation failed");

//     const targetImageUrl = generatedImages[0];
//     console.log("AI Generated Image (Target):", targetImageUrl);

//     const formData = new FormData();
//     formData.append("target_image", targetImageUrl);
//     formData.append("swap_image", userImageUrl);

//     console.log("FormData keys and values:");
//     formData._streams.forEach((stream) => console.log(stream));

//     console.log("Calling Face Swap API...");
//     const swapResponse = await axios.post(
//       "http://localhost:8000/api/face-swap",
//       formData,
//       {
//         headers: {
//           ...formData.getHeaders(),
//         },
//       }
//     );

//     console.log("Face Swap API Response:", swapResponse.data);

//     if (!swapResponse.data || !swapResponse.data.task_id) {
//       throw new Error("Face swap initiation failed");
//     }

//     const taskId = swapResponse.data.task_id;

//     console.log("Fetching Face Swap Result...");
//     let swappedImageUrl = null;
//     for (let i = 0; i < 10; i++) {
//       await new Promise((resolve) => setTimeout(resolve, 3000));

//       const fetchResponse = await axios.get(
//         "http://localhost:8000/api/fetch-result",
//         {
//           params: { task_id: taskId },
//         }
//       );

//       console.log("Fetch Result API Response:", fetchResponse.data);

//       if (fetchResponse.data?.data?.status === "success") {
//         swappedImageUrl = fetchResponse.data.data.image;
//         break;
//       }
//     }

//     if (!swappedImageUrl) {
//       throw new Error("Face swap result not available");
//     }

//     console.log("Saving dream to database...");
//     const dream = new Dream({
//       title,
//       content: `Vision created for: ${title}`,
//       userImageUrl,
//       imageUrls: [swappedImageUrl],
//       userId,
//     });

//     await dream.save();
//     console.log("Dream successfully saved:", dream);

//     res.status(201).json({ message: "Dream generated successfully", dream });
//   } catch (error) {
//     console.error("Error generating dream:", error);
//     res.status(500).json({ error: "Failed to generate vision" });
//   }
// };
export const fetchFaceSwapResult = async (req, res) => {
  try {
    console.log("📩 Received request to fetch face swap result...");
    const { task_id } = req.body;

    if (!task_id) {
      console.error("⚠️ Task ID is missing in the request.");
      return res.status(400).json({ error: "Task ID is required" });
    }

    console.log("🔍 Fetching face swap result for Task ID:", task_id);

    let swappedImageUrl = null;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 15000; // 3 seconds between requests

    while (attempts < maxAttempts) {
      const response = await axios.get(
        "https://api.piapi.ai/api/face_swap/v1/result/" + task_id,
        {},
        {
          headers: {
            "X-API-Key": API_KEY,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("📡 API Fetch Response:", response.data);

      if (response.data?.data?.status === "success") {
        swappedImageUrl = response.data.data.image;
        console.log("🎭 Face swap successful! Image URL:", swappedImageUrl);
        break;
      } else {
        console.log(
          `⏳ Face swap still in progress... Retrying (${
            attempts + 1
          }/${maxAttempts})`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      attempts++;
    }

    if (!swappedImageUrl) {
      throw new Error(
        "❌ Face swap result not available after multiple attempts."
      );
    }

    res.json({ image: swappedImageUrl });
  } catch (error) {
    console.error(
      "🚨 Error fetching face swap result:",
      error.response?.data || error
    );
    return res.status(500).json({ error: "Fetching face swap result failed" });
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
    const visions = await Dream.find({ userId, isSaved: true, board: false }); // Only fetch saved visions
    res.status(200).json(visions);
  } catch (error) {
    console.error("Error fetching visions:", error);
    res.status(500).json({ error: "Failed to fetch visions" });
  }
};
export const getTemplateVisionsBoard = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const visions = await Dream.find({ userId, isSaved: true, board: true }); // Only fetch saved visions
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
