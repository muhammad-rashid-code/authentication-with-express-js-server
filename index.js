import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import sendResponse from "./helpers/sendResponse.js";

const app = express();
const { MONGO_URI, PORT } = process.env;

app.use(express.json());
app.use(morgan("common"));
app.use(cors("*"));

app.get("/", (req, res) => {
  try {
    sendResponse(res, 200, false, { Greeting: "Chalra" }, "Good to GO");
  } catch (e) {
    sendResponse(res, 400, true, null, "Kuch Tw gerber ha Daya");
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(" ===== db conn =====");
  })
  .catch((error) => {
    console.log(" ===== db fail =====\n" + error.message);
  });
app.listen(PORT, () => {
  console.log(`Server is at ${PORT}`);
});
