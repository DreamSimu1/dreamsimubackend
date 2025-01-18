// import express from "express";

// import { adminlogin, adminregister } from "../controller/loginController.js";

// const router = express.Router();

// router.post("/register", adminregister);

// router.post("/login", adminlogin);

// export default router;

import express from "express";

// const { signupDto } = require('../validators/user')

import {
  signUp,
  login,
  forgotPassword,
  getProfile,
} from "../controller/authController.js";
import { protect } from "../middleware/protectUser.js";

// const { resetDto } = require('../validators/resetPassword')
// const authRouter = express.Router()
const router = express.Router();
// authRouter.route('/signup').post(signupDto, signUp)

// authRouter.route('/reset/password').post(resetDto, resetPassword)

// router.post('/login', signin);
router.post("/auth/signup", signUp);
router.post("/auth/login", login);
router.get("/profile", protect, getProfile); // New route for fetching profile
router.put("/forgotpassword", forgotPassword);
router.post("/forgotpassword", forgotPassword);
// router.post('/sendpasswordlink', forgotLink)
//  authRouter
//  .route('/reset/password')
//  .post(resetDto, resetPassword);

export default router;
