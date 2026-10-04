export interface SignInEmailFormProps {
  onSent: (email: string) => void;
}

export interface SignInCodeFormProps {
  email: string;
  onBack: () => void;
}
