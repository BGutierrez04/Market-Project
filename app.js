import express from "express";

import getUserFromToken from "#middleware/getUserFromToken";

import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";

const app = express();

// Parse incoming JSON request bodies.
app.use(express.json());

// Read JWT tokens and attach authenticated users.
app.use(getUserFromToken);

// Separate routers.
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/orders", ordersRouter);

// Handle routes that do not exist.
app.use((req, res) => {
  res.status(404).send("Route not found.");
});

// Centralized error handler.
app.use((error, req, res, next) => {
  console.error(error);

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).send("Invalid JSON request body.");
  }

  if (error.code === "23505") {
    return res.status(400).send("A record with that value already exists.");
  }

  res.status(500).send("Internal server error.");
});

export default app;
