import express from "express";
import Joi from "joi";
import sendResponse from "../helpers/sendResponse.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

// user registration validation using JOI
const registerSchema = Joi.object({
  fullname: Joi.string().min(3).max(30).required(),
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net"] },
  }),
  password: Joi.string().min(3).max(30).required(),
  city: Joi.string().min(3).max(30).required(),
  country: Joi.string().min(3).max(30).required(),
});

// user registration route
router.post("/register", async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);

  if (error)
    return sendResponse(res, 400, true, null, error.details[0].message);

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser)
    return sendResponse(res, 400, true, null, "User Already Registered.");

  const hashedPWD = bcrypt.compare(value.password, SALT_ROUNDS);
  value.password = hashedPWD;

  const user = new User({ ...value });

  try {
    await user.save();
    sendResponse(
      res,
      201,
      false,
      {
        user: { fullname: value.fullname, email: value.email },
      },
      "User Registered."
    );
  } catch (error) {
    sendResponse(res, 400, true, null, "User not Found");
  }
});

export default router;
