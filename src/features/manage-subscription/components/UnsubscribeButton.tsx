import { SubmitButton } from "@/shared/ui";
import { unsubscribeAction } from "../actions";

export const UnsubscribeButton = () => (
  <form action={unsubscribeAction}>
    <SubmitButton variant="danger" pendingLabel="Unsubscribing…">
      Unsubscribe
    </SubmitButton>
  </form>
);
