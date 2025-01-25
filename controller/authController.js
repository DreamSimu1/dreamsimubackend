import User from "../models/userModel.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// import nodemailer from "nodemailer";
// import crypto from "crypto";

// export const signUp = async (req, res, next) => {
//   const { email } = req.body;
//   const userExist = await User.findOne({ email });
//   if (userExist) {
//     return next(new ErrorResponse("E-mail already registered", 400));
//   }
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(req.body.password, salt);
//   const newUser = new User({
//     fullname: req.body.fullname,
//     email: req.body.email,
//     phone: req.body.phone,
//     address: req.body.address,
//     password: hashedPassword,
//   });
//   try {
//     const user = await newUser.save();

//     // Generate a JWT token
//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },
//       process.env.JWT_SECRET
//     );

//     res.status(201).json({
//       success: true,
//       user,
//       token, // Include the generated token in the response
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// authController.js

export const signUp = async (req, res, next) => {
  const { fullname, email, password, phone = "", address = "" } = req.body;

  // Validate mandatory fields
  if (!fullname || !email || !password) {
    const error = new Error("Fullname, email, and password are required");
    error.status = 400;
    return next(error);
  }

  try {
    // Check if email is already registered
    const userExist = await User.findOne({ email });
    if (userExist) {
      const error = new Error("E-mail already registered");
      error.status = 400;
      return next(error);
    }

    // Check if phone is already used (if provided)
    if (phone && phone.trim() !== "") {
      const phoneExist = await User.findOne({ phone });
      if (phoneExist) {
        const error = new Error("Phone number already registered");
        error.status = 400;
        return next(error);
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
      phone: phone || "",
      address: address || "", // Optional
    });

    const user = await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET
    );

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// export const login = async (req, res, next) => {
//   const { email, password } = req.body;

//   try {
//     // Find the user by username in the database
//     const user = await User.findOne({ email });

//     // If the user is not found, return an error
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Compare the provided password with the hashed password stored in the database
//     const isPasswordValid = await bcrypt.compare(password, user.password);

//     // If the passwords don't match, return an error
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid password" });
//     }
//     const token = jwt.sign(
//       { id: user._id, isAdmin: user.isAdmin },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "1h",
//       }
//     );
//     console.log("JWT Token Issued:", jwt.decode(token).exp);

//     // Password is valid, generate a JWT token

//     return res.status(200).json({ token, user }); // Include the generated token in the response
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find the user by email in the database
    const user = await User.findOne({ email });

    // If the user is not found, return an error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the passwords don't match, return an error
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET, // Make sure your JWT_SECRET is set in the environment variables
      { expiresIn: "1h" }
    );

    // Log the entire JWT token to verify its structure
    console.log("JWT Token Issued:", token); // Log the full token

    // Return the token and user details in the response
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = (req, res) => {
  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
};
