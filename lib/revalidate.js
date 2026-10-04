import { revalidatePath } from "next/cache";

// Public content renders dynamically from the DB, so this mostly matters for
// the sitemap and any future cached segments — called after every mutation so
// stale paths are invalidated the moment an admin publishes.
export function revalidateContent(...paths) {
  const list = paths.length ? paths : ["/", "/sitemap.xml"];
  if (!list.includes("/")) list.unshift("/");
  if (!list.includes("/sitemap.xml")) list.push("/sitemap.xml");
  for (const path of list) {
    revalidatePath(path);
  }
}
