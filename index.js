import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";

const app = express();
const { MOGO_URI, PORT } = process.env;

app.use(morgan("tiny"));
app.use(express.json());
app.use(cors("*"));

app.get("/", (req, res) => {
  res.json({ Message: "Server is good to GO" });
});

mongoose
  .connect(MOGO_URI)
  .then(() => {
    console.log(" ========== db conn ========== ");
  })
  .catch(() => {
    console.log(" ========== db fail ========== ");
  });

app.listen(PORT, () => {
  console.log(`Server is At ${PORT}`);
});
