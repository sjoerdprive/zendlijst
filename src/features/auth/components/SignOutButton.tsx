import { Button } from "@/shared/ui";
import { signOutAction } from "../actions";

export const SignOutButton = () => (
  <form action={signOutAction}>
    <Button type="submit" variant="ghost">
      Sign out
    </Button>
  </form>
);
