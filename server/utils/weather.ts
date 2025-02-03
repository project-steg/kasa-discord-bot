// APIレスポンスの型定義
type WeatherAPIResponse = {
  forecasts: {
    chanceOfRain: {
      T00_06: string;
      T06_12: string;
      T12_18: string;
      T18_24: string;
    };
  }[];
}

// 時間帯ごとの降水確率の型定義
type TimeSlotRainChance = {
  morning: string; // 0-6時
  noon: string;    // 6-12時
  evening: string; // 12-18時
  night: string;   // 18-24時
}

// 降水確率の閾値
const RAIN_PROBABILITY_THRESHOLD = 20;

// 天気APIのエンドポイント
const WEATHER_API_ENDPOINT = 'https://weather.tsukumijima.net/api/forecast/city/130010';

/**
 * 天気APIから東京の天気予報を取得する
 * @returns WeatherAPIResponse
 * @throws Error API呼び出しに失敗した場合
 */
const fetchWeatherForecast = async (): Promise<WeatherAPIResponse> => {
  try {
    return await $fetch<WeatherAPIResponse>(WEATHER_API_ENDPOINT);
  } catch (error) {
    console.error('天気情報の取得に失敗しました:', error);
    throw new Error('天気情報の取得に失敗しました');
  }
};

/**
 * 降水確率の文字列配列を数値配列に変換する
 * @param rainChances 降水確率の文字列を含むオブジェクト
 * @returns 数値に変換された降水確率の配列
 */
const convertRainChancesToNumbers = (rainChances: TimeSlotRainChance): number[] => {
  return Object.values(rainChances).map(chance => parseInt(chance));
};

/**
 * 東京の今日の降水確率を取得する
 * @returns 時間帯ごとの降水確率を含むオブジェクト
 */
export const getTodayRainChance = async (): Promise<TimeSlotRainChance> => {
  const response = await fetchWeatherForecast();
  const todayForecast = response.forecasts[0];
  
  return {
    morning: todayForecast.chanceOfRain.T00_06,
    noon: todayForecast.chanceOfRain.T06_12, 
    evening: todayForecast.chanceOfRain.T12_18,
    night: todayForecast.chanceOfRain.T18_24
  };
};

/**
 * 今日傘が必要かどうかを判定する
 * @returns 降水確率が閾値以上の場合はtrue、それ以外の場合はfalse
 */
export const isUmbrellaNeeded = async (maxChance: number): Promise<boolean> => {
  try {
    return maxChance >= RAIN_PROBABILITY_THRESHOLD;
  } catch (error) {
    console.error('傘の必要性の判定に失敗しました:', error);
    throw new Error('傘の必要性の判定に失敗しました');
  }
};

/**
 * 最大降水確率を計算する
 * @param rainChances 時間帯ごとの降水確率
 * @returns 最大降水確率
 */
const calculateMaxRainChance = (rainChances: TimeSlotRainChance): number => {
  const chances = convertRainChancesToNumbers(rainChances)
    .map(chance => isNaN(chance) ? 0 : chance);
  return Math.max(...chances);
};

/**
 * 傘が必要かどうかのメッセージを生成する
 * @returns 傘の必要性に関するメッセージ
 */
export const getUmbrellaMessage = async (): Promise<string> => {
  try {
    const rainChances = await getTodayRainChance();
    const maxChance = calculateMaxRainChance(rainChances);
    const isNeeded = await isUmbrellaNeeded(maxChance);

    if (isNeeded) {
      return `☔️ 傘を持って行った方が良さそう！\n- 本日の最高降水確率: ${maxChance}%`;
    } else {
      return `✅ 傘を持って行かなくて良さそう！\n- 本日の最高降水確率: ${maxChance}%`;
    }
  } catch (error) {
    console.error('メッセージの生成に失敗しました:', error);
    throw new Error('メッセージの生成に失敗しました');
  }
};
