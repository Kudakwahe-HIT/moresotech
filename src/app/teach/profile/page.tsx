import type { Metadata } from "next";
import { AccountProfile } from "@/components/account/account-profile";

export const metadata: Metadata = {
  title: "My profile | MoreSo Tech",
};

export default function ProfilePage() {
  return <AccountProfile />;
}
