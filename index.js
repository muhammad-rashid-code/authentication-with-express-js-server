import express from "express";
import "dotenv/config";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import router from "./routes/authroutes.js";

const app = express();
const { MOGO_URI, PORT } = process.env;

// middlewares for app smooth running or boilerplate
app.use(morgan("tiny"));
app.use(express.json());
app.use(cors("*"));

//manging routes
app.use("/auth", router);

// get requset for testing
app.get("/", (req, res) => {
  res.json({ Message: "Server is good to GO" });
});


// db connection
mongoose
  .connect(MOGO_URI)
  .then(() => {
    console.log(" ========== db conn ========== ");
  })
  .catch((error) => {
    console.log(" ========== db fail ========== \n" + error);
  });

app.listen(PORT, () => {
  console.log(`Server is At ${PORT}`);
});
