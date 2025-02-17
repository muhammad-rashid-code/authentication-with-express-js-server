import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    fullname: { type: String, required: true },
    isGraduate: { type: Boolean, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
