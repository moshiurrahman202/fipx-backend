import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, client } from "./src/config/db";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

const startServer = async () => {
  await connectDB();

  const parcelCollection = client.db("parcelDb").collection("parcels");


  // GET parcels all or by email
  app.get("/parcels", async (req, res) => {
    try {
      const email = req.query.email as string | undefined;

      const filter = email ? { create_by: email } : {};

      const parcels = await parcelCollection
        .find(filter)
        .sort({ orderDate: -1 }) // latest first
        .toArray();

      res.status(200).json({
        success: true,
        total: parcels.length,
        data: parcels,
      });
    } catch (error) {
      console.error("Fetch parcels error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch parcels",
      });
    }
  });

  // POST parcel
  app.post("/parcels", async (req, res) => {
    const newParcel = req.body;
    const result = await parcelCollection.insertOne(newParcel);
    res.send(result);
  });

  app.get("/", (req, res) => {
    res.send("ZipX Backend Running 🚀");
    console.log("this server running");

  })
  app.listen(5000, () => {
    console.log("Server running on port 5000 🚀");
  });
};

startServer();