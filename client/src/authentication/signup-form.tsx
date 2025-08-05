import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaEye, FaEyeSlash, FaGithub, FaGoogle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";

export function Signup({
  className,
  onFormSubmit,
  register,
  handleSubmit,
  ...props
}: React.ComponentProps<"div"> & {
  onFormSubmit: (data: { email: string; password: string }) => void;
  register: any;
  handleSubmit: any;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <Link to={"/"} className="relative lg:left-85 text-xl cursor-pointer">
          <RxCross1 />
        </Link>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Register your account</CardTitle>
          <CardDescription>
            Login with your Google account or Github account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full cursor-pointer">
                  <FaGoogle />
                  Login with Google
                </Button>
                <Button variant="outline" className="w-full cursor-pointer">
                  <FaGithub />
                  Login with Github
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="text"
                    {...register("email")}
                    placeholder="johndoe@gmail.com"
                  />
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to={"/"}
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="flex justify-center items-center relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="************"
                      required
                    />
                    <span
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="cursor-pointer absolute right-2"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
                <Button type="submit" className="w-full cursor-pointer">
                  Signup
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to={"/login"} className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
