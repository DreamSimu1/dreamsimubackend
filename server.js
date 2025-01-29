import express from "express";
import visionRoutes from "./routes/visionRoutes.js";
import refineRoute from "./routes/refineRoute.js";
import sprintRoute from "./routes/sprintRoute.js";
import pointRoute from "./routes/pointRoute.js";
import disbursementRoute from "./routes/disbursementRoute.js";
import ideaRoute from "./routes/ideaRoute.js";
import schoolRoute from "./routes/schoolRoute.js";
import offlineRoute from "./routes/offlineRoute.js";
import OffRoutes from "./routes/OffRoutes.js";
import receiptRoute from "./routes/receiptRoute.js";
import passport from "passport";
import "./passport.js";
import session from "express-session";
import noticeRoute from "./routes/noticeRoute.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db2.js";
import cors from "cors";
import MongoStore from "connect-mongo";
import authenticateUser from "./middleware/authMiddleware.js";
import blogRoute from "./routes/blogRoute.js";
import authRoute from "./routes/authRoute.js";
dotenv.config();

const app = express();
connectDB();

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure CORS
const corsOptions = {
  origin: [
    "http://localhost:3001",
    "https://dreamsimu.vercel.app",
    "https://www.dreamsimu.com",
    "https://dreamsimu.com",
    "https://dreamsimuweb.vercel.app",
  ], // specify your client's URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,

    store: new MongoStore({
      mongoUrl: process.env.MONGODB_URI, // Use `mongoUrl` instead of `url`
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://blog.zarichtravels.com");
//   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });
app.use("/api", authRoute);
app.use("/api", visionRoutes);
app.use("/api", ideaRoute);
app.use("/api", refineRoute);
app.use("/api", sprintRoute);
app.use("/api/", OffRoutes);
app.use("/api/", noticeRoute);
app.use("/api/", receiptRoute);
app.use("/api", schoolRoute);
app.use("/api", blogRoute);
app.use("/api/auth", authRoute);
// Use commonRouter with specific routes requiring authentication

app.use("/api/", pointRoute);
app.use("/api/", disbursementRoute);

// app.use("/api/", commonRoute(s3));

// app.use("/api/", commonRoute(s3));
const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
