import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";
import sendResponse from "./helpers/sendResponse.js";
import router from "./routers/authroutes.js";

const app = express();
const { MONGO_URI, PORT } = process.env;

app.use(express.json());
app.use(morgan("common"));
app.use(cors("*"));

app.use("/auth", router);

app.get("/", (req, res) => {
  try {
    sendResponse(res, 200, false, { Greeting: "Chalra" }, "Good to GO");
  } catch (e) {
    console.log(e);
    sendResponse(
      res,
      500,
      true,
      null,
      "An unexpected error occurred\n" + e.message
    );
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
