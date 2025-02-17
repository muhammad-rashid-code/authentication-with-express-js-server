import express from "express";
import Joi from "joi";
import sendResponse from "../helpers/sendResponse.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const { SALT_ROUNDS, SECRET_KEY } = process.env;

// Schema for user registration validation using Joi
// Ensures that required fields like fullname, email, and password are validated properly.
const registerSchema = Joi.object({
  fullname: Joi.string().min(3).max(30).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(3).max(30).required(),
  city: Joi.string().min(3).max(30).required(),
  country: Joi.string().min(3).max(30).required(),
});

// User registration route
// This endpoint validates the incoming data, hashes the password, and stores the new user in the database.
router.post("/register", async (req, res) => {
  // Validate user input against the registerSchema
  const { error, value } = registerSchema.validate(req.body);

  // If validation fails, return an error response
  if (error)
    return sendResponse(res, 400, true, null, error.details[0].message);

  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser)
      return sendResponse(res, 400, true, null, "User Already Registered.");

    // Hash the user's password before saving to the database
    const hashedPWD = await bcrypt.hash(value.password, Number(SALT_ROUNDS));
    value.password = hashedPWD; // Update password with hashed version

    // Create a new user instance
    const user = new User({ ...value });

    // Save the new user to the database
    await user.save();

    // Send a success response with the user's data (without password)
    sendResponse(
      res,
      201,
      false,
      {
        user: { fullname: value.fullname, email: value.email }, // Return only necessary user info
      },
      "User Registered."
    );
  } catch (error) {
    // Handle any database errors
    sendResponse(res, 400, true, null, "User not Registered.");
  }
});

// Schema for user login validation using Joi
// Ensures that the provided email and password match the required format.
const loginSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string().min(3).max(30).required(),
});

// User login route ===================================================================================
// This endpoint validates the user's credentials and issues a JWT if successful.
router.post("/login", async (req, res) => {
  // Validate user input against the loginSchema
  const { error, value } = loginSchema.validate(req.body);

  // If validation fails, return an error response
  if (error)
    return sendResponse(res, 400, true, null, error.details[0].message);

  try {
    // Check if the user exists by email
    const user = await User.findOne({ email: value.email }).lean();
    if (!user) return sendResponse(res, 400, false, null, "Wrong Email");

    // Check if the provided password matches the stored hashed password
    const isPWDmatched = await bcrypt.compare(value.password, user.password);
    if (!isPWDmatched)
      return sendResponse(res, 400, true, null, "Wrong Password");

    // Create a JWT token that includes user data (excluding sensitive information like password)
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Delete the password from the user object before returning it
    delete user.password;

    // Send a success response with the user info (excluding password) and the JWT token
    sendResponse(res, 200, false, { user, token }, "User Logged in");
  } catch (error) {
    // Handle any errors (e.g., database connection errors)
    sendResponse(res, 400, true, null, "Wrong Credentials");
  }
});

router.get("/allUsers", async (req, res) => {
  try {
    const allUsers = await User.find(); // Fetch all users, no need for _id in query
    sendResponse(res, 200, false, allUsers, "All Users");
  } catch (error) {
    sendResponse(res, 400, true, null, "Users not Found");
  }
});

export default router;
