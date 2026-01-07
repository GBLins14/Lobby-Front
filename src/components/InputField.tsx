import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
  rightElement?: React.ReactNode;
}

const InputField = ({
  icon: Icon,
  label,
  rightElement,
  ...props
}: InputFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {rightElement}
      </div>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          {...props}
          className="w-full input-dark pl-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>
    </div>
  );
};

export default InputField;
