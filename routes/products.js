import express from "express";

import {
  getAllProducts,
  getProductById,
  getOrdersByProductAndUser,
} from "#db/queries/products";

import requireUser from "#middleware/requireUser";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts();

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/orders", async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const orders = await getOrdersByProductAndUser(product.id, req.user.id);

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found.");
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});

export default router;
