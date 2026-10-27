import db from "#db/client";
import bcrypt from "bcryptjs";

await db.connect();
await seed();
await db.end();

console.log("🌱 Database seeded.");

async function seed() {
  const password = await bcrypt.hash("password123", 10);

  const { rows: users } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    ["marketuser", password],
  );

  const user = users[0];

  const products = [
    ["Laptop", "Portable computer", 899.99],
    ["Keyboard", "Mechanical keyboard", 89.99],
    ["Mouse", "Wireless gaming mouse", 49.99],
    ["Monitor", "27 inch monitor", 249.99],
    ["Headphones", "Noise cancelling headphones", 129.99],
    ["Microphone", "USB microphone", 79.99],
    ["Webcam", "1080p webcam", 59.99],
    ["Desk", "Adjustable computer desk", 299.99],
    ["Chair", "Ergonomic office chair", 199.99],
    ["Speakers", "Desktop speakers", 99.99],
  ];

  const productIds = [];

  for (const [title, description, price] of products) {
    const { rows } = await db.query(
      `INSERT INTO products
         (title, description, price)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, price],
    );

    productIds.push(rows[0].id);
  }

  const { rows: orders } = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    ["2026-10-26", "Initial sample order", user.id],
  );

  const order = orders[0];

  for (let i = 0; i < 5; i++) {
    await db.query(
      `INSERT INTO orders_products
         (order_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [order.id, productIds[i], i + 1],
    );
  }
}
