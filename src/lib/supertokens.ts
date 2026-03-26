import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";
import { env } from "./env";

export const initSuperTokens = () => {
  SuperTokens.init({
    appInfo: {
      appName: "LiveDrops",
      apiDomain: env.apiBaseUrl,
      apiBasePath: "/auth",
    },
    recipeList: [Session.init(), EmailPassword.init()],
  });
};
