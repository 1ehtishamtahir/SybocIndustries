import Link from "next/link";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New suit" };

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { type: "PRODUCT" },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <div className="admin-topbar">
        <div>
          <p className="admin-crumb">
            <Link href="/admin/products">Suits</Link> / New
          </p>
          <h1>New suit</h1>
        </div>
      </div>
      <ProductForm categories={categories} />
    </>
  );
}
