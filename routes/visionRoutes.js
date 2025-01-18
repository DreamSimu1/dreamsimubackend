// import express from "express";
// import {
//   getallUsers,
//   getUsers,
//   loginUser,
//   register,
// } from "../controller/visionController.js";
// import authenticateUser from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/create-vision");
// router.post("/edit-vision");
// router.get("/get-single");
// router.get("/get-all");

// export default router;
import express from "express";
import {
  createVision,
  getSingleVision,
  getAllVisions,
  getSingleVisionByTitle,
} from "../controller/visionController.js";
import authenticateUser from "../middleware/authMiddleware.js";
import fileUpload from "express-fileupload"; // To handle file uploads
import multer from "multer";

const router = express.Router();

// Middleware to handle file uploads

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary directory where multer saves files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename for each upload
  },
});

const upload = multer({ storage: storage });

// Create Vision Route
// router.post("/create-vision", authenticateUser, createVision);

router.post(
  "/create-vision",
  upload.single("image"),
  authenticateUser,
  createVision
);

// Get Single Vision Route
router.get("/get-single/:id", authenticateUser, getSingleVision);
router.get(
  "/get-single-by-title/:title",
  authenticateUser,
  getSingleVisionByTitle
);

// Get All Visions Route
router.get("/get-all", authenticateUser, getAllVisions);

export default router;
