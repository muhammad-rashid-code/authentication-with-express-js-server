import sendResponse from "../helpers/sendResponse.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
const { SECRET_KEY } = process.env;

export default function authent(req, res, next) {
  try {
    const bearrearToken = req?.headers?.authorization;
    if (!bearrearToken)
      return sendResponse(res, 500, true, null, "TOken no Provided");

    const token = bearrearToken.split(" ")[1];
    // console.log(token);

    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded) {
      req.user = decoded;
      next();
    } else {
      sendResponse(res, 500, true, null, "Not ");
    }

    sendResponse(res, 200, false, null, "Working");
  } catch (error) {
    sendResponse(res, 400, true, null, "Something went wrong\n" + error);
  }
}
