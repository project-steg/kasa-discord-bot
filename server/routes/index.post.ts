import {
  verifyWebhookRequest,
  isPingRequest,
  pongResponse,
  isApplicationCommand,
  createMessageResponseObject,
} from "~/utils/intaraction";
import { isUmbrellaNeeded, getUmbrellaMessage } from "~/utils/weather";

export default defineEventHandler(async (event) => {
  // Webhookリクエストの検証
  const publicKey = useRuntimeConfig().discordPublicKey;
  await verifyWebhookRequest(event, { publicKey });

  // Pingリクエストの場合はPongレスポンスを返す
  if (await isPingRequest(event)) {
    return pongResponse();
  }

  // ApplicationCommandからのリクエストではない場合は、エラーを返す
  if (!(await isApplicationCommand(event))) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request",
    });
  }

  const message = await getUmbrellaMessage();

  return createMessageResponseObject(message);
});
