"use client";

import { useState } from "react";
import { SignInCodeForm } from "./SignInCodeForm";
import { SignInEmailForm } from "./SignInEmailForm";

// Step 1 asks for the email address; step 2 accepts the code from the email
// (the link in the same email keeps working too).
export const SignInForm = () => {
  const [email, setEmail] = useState<string | null>(null);
  return email ? <SignInCodeForm email={email} onBack={() => setEmail(null)} /> : <SignInEmailForm onSent={setEmail} />;
};
