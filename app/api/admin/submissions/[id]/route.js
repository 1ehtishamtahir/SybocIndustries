import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok } from "@/lib/adminApi";

async function resolve(params) {
  const { id } = await params;
  return prisma.contactSubmission.findUnique({ where: { id } });
}

export async function GET(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const submission = await resolve(params);
  if (!submission) return bad("Submission not found.", 404);
  return ok({ submission });
}

export async function PATCH(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const submission = await resolve(params);
  if (!submission) return bad("Submission not found.", 404);

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");
  if (typeof body.read !== "boolean") return bad("Expected { read: boolean }.");

  const updated = await prisma.contactSubmission.update({
    where: { id: submission.id },
    data: { read: body.read },
  });
  return ok({ submission: updated });
}

export async function DELETE(request, { params }) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const submission = await resolve(params);
  if (!submission) return bad("Submission not found.", 404);
  await prisma.contactSubmission.delete({ where: { id: submission.id } });
  return ok();
}
