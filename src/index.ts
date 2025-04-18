import { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import crypto from "crypto";
import { rfc3986, sign } from "oauth-sign";

const isAbsoluteURL = (url: string): boolean =>
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);

const combineURLs = (baseURL: string, relativeURL: string): string =>
  relativeURL
    ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
    : baseURL;

const generateNonce = (size: number = 16): string =>
  crypto.randomBytes(0 | (size * 0.75)).toString("base64");

const calculateBodyHash = (
  signatureMethod: OAuthInterceptorConfig["algorithm"],
  data: any
): string => {
  const buf = Buffer.isBuffer(data)
    ? data
    : typeof data === "string"
    ? Buffer.from(data)
    : !data
    ? Buffer.from("")
    : Buffer.from(JSON.stringify(data));
  return crypto
    .createHash(signatureMethod === "HMAC-SHA1" ? "sha1" : "sha256")
    .update(buf)
    .digest("base64");
};

export interface OAuthInterceptorConfig {
  /**
   * Hashing function to use
   */
  algorithm: "HMAC-SHA1" | "HMAC-SHA256";

  /**
   * When true, always try to hash the body and include the hash in the signature
   * When false, never try to calculate oauth_body_hash
   * When 'auto', calculate oauth_body_hash on PUT or POST requests that have a body
   */
  includeBodyHash?: boolean | "auto";

  /**
   * Consumer key
   */
  key: string;

  /**
   * OAuth realm
   */
  realm?: string | undefined;

  /**
   * Consumer secret
   */
  secret: string;

  /**
   * OAuth token
   */
  token?: string | null;

  /**
   * OAuth token secret
   */
  tokenSecret?: string | null;

  /**
   * OAuth callback URL
   */
  callback?: string | null;

  /**
   * OAuth verifier
   */
   verifier?: string | null;
}

const addOAuthInterceptor = (
  client: AxiosInstance,
  {
    algorithm = "HMAC-SHA256",
    includeBodyHash = "auto",
    key,
    realm,
    secret,
    token = null,
    tokenSecret = null,
    callback = null,
    verifier = null,
  }: OAuthInterceptorConfig
) => {
  return client.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const method = (config.method || "GET").toUpperCase();
    const oauthParams: { [k: string]: string } = {
      oauth_consumer_key: key,
      oauth_nonce: generateNonce(),
      oauth_signature_method: algorithm,
      oauth_timestamp: String(Math.floor(Date.now() * 0.001)),
      oauth_version: "1.0",
    };

    // if provided, oauth_token can be included in the oauth parameters
    // more information: https://datatracker.ietf.org/doc/html/rfc5849#section-3.1
    if (token) {
      oauthParams.oauth_token = token;
    }

    if (callback) {
      oauthParams.oauth_callback = callback;
    }

    if (verifier) {
      oauthParams.oauth_verifier = verifier;
    }

    const oauthUrl = new URL(
      !config.baseURL || isAbsoluteURL(config.url)
        ? config.url
        : combineURLs(config.baseURL, config.url)
    );

    const paramsToSign: Record<string, string | string[]> = {};

    // Add one key/value pair to paramsToSign
    const addParamToSign = (key: string, value: string) => {
      const existingValue = paramsToSign[key];
      if (typeof existingValue === "string") {
        paramsToSign[key] = [existingValue, value];
      } else if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        paramsToSign[key] = value;
      }
    };

    // Add multiple key/value pairs to paramsToSign
    const addParamsToSign = (
      m: URLSearchParams | Record<string, string> | string
    ) => {
      new URLSearchParams(m).forEach((value, key) =>
        addParamToSign(key, value)
      );
    };

    addParamsToSign(oauthParams);
    if (config.params) {
      addParamsToSign(config.params);
    }

    // Query parameters are hashed as part of params rather than as part of the URL
    if (oauthUrl.search) {
      addParamsToSign(oauthUrl.searchParams);
      oauthUrl.search = "";
    }

    // Do not include hash in signature
    oauthUrl.hash = "";

    // Remove port if it is the default for that protocol
    if (
      (oauthUrl.protocol === "https:" && oauthUrl.port === "443") ||
      (oauthUrl.protocol === "http:" && oauthUrl.port === "80")
    ) {
      oauthUrl.port = "";
    }

    // If they are submitting a form, then include form parameters in the
    // signature as parameters rather than the body hash
    if (
      config.headers["content-type"] === "application/x-www-form-urlencoded"
    ) {
      addParamsToSign(config.data);
    } else if (
      includeBodyHash === true ||
      (config.data &&
        includeBodyHash === "auto" &&
        ["POST", "PUT"].includes(method))
    ) {
      const bodyHash = calculateBodyHash(algorithm, config.data);
      oauthParams.oauth_body_hash = bodyHash;
      addParamToSign("oauth_body_hash", bodyHash);
    }

    oauthParams.oauth_signature = sign(
      algorithm,
      method,
      oauthUrl.toString(),
      paramsToSign,
      secret,
      tokenSecret
    );

    // realm should not be included in the signature calculation
    // but is optional in the OAuth 1.0 Authorization header
    // so we need to add it after signing the request
    // more information: https://datatracker.ietf.org/doc/html/rfc5849#section-3.4.1.3.1
    if (realm) {
      oauthParams.realm = realm;
    }

    const authorization = [
      "OAuth",
      Object.entries(oauthParams)
        .map((e) => [e[0], '="', rfc3986(e[1]), '"'].join(""))
        .join(","),
    ].join(" ");

    config.headers.set('authorization', authorization);
    return config;
  });
};

export default addOAuthInterceptor;
