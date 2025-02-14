import mongoose, { Schema } from "mongoose";

const taskSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", taskSchema);
export default User;
