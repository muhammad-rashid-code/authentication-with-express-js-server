export default function sendResponse(res, status, error, data, message) {
  res.status(status).json({ error: error, data: data, message });
}
