import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok } from "@/lib/adminApi";
import bcrypt from "bcryptjs";

const SAFE_SELECT = { id: true, name: true, email: true, role: true, createdAt: true, lastLoginAt: true };

async function resolve(params) {
  const { id } = await params;
  return prisma.adminUser.findUnique({ where: { id }, select: { ...SAFE_SELECT, passwordHash: true } });
}

async function countAdmins() {
  return prisma.adminUser.count({ where: { role: "ADMIN" } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;
  const user = await resolve(params);
  if (!user) return bad("User not found.", 404);
  const { passwordHash, ...safe } = user;
  return ok({ user: safe });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("User not found.", 404);

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const data = {};
  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return bad("Name is required.");
    data.name = name;
  }
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return bad("A valid email is required.");
    if (email !== current.email) {
      const clash = await prisma.adminUser.findUnique({ where: { email } });
      if (clash) return bad("A user with that email already exists.", 409);
    }
    data.email = email;
  }
  if (body.role !== undefined) {
    if (!validRoleValue(body.role)) return bad("Role must be ADMIN or EDITOR.");
    if (body.role !== current.role && current.role === "ADMIN" && (await countAdmins()) <= 1) {
      return bad("This is the only ADMIN account. Promote another user first.", 409);
    }
    data.role = body.role;
  }
  if (body.password !== undefined && body.password !== "") {
    const password = String(body.password);
    if (password.length < 8) return bad("Password must be at least 8 characters.");
    data.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.adminUser.update({
    where: { id: current.id },
    data,
    select: SAFE_SELECT,
  });
  return ok({ user });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser({ adminOnly: true });
  if (guard.response) return guard.response;

  const current = await resolve(params);
  if (!current) return bad("User not found.", 404);

  if (current.id === guard.user.id) return bad("You cannot delete your own account.", 409);
  if (current.role === "ADMIN" && (await countAdmins()) <= 1) {
    return bad("This is the only ADMIN account and cannot be deleted.", 409);
  }

  await prisma.adminUser.delete({ where: { id: current.id } });
  return ok();
}

function validRoleValue(role) {
  return role === "ADMIN" || role === "EDITOR";
}
