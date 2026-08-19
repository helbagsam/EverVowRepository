import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function RootPage() {
  const session = await getSession();
  if (session.accountId) {
    redirect("/dashboard");
  }
  redirect("/login");
}
