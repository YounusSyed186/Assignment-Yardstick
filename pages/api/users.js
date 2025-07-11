// pages/api/users.js

import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("your-db-name");
  const users = await db.collection("users").find({}).toArray();
  res.status(200).json(users);
}
