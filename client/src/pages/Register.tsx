import { Signup } from "@/authentication/signup-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const registerSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be atleast 8 character long")
    .max(16, "Password can't be exceed 16 character"),
});
const Register = () => {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: { email: string; password: string }) =>
    console.log(data);

  return (
    <div className="bg-black flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Signup
          onFormSubmit={onSubmit}
          register={register}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default Register;
