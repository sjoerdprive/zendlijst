"use client";

import { useActionState, useState } from "react";
import { slugify } from "@/entities/organisation";
import { IDLE_STATE } from "@/shared/lib";
import { Field, FormMessage, Input, SubmitButton, Textarea } from "@/shared/ui";
import { requestOrganisationAction } from "../actions";
import type { RequestOrganisationFormProps } from "../types";

export const RequestOrganisationForm = ({ rootDomain }: RequestOrganisationFormProps) => {
  const [state, formAction] = useActionState(requestOrganisationAction, IDLE_STATE);
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success") return <FormMessage state={state} />;

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Organisation name" name="organisationName" errors={errors?.organisationName}>
        <Input
          id="organisationName"
          name="organisationName"
          required
          maxLength={100}
          onChange={(event) => {
            if (!slugEdited) setSlug(slugify(event.target.value));
          }}
        />
      </Field>
      <Field
        label="Subdomain"
        name="slug"
        hint={`Your subscribers will visit ${slug || "your-name"}.${rootDomain}`}
        errors={errors?.slug}
      >
        <Input
          id="slug"
          name="slug"
          required
          value={slug}
          pattern="[a-z0-9][a-z0-9\-]{1,30}[a-z0-9]"
          onChange={(event) => {
            setSlugEdited(true);
            setSlug(event.target.value.toLowerCase());
          }}
        />
      </Field>
      <Field
        label="Admin email address"
        name="adminEmail"
        hint="This account manages subscribers and writers. You sign in with a link sent to this address."
        errors={errors?.adminEmail}
      >
        <Input id="adminEmail" name="adminEmail" type="email" autoComplete="email" required />
      </Field>
      <Field label="Anything we should know? (optional)" name="message" errors={errors?.message}>
        <Textarea id="message" name="message" maxLength={1000} />
      </Field>
      <div aria-hidden="true" className="hidden">
        <label>
          Website <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingLabel="Sending request…">Request an account</SubmitButton>
    </form>
  );
};
