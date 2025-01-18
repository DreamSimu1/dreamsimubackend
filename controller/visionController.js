import Vision from "../models/visionModel.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import mongoose from "mongoose";
dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_KEY_SECRET,
});

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Define your directory where the file will be saved temporarily
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Use a unique filename for each upload
  },
});

const upload = multer({ storage: storage });

// Cloudinary upload handler function
export const createVision = async (req, res) => {
  const { title, affirmation, statement, visibility } = req.body;
  const { userId } = req.user; // Assuming you're using JWT authentication to get the user ID

  try {
    let imageUrl = "";

    // Handle image upload to Cloudinary (only if file is sent)
    if (req.file) {
      // Check if the file is received via multer
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        // Use multer's temporary file path
        folder: "visions",
        use_filename: true,
      });
      imageUrl = result.secure_url; // Cloudinary URL for the image
    } else {
      console.log("No image uploaded");
    }

    // Save Vision to Database
    const vision = new Vision({
      title,
      affirmation,
      statement,
      visibility,
      imageUrl,
      userId,
    });

    await vision.save();

    res.status(201).json({
      message: "Vision created successfully",
      vision,
    });
  } catch (error) {
    console.error("Error creating vision:", error);
    res.status(500).json({
      message: "Failed to create vision",
    });
  }
};

// Get all visions
// export const getAllVisions = async (req, res) => {
//   try {
//     const visions = await Vision.find();
//     res.status(200).json(visions);
//   } catch (error) {
//     console.error("Error fetching visions:", error);
//     res.status(500).json({
//       message: "Failed to fetch visions",
//     });
//   }
// };

// export const getAllVisions = async (req, res) => {
//   try {
//     // Ensure the user's ID is present from the authentication middleware
//     const userId = req.user.userId;

//     // Convert the userId to ObjectId to match the stored userId in the database
//     const objectIdUserId = mongoose.Types.ObjectId(userId);

//     // Fetch visions created by this user
//     const visions = await Vision.find({ createdBy: objectIdUserId });

//     res.status(200).json(visions);
//   } catch (error) {
//     console.error("Error fetching visions:", error);
//     res.status(500).json({
//       message: "Failed to fetch visions",
//     });
//   }
// };

export const getAllVisions = async (req, res) => {
  try {
    // Get the userId from the authentication middleware (JWT token)
    const userId = req.user.userId;
    console.log("Fetching visions for userId:", userId);

    // Fetch visions created by this user
    const visions = await Vision.find({ userId: userId });

    // Check if any visions are returned
    if (visions.length === 0) {
      console.log("No visions found for userId:", userId);
    } else {
      console.log("Visions fetched:", visions);
    }

    // Return the fetched visions
    res.status(200).json(visions);
  } catch (error) {
    console.error("Error fetching visions:", error);
    res.status(500).json({
      message: "Failed to fetch visions",
    });
  }
};
// Get a single vision
export const getSingleVision = async (req, res) => {
  const { id } = req.params;

  try {
    const vision = await Vision.findById(id);
    if (!vision) {
      return res.status(404).json({ message: "Vision not found" });
    }
    res.status(200).json(vision);
  } catch (error) {
    console.error("Error fetching vision:", error);
    res.status(500).json({
      message: "Failed to fetch vision",
    });
  }
};
export const getSingleVisionByTitle = async (req, res) => {
  const { title } = req.params;

  try {
    const vision = await Vision.findOne({ title }); // Fetch vision by title
    if (!vision) {
      return res.status(404).json({ message: "Vision not found" });
    }
    res.status(200).json(vision);
  } catch (error) {
    console.error("Error fetching vision by title:", error);
    res.status(500).json({
      message: "Failed to fetch vision by title",
      error: error.message,
    });
  }
};
