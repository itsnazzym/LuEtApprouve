import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import { platforms, dataPoints } from "@/db/schema";
import { AdminDashboard } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token || !(await verifyToken(token))) {
    redirect("/admin/login");
  }

  const allPlatforms = await db.select().from(platforms);

  const stats = {
    total: allPlatforms.length,
    grades: { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 },
    rechecked: 0,
  };

  for (const p of allPlatforms) {
    if (p.last_rechecked_at) stats.rechecked++;
    if (p.grade in stats.grades) stats.grades[p.grade as keyof typeof stats.grades]++;
  }

  return <AdminDashboard stats={stats} platforms={allPlatforms} />;
}
