import fs from "fs/promises";
import path from "path";
import prisma from "../prisma/client.js";

const PREFIX = `${process.env.API_URL || "http://localhost:3000"}/uploads/`;

export function filenameFromUrl(url) {
  if (typeof url !== "string" || !url.startsWith(PREFIX)) return null;
  const name = url.slice(PREFIX.length);
  return /^[\w-]+\.(jpg|png|webp)$/.test(name) ? name : null;
}

export async function userOwnsUpload(userId, url) {
  const filename = filenameFromUrl(url);
  if (!filename) return false;
  const upload = await prisma.upload.findUnique({ where: { filename } });
  return upload?.ownerId === userId;
}

export async function deleteIfUnused(url) {
  const filename = filenameFromUrl(url);
  if (!filename) return;

  const [users, messages, posts] = await Promise.all([
    prisma.user.count({ where: { profilePic: url } }),
    prisma.message.count({ where: { imageUrl: url } }),
    prisma.post.count({ where: { imageUrl: url } }),
  ]);
  if (users + messages + posts > 0) return;

  await fs.unlink(path.join(process.cwd(), "uploads", filename)).catch(() => {});
  await prisma.upload.deleteMany({ where: { filename } });
}