import express from "express";

const router = express.Router();

router.use(express.json());

router.use("/register", (req, res) => {});

export default router;
