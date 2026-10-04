import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { readJson, bad, ok, optionalString } from "@/lib/adminApi";
import { revalidateContent } from "@/lib/revalidate";

function cleanMenu(value) {
  return value === "FOOTER" ? "FOOTER" : "HEADER";
}

export async function GET() {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;
  const items = await prisma.navigationItem.findMany({ orderBy: [{ menu: "asc" }, { order: "asc" }] });
  return ok({ items });
}

export async function POST(request) {
  const guard = await requireApiUser();
  if (guard.response) return guard.response;

  const body = await readJson(request);
  if (!body) return bad("Invalid request body.");

  const label = String(body.label ?? "").trim();
  const href = String(body.href ?? "").trim();
  if (!label) return bad("Label is required.");
  if (!href) return bad("A link (href) is required.");

  const item = await prisma.navigationItem.create({
    data: {
      label: label.slice(0, 80),
      href: href.slice(0, 500),
      menu: cleanMenu(body.menu),
      isCta: Boolean(body.isCta),
      order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      visible: body.visible === undefined ? true : Boolean(body.visible),
    },
  });
  revalidateContent("/");
  return ok({ item }, 201);
}
