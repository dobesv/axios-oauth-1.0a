import { AxiosInstance, AxiosRequestConfig } from "axios";
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

const isAbsoluteURL = (url: string): boolean =>
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);

const combineURLs = (baseURL: string, relativeURL: string): string => relativeURL
  ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
  : baseURL;

const addOAuthInterceptor = (client: AxiosInstance, oauthKey: string, oauthSecret: string, signatureMethod: 'HMAC-SHA1' | 'HMAC-SHA256', token: string | null) => {
  const signer = new OAuth({
    consumer: {
      key: oauthKey,
      secret: oauthSecret,
    },
    signature_method: 'HMAC-SHA1',
    hash_function(s: string, key: string) {
      return crypto.createHmac('sha1', key).update(s).digest('base64');
    },
  });

  client.interceptors.request.use((config: AxiosRequestConfig) => ({
    ...config,
    headers: {
      ...config.headers,
      ...signer.toHeader(
        signer.authorize({
          data: config.params,
          method: config.method!,
          url: !config.baseURL || isAbsoluteURL(config.url) ? config.url : combineURLs(config.baseURL, config.url),
        }),
      )
    }
  }));
}

export default addOAuthInterceptor;
