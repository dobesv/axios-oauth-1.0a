
To sign your axios requests using OAuth 1.0a:

```js
import addOAuthInterceptor from 'axios-oauth-1.0a';

// Create a client whose requests will be signed
const client = axios.create();

// Add interceptor that signs requests
// HMAC-SHA1 and HMAC-SHA256 are supported
const oauthKey = 'xxx';
const oauthSecret = 'yyy';
const oauthMethod = 'HMAC-SHA1'
addOAuthInterceptor(client, oauthKey, oauthSecret, oauthMethod);
```

