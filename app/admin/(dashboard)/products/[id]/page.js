import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit suit" };

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { type: "PRODUCT" }, orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/products">Suits</Link> / Edit
          </p>
          <h1>{product.name}</h1>
        </div>
      </div>
      <ProductForm product={product} categories={categories} />
    </>
  );
}
