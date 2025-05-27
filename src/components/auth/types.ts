
export type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
};

export interface SignUpFormProps {
  onToggleForm: () => void;
  onContinue: () => void;
}
