import { AxiosInstance, AxiosRequestConfig } from "axios";
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
export interface OAuthInterceptorRequestConfig extends AxiosRequestConfig {
    oauth?: OAuthInterceptorConfig;
}
declare const addOAuthInterceptor: (client: AxiosInstance, { algorithm, includeBodyHash, key, realm, secret, token, tokenSecret, callback, verifier, }?: Partial<OAuthInterceptorConfig>) => number;
export default addOAuthInterceptor;
