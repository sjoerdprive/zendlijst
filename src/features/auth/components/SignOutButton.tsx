"use client";

import { useDictionary } from "@/shared/i18n";
import { navigateTo } from "@/shared/lib";
import { Button } from "@/shared/ui";
import { signOutAction } from "../actions";

export const SignOutButton = () => {
  const t = useDictionary();
  return (
    <form action={async () => navigateTo(await signOutAction())}>
      <Button type="submit" variant="ghost">
        {t.header.signOut}
      </Button>
    </form>
  );
};
