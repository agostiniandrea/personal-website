import AdminLayout from "@components/organisms/AdminLayout";
import AdminOverview from "@components/organisms/AdminOverview";

/* Private admin area. The pages hold no data: each section loads everything
   from /api/admin/*, which verifies Cloudflare Access on every call. The path
   is also kept out of search results and the sitemap, and analytics are off
   here (see pages/_app.tsx). */

export default function AdminHome() {
  return (
    <AdminLayout
      current="/admin"
      title="Overview"
      description="What needs attention across the site."
    >
      <AdminOverview />
    </AdminLayout>
  );
}
