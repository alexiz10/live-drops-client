import {createFileRoute, Link, useNavigate} from '@tanstack/react-router'
import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {type AuthInput, authSchema} from "../lib/schemas.ts";
import { signIn } from "../lib/auth";

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate();
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<AuthInput>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" }
  })

  const onSubmit = async (data: AuthInput) => {
    setGeneralError(null);

    try {
      const response = await signIn(data.email, data.password)

      if (response.status === "OK") {
        void navigate({ to: "/" })
      } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
        setGeneralError("Invalid email or password");
      } else if (response.status === "FIELD_ERROR") {
        response.formFields.map(field => {
          setError(field.id, { message: field.error });
        })
      } else {
        setGeneralError("Login failed. Please check your credentials.");
      }
    } catch {
      setGeneralError("An unexpected error occurred. Please try again.");
    }
  }

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg mt-12 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-950 mb-2">Welcome Back</h1>
      <p className="text-gray-600 mb-8">Sign in to your account to continue.</p>

      {generalError ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm">
          {generalError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
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
            <p className="text-red-600 text-xs mt-1.5">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
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
            <p className="text-red-600 text-xs mt-1.5">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 cursor-pointer text-white p-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-8 text-sm">
        Don't have an account?{' '}
        <Link to="/auth/register" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign Up
        </Link>
      </p>
    </div>
  )
}
