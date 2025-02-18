import jwt from "jsonwebtoken";
import sendResponse from "../helpers/sendResponse.js";
import "dotenv/config";
const { SECRET_KEY } = process.env;

export default async function authent(req, res, next) {
  try {
    const bearrer = req?.headers?.authorization;
    if (!bearrer)
      return sendResponse(res, 403, true, null, "Token not provided");

    const token = bearrer.split(" ")[1];
    if (!token)
      return sendResponse(res, 400, true, null, "Invalid Token Formate");

    const decoded = jwt.verify(token, SECRET_KEY);

    if (decoded) {
      req.user = decoded;
    }
    sendResponse(res, 200, false, req.user, "User's token found");
  } catch (error) {
    sendResponse(res, 400, true, null, "User's token found");
  }
}
