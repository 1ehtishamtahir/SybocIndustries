import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { ok } from "@/lib/adminApi";

export async function GET(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const url = new URL(request.url);
  const where = {};
  const type = url.searchParams.get("type");
  if (type === "QUOTE" || type === "CONTACT") where.type = type;
  if (url.searchParams.get("unread") === "1") where.read = false;

  const submissions = await prisma.contactSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const unreadCount = await prisma.contactSubmission.count({ where: { read: false } });
  return ok({ submissions, unreadCount });
}
