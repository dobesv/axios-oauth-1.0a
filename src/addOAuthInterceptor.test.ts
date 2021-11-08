import axios, { AxiosResponse } from "axios";
import MockAdapter from "axios-mock-adapter";
import addOAuthInterceptor from "./index";
import { parse as parseAuthHeader } from "auth-header";
import { sign as signOAuth } from "oauth-sign";

const testRequest = async function (
  oauthSignatureMethod: "HMAC-SHA1" | "HMAC-SHA256",
  oauthConsumerKey: string,
  oauthConsumerSecret: string,
  token: string | null,
  tokenSecret: string | null,
  callback: string | null,
  verifier: string | null,
  method: "GET" | "POST",
  url: string,
  data?: string | URLSearchParams | null,
  params?: URLSearchParams | Record<string, string> | null
) {
  const client = axios.create({
    baseURL: "http://test",
  });
  addOAuthInterceptor(client, {
    algorithm: oauthSignatureMethod,
    key: oauthConsumerKey,
    secret: oauthConsumerSecret,
    token,
    tokenSecret,
    callback,
    verifier,
  });
  const mock = new MockAdapter(client);
  mock.onGet().reply(function (config) {
    return [200, { headers: config.headers }];
  });
  mock.onPost().reply(function (config) {
    return [200, { headers: config.headers }];
  });
  const resp = await client.request<
    string | URLSearchParams,
    AxiosResponse<{
      data?: string | null;
      headers: Record<string, string>;
    }>
  >({
    method,
    url,
    ...(data && { data }),
    ...(params && { params }),
  });
  const { authorization, ["content-type"]: mimeType } = resp.data.headers;
  const authData = parseAuthHeader(authorization);

  const paramsToSign: Record<string, string | string[]> = {};

  // Add one key/value pair to paramsToSign
  const addParamToSign = (key: string, value: string | string[]) => {
    const existingValue = paramsToSign[key];
    if (typeof existingValue === "string") {
      paramsToSign[key] = Array.isArray(value)
        ? [existingValue, ...value]
        : [existingValue, value];
    } else if (Array.isArray(existingValue)) {
      if (Array.isArray(value)) {
        existingValue.push(...value);
      } else {
        existingValue.push(value);
      }
    } else {
      paramsToSign[key] = value;
    }
  };

  // Add multiple key/value pairs to paramsToSign
  const addParamsToSign = (
    m: URLSearchParams | Record<string, string | string[]> | string
  ) => {
    if (typeof m === "string" || m instanceof URLSearchParams) {
      new URLSearchParams(m).forEach((value, key) =>
        addParamToSign(key, value)
      );
    } else {
      for (const [k, v] of Object.entries(m)) {
        addParamToSign(k, v);
      }
    }
  };

  for (const [k, v] of Object.entries(authData.params)) {
    if (k !== "oauth_signature") {
      addParamToSign(
        k,
        Array.isArray(v)
          ? v.map((s) => decodeURIComponent(s))
          : decodeURIComponent(v)
      );
    }
  }

  const parsedUrl = new URL(url);
  if (params) {
    addParamsToSign(params);
  }
  if (parsedUrl.search) {
    addParamsToSign(parsedUrl.searchParams);
  }
  if (mimeType === "application/x-www-form-urlencoded") {
    addParamsToSign(new URLSearchParams(data));
  }

  expect(paramsToSign).toMatchObject({
    oauth_consumer_key: oauthConsumerKey,
    oauth_nonce: expect.any(String),
    oauth_signature_method: oauthSignatureMethod,
    oauth_timestamp: expect.any(String),
    oauth_version: "1.0",
    ...(token && { oauth_token: token }),
    ...(callback && { oauth_callback: callback }),
    ...(verifier && { oauth_verifier: verifier }),
  });

  // Strip off search and hash for signature calculation
  parsedUrl.search = "";
  parsedUrl.hash = "";
  const expectedSignature = signOAuth(
    oauthSignatureMethod,
    method,
    parsedUrl.toString(),
    paramsToSign,
    oauthConsumerSecret,
    tokenSecret
  );
  expect(decodeURIComponent(String(authData.params.oauth_signature))).toBe(
    expectedSignature
  );
};
describe("addOAuthInterceptor", () => {
  it("adds HMAC-SHA256 signature to simple GET with token", async () => {
    await testRequest(
      "HMAC-SHA256",
      "k",
      "s",
      "t",
      "ts",
      null,
      null,
      "GET",
      "http://test/test",
      null
    );
  });
  it("adds HMAC-SHA1 signature to simple GET without token", async () => {
    await testRequest(
      "HMAC-SHA1",
      "k",
      "s",
      null,
      null,
      null,
      null,
      "GET",
      "http://test/test",
      null
    );
  });
  it("adds HMAC-SHA256 signature to simple POST request with token", async () => {
    await testRequest(
      "HMAC-SHA256",
      "k",
      "s",
      "t",
      "ts",
      null,
      null,
      "POST",
      "http://test/test",
      "test=hello"
    );
  });
  it("adds HMAC-SHA1 signature to simple POST request without token and using URLSearchParams for body", async () => {
    await testRequest(
      "HMAC-SHA1",
      "k",
      "s",
      null,
      null,
      null,
      null,
      "POST",
      "http://test/test",
      new URLSearchParams({ test: "hello" })
    );
  });
  it("adds HMAC-SHA1 signature to simple POST request with query parameters", async () => {
    await testRequest(
      "HMAC-SHA1",
      "k",
      "s",
      null,
      null,
      null,
      null,
      "POST",
      "http://test/test?test=1",
      null
    );
  });
  it("adds HMAC-SHA1 signature to simple POST request with query parameters in params as URLSearchParams", async () => {
    await testRequest(
      "HMAC-SHA1",
      "k",
      "s",
      null,
      null,
      null,
      null,
      "POST",
      "http://test/test",
      null,
      new URLSearchParams([
        ["r", "1"],
        ["r", "2"],
        ["q", "qq"],
      ])
    );
  });
  it("adds HMAC-SHA1 signature to simple POST request with callback URL", async () => {
    await testRequest(
      "HMAC-SHA1",
      "k",
      "s",
      null,
      null,
      "http://test/callback",
      null,
      "POST",
      "http://test/test",
      null,
      null
    );
  });
  it("adds HMAC-SHA256 signature to simple POST request with callback URL", async () => {
    await testRequest(
      "HMAC-SHA256",
      "k",
      "s",
      null,
      null,
      "http://test/callback",
      null,
      "POST",
      "http://test/test",
      null,
      null
    );
  });
  it("adds HMAC-SHA1 signature to simple POST request with verifier", async () => {
    await testRequest(
      "HMAC-SHA1",
      "k",
      "s",
      null,
      null,
      null,
      "v",
      "POST",
      "http://test/test",
      null,
      null
    );
  });
  it("adds HMAC-SHA256 signature to simple POST request with verifier", async () => {
    await testRequest(
      "HMAC-SHA256",
      "k",
      "s",
      null,
      null,
      null,
      "v",
      "POST",
      "http://test/test",
      null,
      null
    );
  });
});
