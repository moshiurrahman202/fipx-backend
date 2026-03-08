import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB, client } from "./src/config/db";
import { ObjectId } from "mongodb";
import { error } from "console";
dotenv.config();
const app = express();
const stripe = require("stripe")(process.env.PAYMENT_GATEWAY_KEY);

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

  // GET parcel by ID
  app.get("/parcels/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const parcel = await parcelCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!parcel) {
        return res.status(404).json({
          success: false,
          message: "Parcel not found",
        });
      }

      res.status(200).json({
        success: true,
        data: parcel,
      });
    } catch (error) {
      console.error("Get parcel error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch parcel",
      });
    }
  });

  // POST parcel
  app.post("/parcels", async (req, res) => {
    const newParcel = req.body;
    const result = await parcelCollection.insertOne(newParcel);
    res.send(result);
  });

  // DELETE parcel (Hard Delete)
  app.delete("/parcels/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const result = await parcelCollection.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Parcel not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Parcel deleted successfully",
      });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete parcel",
      });
    }
  });

  // payment intent
  app.post("/create-payment-intent", async (req, res) => {
    const { parcelId } = req.body;

    try {
      const parcel = await parcelCollection.findOne({
        _id: new ObjectId(parcelId),
      });

      if (!parcel) {
        return res.status(404).json({ message: "Parcel not found" });
      }
      if (parcel.paymentStatus === "paid") {
        return res.status(400).json({
          message: "Parcel already paid",
        });
      }
      const amountInCents = parcel.totalPrice.total * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  // after success the payment
  app.patch("/parcels/:id/pay", async (req, res) => {
    const id = req.params.id;
    const { transactionId } = req.body;

    await parcelCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentStatus: "paid",
          transactionId,
          paidAt: new Date(),
        }
      }
    );

    res.json({ success: true });
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