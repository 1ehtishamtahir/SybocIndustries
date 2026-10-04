import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok } from "@/lib/adminApi";
import bcrypt from "bcryptjs";

const SAFE_SELECT = { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true };

function validRole(role) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function GET() {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;
  const users = await prisma.adminUser.findMany({ select: SAFE_SELECT, orderBy: { createdAt: "asc" } });
  return ok({ users });
}

export async function POST(request) {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!name) return bad("Name is required.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad("A valid email is required.");
  if (password.length < 8) return bad("Password must be at least 8 characters.");
  if (!validRole(body.role)) return bad("Role must be ADMIN or EDITOR.");

  const clash = await prisma.adminUser.findUnique({ where: { email } });
  if (clash) return bad("A user with that email already exists.", 409);

  const user = await prisma.adminUser.create({
    data: { name, email, role: body.role, passwordHash: await bcrypt.hash(password, 12) },
    select: SAFE_SELECT,
  });
  return ok({ user }, 201);
}
