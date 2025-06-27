import type { ChangeEvent } from "react";

type InputFieldProps = {
  label: string;
  type?: string;
  id: string;
  name?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
};

const InputField = ({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  required = false,
}: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={name || id}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
    />
  </div>
);

export default InputField;
