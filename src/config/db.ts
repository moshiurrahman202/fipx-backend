import { MongoClient, ServerApiVersion } from "mongodb";

let client: MongoClient;

const connectDB = async (): Promise<MongoClient> => {
  try {
    client = new MongoClient(process.env.MONGO_URI as string, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });

    console.log("MongoDB Connected ✅");

    return client;
  } catch (error) {
    console.error("MongoDB Error:", error);
    process.exit(1);
  }
};

export { connectDB, client };