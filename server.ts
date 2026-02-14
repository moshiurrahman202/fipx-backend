import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db";
import authMiddleware from "./middleware/auth.middleware";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("ZipX Backend Running 🚀");
});
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated 🚀",
  });
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
