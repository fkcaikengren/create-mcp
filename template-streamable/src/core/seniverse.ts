import * as crypto from 'node:crypto';
import * as querystring from 'node:querystring';

/**
 * 查询天气接口
 */

const API_URL = 'https://api.seniverse.com/v3/';

export interface WeatherNowResponse {
  results: Array<{
    location: {
      id: string;
      name: string;
      country: string;
      path: string;
      timezone: string;
      timezone_offset: string;
    };
    now: {
      text: string;
      code: string;
      temperature: string;
    };
    last_update: string;
  }>;
}

export class SeniverseApi {
  private publicKey: string;
  private secretKey: string;

  constructor(publicKey: string, secretKey: string) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }


  async getWeatherNow(location: string): Promise<WeatherNowResponse | null> {
    const params: Record<string, any> = {
      ts: Math.floor(Date.now() / 1000), // Current timestamp (seconds)
      ttl: 300, // Expiration time
      public_key: this.publicKey,
      location: location
    };

    // Step 2: Sort keys and construct the string for signature
    // "key=value" joined by "&", sorted by key
    const sortedKeys = Object.keys(params).sort();
    const str = sortedKeys.map(key => `${key}=${params[key]}`).join('&');

    // Step 3: HMAC-SHA1 signature
    const signature = crypto
      .createHmac('sha1', this.secretKey)
      .update(str)
      .digest('base64');
    
    // Step 4 & 5: Add sig to params and encode for URL
    // querystring.encode will handle URL encoding of the signature and other params
    params.sig = signature;
    
    const queryString = querystring.encode(params);
    const url = `${API_URL}weather/now.json?${queryString}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json() as WeatherNowResponse;
    } catch (error) {
        console.error("Error making Seniverse request:", error);
        return null;
    }
  }
}
