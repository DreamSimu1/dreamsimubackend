// import User from "../models/userModel.js";

// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { sendWelcomeEmail } from "./email.js";
// import { OAuth2Client } from "google-auth-library";

// const oauth2Client = new OAuth2Client(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );

// // export const signUp = async (req, res, next) => {
// //   const { fullname, email, password } = req.body;

// //   // Validate mandatory fields
// //   if (!fullname || !email || !password) {
// //     const error = new Error("Fullname, email, and password are required");
// //     error.status = 400;
// //     return next(error);
// //   }

// //   try {
// //     // Check if email is already registered
// //     const userExist = await User.findOne({ email });
// //     if (userExist) {
// //       const error = new Error("E-mail already registered");
// //       error.status = 400;
// //       return next(error);
// //     }

// //     // Hash password
// //     const salt = await bcrypt.genSalt(10);
// //     const hashedPassword = await bcrypt.hash(password, salt);

// //     const newUser = new User({
// //       fullname,
// //       email,
// //       password: hashedPassword,
// //     });

// //     const user = await newUser.save();

// //     // Send welcome email
// //     try {
// //       await sendWelcomeEmail(email);
// //       console.log(`Welcome email sent to ${email}`);
// //     } catch (emailError) {
// //       console.error("Error sending welcome email:", emailError.message);
// //       // Optionally, you can continue without blocking the user creation if email sending fails
// //     }

// //     // Generate JWT token
// //     const token = jwt.sign(
// //       { id: user._id, isAdmin: user.isAdmin },
// //       process.env.JWT_SECRET
// //     );

// //     res.status(201).json({
// //       success: true,
// //       message: "Registration successful. Welcome email sent.",
// //       user,
// //       token,
// //     });
// //   } catch (error) {
// //     next(error);
// //   }
// // };

// export const signUp = async (req, res, next) => {
//   const { fullname, email, password } = req.body;

//   // Validate mandatory fields
//   if (!fullname || !email || !password) {
//     const error = new Error("Fullname, email, and password are required");
//     error.status = 400;
//     return next(error);
//   }

//   try {
//     // Check if user already exists
//     let user = await User.findOne({ email });
//     if (!user) {
//       // If user does not exist, create a new one
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(password, salt);

//       user = new User({
//         fullname,
//         email,
//         password: hashedPassword,
//       });

//       // Generate JWT access token for the user
//       const token = jwt.sign(
//         { id: user._id, isAdmin: user.isAdmin },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       // Optionally, generate a refresh token (you can use a longer expiration for this)
//       const refreshToken = jwt.sign(
//         { id: user._id, isAdmin: user.isAdmin },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" } // Longer expiration for refresh token
//       );

//       // Store the tokens in the DB
//       user.accessToken = token;
//       user.refreshToken = refreshToken;

//       await user.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Registration successful",
//       user,
//       token: user.accessToken, // Send the access token
//       refreshToken: user.refreshToken, // Send the refresh token
//     });
//   } catch (error) {
//     console.error("Sign-up error:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// // export const login = async (req, res, next) => {
// //   const { email, password } = req.body;

// //   try {
// //     // Find the user by email in the database
// //     const user = await User.findOne({ email });

// //     // If the user is not found, return an error
// //     if (!user) {
// //       return res.status(404).json({ message: "User not found" });
// //     }

// //     // Compare the provided password with the hashed password stored in the database
// //     const isPasswordValid = await bcrypt.compare(password, user.password);

// //     // If the passwords don't match, return an error
// //     if (!isPasswordValid) {
// //       return res.status(401).json({ message: "Invalid password" });
// //     }

// //     // Generate a JWT token
// //     const token = jwt.sign(
// //       { id: user._id, isAdmin: user.isAdmin },
// //       process.env.JWT_SECRET, // Make sure your JWT_SECRET is set in the environment variables
// //       { expiresIn: "1h" }
// //     );

// //     // Log the entire JWT token to verify its structure
// //     console.log("JWT Token Issued:", token); // Log the full token

// //     // Return the token and user details in the response
// //     return res.status(200).json({ token, user });
// //   } catch (error) {
// //     console.error("Login error:", error);
// //     res.status(500).json({ message: "Internal server error" });
// //   }
// // };

// export const login = async (req, res, next) => {
//   const { email, password, googleToken } = req.body;

//   try {
//     // Find the user by email in the database
//     const user = await User.findOne({ email });

//     // If the user is not found, return an error
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (googleToken) {
//       // If Google token is provided, verify it
//       const ticket = await oauth2Client.verifyIdToken({
//         idToken: googleToken,
//         audience: process.env.GOOGLE_CLIENT_ID,
//       });
//       const payload = ticket.getPayload();

//       // Compare the Google user ID with the one stored in the database
//       if (user.googleId !== payload.sub) {
//         return res.status(401).json({ message: "Invalid Google token" });
//       }

//       // If tokens are valid, generate JWT
//       const token = jwt.sign(
//         { id: user._id, isAdmin: user.isAdmin },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       // Send the accessToken, refreshToken, and the generated JWT token
//       res.status(200).json({
//         accessToken: user.accessToken,
//         refreshToken: user.refreshToken,
//         token, // JWT
//         user,
//       });
//     } else {
//       // Else, if using email/password, validate password
//       const isPasswordValid = await bcrypt.compare(password, user.password);
//       if (!isPasswordValid) {
//         return res.status(401).json({ message: "Invalid password" });
//       }

//       // Generate JWT token
//       const token = jwt.sign(
//         { id: user._id, isAdmin: user.isAdmin },
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" }
//       );

//       // Send the accessToken, refreshToken, and the generated JWT token
//       res.status(200).json({
//         accessToken: user.accessToken,
//         refreshToken: user.refreshToken,
//         token, // JWT
//         user,
//       });
//     }
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json({ user });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const forgotPassword = (req, res) => {
//   sendEmail(req.body)
//     .then((response) => res.send(response.message))
//     .catch((error) => res.status(500).send(error.message));
// };
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_AUTH_REDIRECT_URI
);

export const signUp = async (req, res, next) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res
      .status(400)
      .json({ message: "Fullname, email, and password are required" });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = new User({
        fullname,
        email,
        password: hashedPassword,
      });

      // Generate JWT tokens
      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      const refreshToken = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Store tokens in the DB
      user.accessToken = token;
      user.refreshToken = refreshToken;

      await user.save();

      res.status(201).json({
        success: true,
        message: "Registration successful",
        user,
        token: user.accessToken,
        refreshToken: user.refreshToken,
      });
    } else {
      res.status(400).json({ message: "User already exists" });
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password, googleToken } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (googleToken) {
      const ticket = await oauth2Client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (user.googleId !== payload.sub) {
        return res.status(401).json({ message: "Invalid Google token" });
      }

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        token,
        user,
      });
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
        token,
        user,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = (req, res) => {
  // Handle forgot password
  // You can implement email sending logic here
  res.send("Password reset link sent!");
};
