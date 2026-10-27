import express from "express";

import {
  createOrder,
  getOrdersByUserId,
  getOrderById,
  addProductToOrder,
  getProductsByOrderId,
} from "#db/queries/orders";

import { getProductById } from "#db/queries/products";

import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

const router = express.Router();

// Every route in this router requires authentication.
router.use(requireUser);

// Check that an order exists and belongs to the user.
async function requireOrderOwner(req, res, next) {
  try {
    const order = await getOrderById(req.params.id);

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    if (order.user_id !== req.user.id) {
      return res.status(403).send("Forbidden: You do not own this order.");
    }

    req.order = order;
    next();
  } catch (error) {
    next(error);
  }
}

// POST /orders
router.post("/", requireBody(["date"]), async (req, res, next) => {
  try {
    const { date, note } = req.body;

    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date))
    ) {
      return res.status(400).send("A valid date is required.");
    }

    const order = await createOrder(date, note ?? null, req.user.id);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

// GET /orders
router.get("/", async (req, res, next) => {
  try {
    const orders = await getOrdersByUserId(req.user.id);

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

// GET /orders/:id
router.get("/:id", requireOrderOwner, (req, res) => {
  res.status(200).json(req.order);
});

// POST /orders/:id/products
router.post(
  "/:id/products",
  requireOrderOwner,
  requireBody(["productId", "quantity"]),
  async (req, res, next) => {
    try {
      const { productId, quantity } = req.body;

      if (
        !Number.isInteger(productId) ||
        !Number.isInteger(quantity) ||
        productId <= 0 ||
        quantity <= 0
      ) {
        return res
          .status(400)
          .send("Valid productId and quantity are required.");
      }

      const product = await getProductById(productId);

      if (!product) {
        return res.status(400).send("Product does not exist.");
      }

      const orderProduct = await addProductToOrder(
        req.order.id,
        productId,
        quantity,
      );

      res.status(201).json(orderProduct);
    } catch (error) {
      next(error);
    }
  },
);

// GET /orders/:id/products
router.get("/:id/products", requireOrderOwner, async (req, res, next) => {
  try {
    const products = await getProductsByOrderId(req.order.id);

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

export default router;
