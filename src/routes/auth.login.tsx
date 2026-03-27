import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AuthInput, authSchema } from "../lib/schemas";
import { signIn } from "../lib/auth";
import { useAuthStore } from "../lib/store";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuthStore();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: AuthInput) => {
    setGeneralError(null);

    try {
      const response = await signIn(data.email, data.password);

      if (response.status === "OK") {
        await refresh();
        void navigate({ to: "/" });
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        setGeneralError("Invalid email or password");
      } else if (response.status === "FIELD_ERROR") {
        response.formFields.map(field => {
          setError(field.id as keyof AuthInput, { message: field.error });
        });
      } else {
        setGeneralError("Login failed. Please check your credentials.");
      }
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    }
  };

  const inputClass =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400";

  return (
    <div className="mx-auto mt-12 max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-2 text-3xl font-extrabold text-gray-950">Welcome Back</h1>
      <p className="mb-8 text-gray-600">Sign in to your account to continue.</p>

      {generalError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {generalError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Password
            </label>
            {/* TODO: Add forgot password link */}
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            placeholder="••••••••••••"
            {...register("password")}
          />
          {errors.password ? (
            <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-xl bg-indigo-600 p-3.5 text-lg font-semibold text-white transition duration-150 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
