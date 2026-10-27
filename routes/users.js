import express from "express";
import bcrypt from "bcryptjs";

import { createUser, getUserByUsername } from "#db/queries/users";

import { createToken } from "#utils/jwt";
import requireBody from "#middleware/requireBody";

const router = express.Router();

router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username.trim() ||
        !password
      ) {
        return res.status(400).send("Username and password are required.");
      }

      const existingUser = await getUserByUsername(username);

      if (existingUser) {
        return res.status(400).send("Username already exists.");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await createUser(username, hashedPassword);

      const token = createToken({ id: user.id });

      res.status(201).send(token);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        !username ||
        !password
      ) {
        return res.status(400).send("Username and password are required.");
      }

      const user = await getUserByUsername(username);

      if (!user) {
        return res.status(401).send("Invalid credentials.");
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).send("Invalid credentials.");
      }

      const token = createToken({ id: user.id });

      res.status(200).send(token);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
