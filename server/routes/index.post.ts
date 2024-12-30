import {
  verifyWebhookRequest,
  isPingRequest,
  pongResponse,
  isApplicationCommand,
  helloWorldResponse,
} from "~/utils/intaraction";

export default eventHandler(async (event) => {
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

  // Hello World!を返却する
  return helloWorldResponse();
});
