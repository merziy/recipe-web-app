import dotenv from 'dotenv';
import { comparePassword, getUserCollection, hashPassword } from './user.js';
dotenv.config();

export async function signupUser(db, email, password) {
  const users = getUserCollection(db);
  const existing = await users.findOne({ email });
  if (existing) throw new Error('User already exists');
  const passwordHash = await hashPassword(password);
  const result = await users.insertOne({ email, passwordHash });
  return result.insertedId;
}

export async function loginUser(db, email, password) {
  const users = getUserCollection(db);
  const user = await users.findOne({ email });
  if (!user) throw new Error('Invalid credentials');
  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');
  return { _id: user._id, email: user.email };
}
