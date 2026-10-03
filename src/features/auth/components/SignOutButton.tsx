import { getDictionary } from "@/shared/i18n/server";
import { Button } from "@/shared/ui";
import { signOutAction } from "../actions";

export const SignOutButton = async () => {
  const t = await getDictionary();
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="ghost">
        {t.header.signOut}
      </Button>
    </form>
  );
};
