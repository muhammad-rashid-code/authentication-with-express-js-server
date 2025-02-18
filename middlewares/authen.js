import sendResponse from "../helpers/sendResponse.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";
const { SECRET_KEY } = process.env;

export default async function uAtuh(req, res, next) {
  try {
    const bearrer = req?.headers?.authorization;

    if (!bearrer)
      return sendResponse(res, 403, true, null, "Token not Provided");

    // Correctly extract the token (second part of the string)
    const token = bearrer.split(" ")[1];
    if (!token)
      return sendResponse(res, 403, true, null, "Token format is invalid");

    // Decode and verify the token
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded) {
      const user = await User.findById(decoded.userId).lean(); // Use 'userId' instead of '_id'
      if (!user) return sendResponse(res, 404, true, null, "User not found");
      req.user = user;
      next();
    } else {
      sendResponse(
        res,
        500,
        true,
        null,
        "Something went wrong during token verification"
      );
    }
  } catch (error) {
    sendResponse(
      res,
      500,
      true,
      null,
      "Something went wrong: " + error.message
    );
  }
}
