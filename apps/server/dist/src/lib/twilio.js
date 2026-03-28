import Twilio from "twilio";
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;
export const twilio = {
    sendWhatsApp: async ({ to, body }) => {
        if (!client || !fromNumber) {
            return { success: true, mock: true };
        }
        try {
            const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
            const formattedTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
            const message = await client.messages.create({
                body,
                from: formattedFrom,
                to: formattedTo,
            });
            return { success: true, sid: message.sid };
        }
        catch (error) {
            console.error("Twilio error:", error);
            throw error;
        }
    },
};
