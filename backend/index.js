import express from "express"; 
import mongoose from "mongoose"; 
import authRoute from "./routes/auth.route.js"; 
import userRoute from "./routes/user.route.js"; 
import packageRoute from "./routes/package.route.js"; 
import ratingRoute from "./routes/rating.route.js"; 
import bookingRoute from "./routes/booking.route.js"; 
import impactRoute from "./routes/impact.route.js"; 
import cookieParser from "cookie-parser"; 
import dotenv from "dotenv"; 
import path from "path"; 
import { fileURLToPath } from "url"; 
import cors from "cors"; 
 
// Fix __dirname for ES modules 
const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 
 
// Load .env explicitly from backend folder 
dotenv.config({ path: path.join(__dirname, ".env") }); 
 
const app = express(); 
 
// MongoDB connection 
mongoose 
  .connect(process.env.MONGO_URI) 
  .then(() => { 
    console.log("MongoDB connected"); 
  }) 
  .catch((err) => console.error("Mongo error:", err)); 
 
// --- Middleware --- 
app.use( 
  cors({ 
    origin: "*", 
  }) 
); 
app.use(express.json()); 
app.use(cookieParser()); 
 
// --- Routes --- 
app.use("/api/auth", authRoute); 
app.use("/api/user", userRoute); 
app.use("/api/package", packageRoute); 
app.use("/api/rating", ratingRoute); 
app.use("/api/booking", bookingRoute); 
app.use("/api/impact", impactRoute); // ✅ Only one instance now 
 
// --- Production Setup --- 
if (process.env.NODE_ENV_CUSTOM === "production") { 
  app.use(express.static(path.join(__dirname, "../client/dist"))); 
 
  app.get("*", (req, res) => { 
    res.sendFile(path.join(__dirname, "../client/dist/index.html")); 
  }); 
} else { 
  app.get("/", (req, res) => { 
    res.send("Welcome to Swadeshi Travel & Tourism Platform"); 
  }); 
} 
 
const PORT = process.env.PORT || 8000; 
app.listen(PORT, () => { 
  console.log(`Server running on port ${PORT}`); 
}); 
