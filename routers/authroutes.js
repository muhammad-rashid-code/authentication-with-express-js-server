import express from "express";
import User from "../models/User.js";
import Joi from "joi";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendResponse from "../helpers/sendResponse.js";

const router = express.Router();
const { SALT_ROUNDS, AUTH_SECRET } = process.env;

// Ensure SALT_ROUNDS is an integer
const saltRounds = parseInt(SALT_ROUNDS); // default to 10 if not provided

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .required(),
  password: Joi.string().min(3).max(30).required(),
  city: Joi.string().min(3).max(30).required(),
  country: Joi.string().min(3).max(30).required(),
});

const logInSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] }, 
    })
    .required(),
  password: Joi.string().min(3).max(30).required(),
});

router.use(express.json());

// Register Route
router.post("/register", async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);

  if (error) {
    // Send all validation error details in the response
    return sendResponse(
      res,
      400,
      true,
      null,
      error.details.map((e) => e.message).join(", ")
    );
  }

  try {
    const { fullName, email, password, city, country } = value;

    // Find user by email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, true, null, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with hashed password
    let user = new User({ ...value, password: hashedPassword });

    // Save user to database
    await user.save();

    // Create JWT token
    const token = Jwt.sign(
      { userId: user._id, email: user.email },
      AUTH_SECRET,
      { expiresIn: "1h" }
    );

    // Send success response
    sendResponse(
      res,
      201,
      false,
      { user: { fullName: user.fullName, email: user.email }, token },
      "User successfully registered"
    );
  } catch (e) {
    console.error(e);
    // Send the error message as a response if an unexpected error occurs
    sendResponse(res, 500, true, null, e.message);
  }
});
export default router;
