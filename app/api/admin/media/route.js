import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { ok, bad } from "@/lib/adminApi";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_SIZE = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

function safeName(original) {
  const ext = path.extname(original).toLowerCase().slice(0, 10) || ".bin";
  const base = path
    .basename(original, path.extname(original))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  return `${Date.now()}-${base}${ext}`;
}

export async function GET() {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { name: true, email: true } } },
  });
  return ok({ media });
}

export async function POST(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  let form;
  try {
    form = await request.formData();
  } catch {
    return bad("Expected multipart form data.");
  }

  const file = form.get("file");
  if (!file || typeof file === "string") return bad("No file provided.");
  if (!ALLOWED.includes(file.type)) return bad("Only image files are allowed (jpg, png, webp, gif, svg, avif).");
  if (file.size > MAX_SIZE) return bad("File is larger than 8 MB.");

  const filename = safeName(file.name || "image");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  const alt = typeof form.get("alt") === "string" ? String(form.get("alt")).trim().slice(0, 300) : null;
  const media = await prisma.media.create({
    data: {
      filename,
      originalName: (file.name || "image").slice(0, 300),
      mimeType: file.type,
      size: file.size,
      path: `/uploads/${filename}`,
      alt: alt || null,
      uploadedById: guard.user.id,
    },
  });

  return ok({ media }, 201);
}
