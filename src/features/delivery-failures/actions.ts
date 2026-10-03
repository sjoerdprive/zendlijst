"use server";

import { refresh } from "next/cache";
import { resolveFailure } from "@/entities/delivery/server";
import { authorizeMember } from "@/entities/membership/server";
import { requireCurrentOrganisation } from "@/entities/organisation/server";
import { getDictionary } from "@/shared/i18n/server";
import { actionError, actionSuccess, type ActionState } from "@/shared/lib";

export const resolveFailureAction = async (
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const organisation = await requireCurrentOrganisation();
  const member = await authorizeMember(organisation.id, ["admin", "writer"]);
  const t = await getDictionary();
  if (!member) return actionError(t.common.notAllowed);

  const ids = formData.getAll("deliveryId").map(String);
  const results = await Promise.all(ids.map((id) => resolveFailure(organisation.id, id, member.userId)));
  refresh();
  return results.some(Boolean) ? actionSuccess(t.failures.markedHandled) : actionError(t.failures.alreadyHandled);
};
