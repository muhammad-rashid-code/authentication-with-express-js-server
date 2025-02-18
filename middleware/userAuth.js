import "dotenv/config";
import sendResponse from "../helpers/sendResponse.js";
import User from "../models/User.js";

export default async function uAuth(req, res, next) {
  try {
    const bearrer = req?.headers?.authorization;
    if (!bearrer) return sendResponse(res, 404, true, null, "Wrong bearrer");

    const token = bearrer.split(" ")[1];
    if (!token)
      return sendResponse(res, 400, true, null, "Wrong bearrer formate Token");

    let decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded)
      return sendResponse(res, 400, true, null, "decoded token not verified");

    if (decoded) {
      console.log(decoded);
      const user = await User.findById(decoded.userId).lean();
      if (!user)
        return sendResponse(
          res,
          400,
          true,
          null,
          "User not found using decoded"
        );
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
