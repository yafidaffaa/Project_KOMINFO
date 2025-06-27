type InputFieldProps = {
  label: string;
  type?: string;
  id: string;
};

const InputField = ({ label, type = "text", id }: InputFieldProps) => (
  <div>
    <label htmlFor={id} className="block text-sm mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
    />
  </div>
);

export default InputField;
