import { H3Event } from "h3";
import { verifyKey } from "discord-interactions";
import {
  InteractionType,
  InteractionResponseType,
  type APIChatInputApplicationCommandInteraction,
  type APIPingInteraction,
  type APIInteractionResponseChannelMessageWithSource,
  type APIInteractionResponsePong,
} from "discord-api-types/v10";

/**
 * インタラクションが検証済みかどうかを確認する
 * @param event H3Eventオブジェクト
 * @returns 検証済みの場合はtrue、そうでない場合はfalse
 */
export const isVerified = async (event: H3Event, { publicKey }): Promise<boolean> => {
  // Webhookで送信されたリクエストの検証
  // ref: https://discord.com/developers/docs/events/webhook-events#setting-up-an-endpoint
  const signature = getHeader(event, "X-Signature-Ed25519");
  const timestamp = getHeader(event, "X-Signature-Timestamp");
  const rawBody = await readRawBody(event);

  return verifyKey(rawBody, signature, timestamp, publicKey);
};

/**
 * Webhookリクエストを検証する
 * @param event H3Eventオブジェクト
 * @throws Error 検証に失敗した場合
 */
export const verifyWebhookRequest = async (event: H3Event, { publicKey }): Promise<void> => {
  const isRequestVerified = await isVerified(event, { publicKey });
  if (!isRequestVerified) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid request signature",
    });
  }
};

/**
 * インタラクションがPingリクエストかどうかを確認する
 * @param event H3Eventオブジェクト
 * @returns Pingリクエストの場合はtrue、そうでない場合はfalse
 */
export const isPingRequest = async (event: H3Event): Promise<boolean> => {
  const body = await readBody<
    APIPingInteraction | APIChatInputApplicationCommandInteraction
  >(event);
  return body.type === InteractionType.Ping;
};

/**
 * インタラクションがアプリケーションコマンドかどうかを確認する
 * @param event H3Eventオブジェクト
 * @returns アプリケーションコマンドの場合はtrue、そうでない場合はfalse
 */
export const isApplicationCommand = async (event: H3Event): Promise<boolean> => {
  const body = await readBody<
    APIPingInteraction | APIChatInputApplicationCommandInteraction
  >(event);
  return body.type === InteractionType.ApplicationCommand;
};

/**
 * Pingリクエストに対するPongレスポンスを返却する
 * @returns Pongレスポンスオブジェクト
 */
export const pongResponse = (): APIInteractionResponsePong => {
  return { type: InteractionResponseType.Pong };
};

/**
 * "Hello World!"メッセージを返却するレスポンスを生成する
 * @returns Hello Worldレスポンスオブジェクト
 */
export const helloWorldResponse = (): APIInteractionResponseChannelMessageWithSource => {
  return {
    type: InteractionResponseType.ChannelMessageWithSource,
    data: { content: "Hello World!" }
  };
};
