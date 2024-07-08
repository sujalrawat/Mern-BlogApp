import mongoose from "mongoose";

export default async function connectDb() {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:admin@blogapp.lcvre03.mongodb.net/BlogApp?retryWrites=true&w=majority&appName=BlogApp"
    );
    console.log("MongoDB connected");
  } catch (err) {
    console.log("Database connection failed :", err.message);
  }
}
