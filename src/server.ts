import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("ZipX Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
