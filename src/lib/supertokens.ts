import SuperTokens from "supertokens-web-js";
import Session from "supertokens-web-js/recipe/session";
import EmailPassword from "supertokens-web-js/recipe/emailpassword";

export const initSuperTokens = () => {
  SuperTokens.init({
    appInfo: {
      appName: "Live Auction Platform",
      apiDomain: "http://localhost:8000",
      apiBasePath: "/auth",
    },
    recipeList: [
      Session.init(),
      EmailPassword.init(),
    ]
  })
}
