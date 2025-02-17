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
  isGraduate: Joi.boolean().required(),
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

  // If validation fails, return an error response with the validation message
  if (error)
    return sendResponse(res, 400, true, null, error.details[0].message);

  try {
    // Check if the email is already registered to avoid duplicates
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser)
      return sendResponse(res, 400, true, null, "User Already Registered.");

    // Hash the user's password before saving to the database
    const hashedPWD = await bcrypt.hash(value.password, Number(SALT_ROUNDS));
    value.password = hashedPWD; // Update password with hashed version

    // Create a new user instance with the validated and hashed data
    const user = new User({ ...value });

    // Save the new user to the database
    await user.save();

    // Send a success response with the user's name and email (excluding sensitive information)
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
    // Handle any database errors that occur during registration
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

  // If validation fails, return an error response with the validation message
  if (error)
    return sendResponse(res, 400, true, null, error.details[0].message);

  try {
    // Check if the user exists in the database by email
    const user = await User.findOne({ email: value.email }).lean();
    if (!user) return sendResponse(res, 400, false, null, "Wrong Email");

    // Compare the provided password with the stored hashed password
    const isPWDmatched = await bcrypt.compare(value.password, user.password);
    if (!isPWDmatched)
      return sendResponse(res, 400, true, null, "Wrong Password");

    // Create a JWT token for the authenticated user with an expiry time of 1 hour
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Delete the password from the user object before returning the data
    delete user.password;

    // Send a success response with the user info and the JWT token
    sendResponse(res, 200, false, { user, token }, "User Logged in");
  } catch (error) {
    // Handle any errors (e.g., database errors or wrong credentials)
    sendResponse(res, 400, true, null, "Wrong Credentials");
  }
});

// Route to fetch all users ===================================================================================
// This endpoint retrieves all users from the database.
router.get("/allUsers", async (req, res) => {
  try {
    // Fetch all users from the database (no need for _id in query)
    const allUsers = await User.find();
    sendResponse(res, 200, false, allUsers, "All Users");
  } catch (error) {
    // Handle any database errors while fetching all users
    sendResponse(res, 400, true, null, "Users not Found");
  }
});

// User update route to set 'isGraduate' status ==============================
// =====================================================
// This endpoint allows updating a user's 'isGraduate' status to 'true' based on the user ID.
router.patch("/patch/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Update the 'isGraduate' field of the user with the given ID
    const user = await User.findByIdAndUpdate(
      id,
      { isGraduate: true },
      { new: true, returnDocument: "after" }
    );

    // If the user with the given ID is not found, send a 404 error
    if (!user) {
      return sendResponse(res, 404, true, null, "User not found");
    }

    // Send a success response indicating the user's graduation status has been updated
    sendResponse(res, 200, false, user, "User set to graduate");
  } catch (error) {
    // Handle any errors that occur during the update operation
    sendResponse(res, 400, true, null, "Error: " + error.message);
  }
});

router.patch("/patch/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // First, find the user by ID to get the current value of 'isGraduate'
    const user = await User.findById(id);

    // If the user is not found, return a 404 error
    if (!user) {
      return sendResponse(res, 404, true, null, "User not found");
    }

    // Toggle the 'isGraduate' field (if true, set it to false; if false, set it to true)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isGraduate: !user.isGraduate }, // Toggle the value
      { new: true } // Return the updated user
    );

    // Send a success response with the updated user data
    sendResponse(
      res,
      200,
      false,
      updatedUser,
      "User graduation status updated"
    );
  } catch (error) {
    // Handle any errors that occur during the update operation
    sendResponse(res, 400, true, null, "Error: " + error.message);
  }
});

router.patch("/patchToggle/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // First, find the user by ID to get the current value of 'isGraduate'
    const user = await User.findById(id);

    // If the user is not found, return a 404 error
    if (!user) {
      return sendResponse(res, 404, true, null, "User not found");
    }

    // Toggle the 'isGraduate' field (if true, set it to false; if false, set it to true)
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isGraduate: !user.isGraduate }, // Toggle the value
      { new: true } // Return the updated user
    );

    // Send a success response with the updated user data
    sendResponse(
      res,
      200,
      false,
      updatedUser,
      "User graduation status updated"
    );
  } catch (error) {
    // Handle any errors that occur during the update operation
    sendResponse(res, 400, true, null, "Error: " + error.message);
  }
});

export default router;
