import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

export default async function Home() {
  let user = null;
  try {
    user = await getSessionUser();
  } catch {
    // DB down — fall through to login
  }
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  }
  redirect("/login");
}
