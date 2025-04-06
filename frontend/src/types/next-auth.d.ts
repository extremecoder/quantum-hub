import NextAuth, { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    accessToken?: string; // Add the accessToken property
    user: {
      id?: string; // Add the id property to the user object
    } & DefaultSession["user"]; // Keep the default properties
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   * Also used in the `user` parameter in the `jwt` callback.
   */
  interface User extends DefaultUser {
    // Add any custom properties returned by your backend/authorize function
    access_token?: string;
    id?: string; 
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    accessToken?: string; // Add accessToken to the JWT type
    id?: string; // Add id to the JWT type
  }
}
