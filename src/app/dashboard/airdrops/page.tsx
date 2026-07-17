// Redirect to /dashboard/explores
import { redirect } from "next/navigation";

export default function OldAirdropsPage() {
  redirect("/dashboard/explores");
}
