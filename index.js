import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

const app = express();
const { MONGO_URI, PORT } = process.env;

app.use(express.json());
app.use(morgan("common"));
app.use(cors("*"));

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
