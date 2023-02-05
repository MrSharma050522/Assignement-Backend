require("dotenv").config();
const watch = require("node-watch");
const fetch = require("node-fetch");
const nodePath = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const FormData = require("form-data");
const mongoose = require("mongoose");
const File = require("./models/File");
const cors = require("cors");

const upload = multer({ dest: "uploads/" });
const app = express();
app.use(cors());
const SYNC_OUT_DIR = process.env.SYNC_OUT_DIR;
const SYNC_IN_DIR = process.env.SYNC_IN_DIR;

watch(SYNC_OUT_DIR, { recursive: false }, async (evt, name) => {
  const file = fs.createReadStream(name);

  const form = new FormData();
  form.append("file", file);

  await fetch(`${process.env.MONGO_URI}/files`, {
    method: "POST",
    body: form,
  });

  fs.unlinkSync(name);
});

app.post("/files", upload.single("file"), async function (req, res, next) {
  const { originalname, path } = req.file;
  console.log(originalname, path);
  const files = await File.create({ text: originalname, path });
  const file = fs.readFileSync(path);
  fs.writeFileSync(nodePath.join(SYNC_IN_DIR, originalname), file);
  fs.unlinkSync(path);
  return res.status(200).json({
    status: "success",
  });
});

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB Connection Successfull");
    app.listen(process.env.PORT, () =>
      console.log(`Listening to port : ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log(err.message));

// app.listen(process.env.PORT, () => {
//   console.log("Listening to port");
// });
