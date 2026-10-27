import db from "#db/client";

export async function getUserById(id) {
  const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);

  return rows[0];
}

export async function getUserByUsername(username) {
  const { rows } = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);

  return rows[0];
}

export async function createUser(username, password) {
  const { rows } = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING *`,
    [username, password],
  );

  return rows[0];
}
