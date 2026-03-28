import { db } from "@/db/index.js";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: [process.env.FRONTEND_URL],
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "donor",
                input: true,
            },
            bloodType: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
            phone: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
            isAvailable: {
                type: "boolean",
                required: true,
                defaultValue: true,
                input: true,
            },
            latitude: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
            longitude: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
            hospitalName: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
            contactName: {
                type: "string",
                required: false,
                defaultValue: null,
                input: true,
            },
        },
    },
});
