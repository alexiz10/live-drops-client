import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import Session from "supertokens-web-js/recipe/session";

export type AuthSnapshot =
  | { status: "unauthenticated" }
  | {
      status: "authenticated";
      userId: string;
    };

export async function getAuthSnapshot(): Promise<AuthSnapshot> {
  const hasSession = await Session.doesSessionExist();
  if (!hasSession) return { status: "unauthenticated" };

  const userId = await Session.getUserId();

  return {
    status: "authenticated",
    userId,
  };
}

export async function signUp(email: string, password: string) {
  return EmailPassword.signUp({
    formFields: [
      { id: "email", value: email },
      { id: "password", value: password },
    ],
  });
}

export async function signIn(email: string, password: string) {
  return EmailPassword.signIn({
    formFields: [
      { id: "email", value: email },
      { id: "password", value: password },
    ],
  });
}

export async function signOut() {
  await Session.signOut();
}
