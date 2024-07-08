//1:15:52 time stamp of video

import express from "express";
import cors from "cors";
import User from "./models/userModel.js";
import Post from "./models/Post.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDb from "./db.js";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";

const uploadMiddleware = multer({ dest: "uploads/" });
const app = express();
const PORT = 3000;
const JWT_KEY = "fwyqefbydziungfyewfvuewfiutwudf";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

connectDb();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    const newUser = await User.create({
      username,
      password: hashPassword,
    });
    res.json(newUser);
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    const isPassword = bcrypt.compareSync(password, user.password);
    if (isPassword) {
      jwt.sign({ username, id: user._id }, JWT_KEY, {}, (err, token) => {
        if (err) throw err;
        res.cookie("token", token).json({
          id: user._id,
          username,
        });
      });
    } else {
      res.status(400).json({ msg: "Invalid credentials" });
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, JWT_KEY, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});

app.post("/post", uploadMiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const parts = originalname.split(".");
  const ext = parts[parts.length - 1];
  const newPath = path + "." + ext;
  fs.renameSync(path, newPath);
  const { token } = req.cookies;
  jwt.verify(token, JWT_KEY, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postDocument = await Post.create({
      title: title,
      summary: summary,
      content: content,
      cover: newPath,
      author: info.id,
    });
    res.json(postDocument);
  });
});

app.get("/post", async (req, res) => {
  const posts = await Post.find()
    .populate("author", ["username"])
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(posts);
});

app.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const postDoc = await Post.findById(id).populate({
    path: "author",
    strictPopulate: false,
  });
  res.json(postDoc);
});

app.put("/post", uploadMiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    newPath = path + "." + ext;
    fs.renameSync(path, newPath);
  }

  const { token } = req.cookies;
  jwt.verify(token, JWT_KEY, {}, async (err, info) => {
    if (err) throw err;
    const { id, title, summary, content } = req.body;
    const postDoc = await Post.findById(id);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
    if (!isAuthor) {
      return res.status(400).json("You are not the author");
    }

    await postDoc.updateOne({
      title,
      summary,
      content,
      cover: newPath ? newPath : postDoc.cover,
    });
    res.json(postDoc)
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
