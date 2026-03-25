import {createFileRoute, Link, useNavigate} from '@tanstack/react-router'
import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {type AuthInput, authSchema} from "../lib/schemas.ts";
import { signUp } from "supertokens-web-js/recipe/emailpassword";

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const navigate = useNavigate();
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
      const response = await signUp({
        formFields: [
          { id: "email", value: data.email },
          { id: "password", value: data.password },
        ]
      });

      console.log(response);
      if (response.status === "OK") {
        void navigate({ to: "/" });
      } else if (response.status === "FIELD_ERROR") {
        response.formFields.map(field => {
          setError(field.id, { message: field.error });
        })
      } else {
        setGeneralError("Registration failed. Please check your credentials.");
      }
    } catch {
      setGeneralError("An unexpected error occurred. Please try again later.");
    }
  }

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400";

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg mt-12 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-950 mb-2">Create an Account</h1>
      <p className="text-gray-600 mb-8">Sign up to start bidding on live auctions.</p>

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
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            placeholder="Minimum 8 characters"
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-red-600 text-xs mt-1.5">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 cursor-pointer text-white p-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-gray-600 mt-8 text-sm">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign In
        </Link>
      </p>
    </div>
  )
}
