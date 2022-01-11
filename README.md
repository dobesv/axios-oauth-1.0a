# axios-oauth-1.0a

Easily add OAuth 1.0a signing to your axios client

## Getting Started

    npm i axios-oauth-1.0a

or

    yarn add axios-oauth-1.0a

For use in the browser, you'll need to configure buffer and crypto support polyfills and fallback modules.  See 
[resolve.fallback](https://webpack.js.org/configuration/resolve/#resolvefallback) and 
[How To Polyfill Buffer With WebPack v5](https://viglucci.io/how-to-polyfill-buffer-with-webpack-5) for more information.

## OAuth Options

### algorithm

* The hashing function to use for the `oauth_signature` value
* Available values are: `HMAC-SHA1`, `HMAC-SHA256`
* Default value is `HMAC-SHA256`

### includeBodyHash

* When `true`, always try to hash the body and include the hash in the signature
* When `false`, never try to calculate `oauth_body_hash`
* When `'auto'`, calculate `oauth_body_hash` on `PUT` or `POST` requests that have a body

### key

* The Consumer Key value

### realm

* An optional value to set the OAuth 1.0 realm

### secret

* The Consumer Secret value

### token

* The Access Token value

### tokenSecret

* An optional value to specify the access token secret

### callback

* An optional value to set the callback url

### verifier

* An optional value to set the oauth verifier

## Example

To sign your axios requests using OAuth 1.0a:

```js
import addOAuthInterceptor from 'axios-oauth-1.0a';

// Create a client whose requests will be signed
const client = axios.create();

// Specify the OAuth options
const options = {
    algorithm: 'HMAC-SHA1',
    key: 'xxx',
    secret: 'yyy',
};

// Add interceptor that signs requests
addOAuthInterceptor(client, options);
```

## Documentation

* [RFC5849 - The OAuth 1.0 Protocol](https://datatracker.ietf.org/doc/html/rfc5849)
* [Axios Interceptors](https://axios-http.com/docs/interceptors)

## ChangeLog

See [github releases](https://github.com/dobesv/axios-oauth-1.0a/releases)
