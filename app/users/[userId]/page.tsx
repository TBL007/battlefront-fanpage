"use client";

import { use } from "react";
import UserProfile from "@components/userProfile";

export default function PublicUserPage(props: PageProps<"/users/[userId]">) {
  const { userId } = use(props.params);

  return <UserProfile userId={userId} />;
}