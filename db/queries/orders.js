import db from "#db/client";

export async function createOrder(date, note, userId) {
  const { rows } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [date, note, userId],
  );

  return rows[0];
}

export async function getOrdersByUserId(userId) {
  const { rows } = await db.query(
    `SELECT *
     FROM orders
     WHERE user_id = $1
     ORDER BY id`,
    [userId],
  );

  return rows;
}

export async function getOrderById(id) {
  const { rows } = await db.query("SELECT * FROM orders WHERE id = $1", [id]);

  return rows[0];
}

export async function addProductToOrder(orderId, productId, quantity) {
  const { rows } = await db.query(
    `INSERT INTO orders_products
       (order_id, product_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (order_id, product_id)
     DO UPDATE SET
       quantity = orders_products.quantity + EXCLUDED.quantity
     RETURNING *`,
    [orderId, productId, quantity],
  );

  return rows[0];
}

export async function getProductsByOrderId(orderId) {
  const { rows } = await db.query(
    `SELECT p.*
     FROM products AS p
     JOIN orders_products AS op
       ON p.id = op.product_id
     WHERE op.order_id = $1
     ORDER BY p.id`,
    [orderId],
  );

  return rows;
}
