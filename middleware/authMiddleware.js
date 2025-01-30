// import jwt from "jsonwebtoken";

// const authenticateUser = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ message: "No token, authorization denied" });
//   }

//   try {
//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach user to request object
//     req.user = { id: decoded.id }; // Set user ID as `id` for consistency
//     next();
//   } catch (error) {
//     console.error("Error authenticating token:", error);
//     return res.status(401).json({ message: "Token is not valid" });
//   }
// };

// export default authenticateUser;

import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    // Attach user to request object
    // req.user = { userId: decoded.id }; // This assumes the payload contains `id` as the user ID

    req.user = { userId: decoded.userId };

    next();
  } catch (error) {
    console.error("Error authenticating token:", error);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default authenticateUser;
