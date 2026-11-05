import prisma from "../prisma/client.js";

export async function blockGuests(req, res, next) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { isGuest: true },
  });
  if (!user || user.isGuest) {
    return res.status(403).json({ message: "Guests can't upload files" });
  }
  next();
}