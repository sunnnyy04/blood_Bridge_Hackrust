import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: true },
        bloodType: { type: "string", required: false },
        phone: { type: "string", required: false },
        latitude: { type: "number", required: false },
        longitude: { type: "number", required: false },
        hospitalName: { type: "string", required: false },
        contactName: { type: "string", required: false },
      },
    }),
  ],
});

export const { signIn, signUp, useSession, signOut } = authClient;
