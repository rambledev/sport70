import { redirect } from "next/navigation";

// select-role is now handled during login
export default function SelectRolePage() {
  redirect("/login");
}
