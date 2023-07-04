"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
var index_1 = __importDefault(require("./index"));
var auth_header_1 = require("auth-header");
var oauth_sign_1 = require("oauth-sign");
var testRequest = function (oauthSignatureMethod, oauthConsumerKey, oauthConsumerSecret, token, tokenSecret, callback, verifier, method, url, data, params) {
    return __awaiter(this, void 0, void 0, function () {
        var client, mock, resp, _a, authorization, mimeType, authData, paramsToSign, addParamToSign, addParamsToSign, _i, _b, _c, k, v, parsedUrl, expectedSignature;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    client = axios_1["default"].create({
                        baseURL: "http://test"
                    });
                    (0, index_1["default"])(client, {
                        algorithm: oauthSignatureMethod,
                        key: oauthConsumerKey,
                        secret: oauthConsumerSecret,
                        token: token,
                        tokenSecret: tokenSecret,
                        callback: callback,
                        verifier: verifier
                    });
                    mock = new axios_mock_adapter_1["default"](client);
                    mock.onGet().reply(function (config) {
                        return [200, { headers: config.headers }];
                    });
                    mock.onPost().reply(function (config) {
                        return [200, { headers: config.headers }];
                    });
                    return [4 /*yield*/, client.request(__assign(__assign({ method: method, url: url }, (data && { data: data })), (params && { params: params })))];
                case 1:
                    resp = _d.sent();
                    _a = resp.data.headers, authorization = _a.authorization, mimeType = _a["content-type"];
                    authData = (0, auth_header_1.parse)(authorization);
                    paramsToSign = {};
                    addParamToSign = function (key, value) {
                        var existingValue = paramsToSign[key];
                        if (typeof existingValue === "string") {
                            paramsToSign[key] = Array.isArray(value)
                                ? __spreadArray([existingValue], value, true) : [existingValue, value];
                        }
                        else if (Array.isArray(existingValue)) {
                            if (Array.isArray(value)) {
                                existingValue.push.apply(existingValue, value);
                            }
                            else {
                                existingValue.push(value);
                            }
                        }
                        else {
                            paramsToSign[key] = value;
                        }
                    };
                    addParamsToSign = function (m) {
                        if (typeof m === "string" || m instanceof URLSearchParams) {
                            new URLSearchParams(m).forEach(function (value, key) {
                                return addParamToSign(key, value);
                            });
                        }
                        else {
                            for (var _i = 0, _a = Object.entries(m); _i < _a.length; _i++) {
                                var _b = _a[_i], k = _b[0], v = _b[1];
                                addParamToSign(k, v);
                            }
                        }
                    };
                    for (_i = 0, _b = Object.entries(authData.params); _i < _b.length; _i++) {
                        _c = _b[_i], k = _c[0], v = _c[1];
                        if (k !== "oauth_signature") {
                            addParamToSign(k, Array.isArray(v)
                                ? v.map(function (s) { return decodeURIComponent(s); })
                                : decodeURIComponent(v));
                        }
                    }
                    parsedUrl = new URL(url);
                    if (params) {
                        addParamsToSign(params);
                    }
                    if (parsedUrl.search) {
                        addParamsToSign(parsedUrl.searchParams);
                    }
                    if (mimeType === "application/x-www-form-urlencoded") {
                        addParamsToSign(new URLSearchParams(data));
                    }
                    expect(paramsToSign).toMatchObject(__assign(__assign(__assign({ oauth_consumer_key: oauthConsumerKey, oauth_nonce: expect.any(String), oauth_signature_method: oauthSignatureMethod, oauth_timestamp: expect.any(String), oauth_version: "1.0" }, (token && { oauth_token: token })), (callback && { oauth_callback: callback })), (verifier && { oauth_verifier: verifier })));
                    // Strip off search and hash for signature calculation
                    parsedUrl.search = "";
                    parsedUrl.hash = "";
                    expectedSignature = (0, oauth_sign_1.sign)(oauthSignatureMethod, method, parsedUrl.toString(), paramsToSign, oauthConsumerSecret, tokenSecret);
                    expect(decodeURIComponent(String(authData.params.oauth_signature))).toBe(expectedSignature);
                    return [2 /*return*/];
            }
        });
    });
};
describe("addOAuthInterceptor", function () {
    it("adds HMAC-SHA256 signature to simple GET with token", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA256", "k", "s", "t", "ts", null, null, "GET", "http://test/test", null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA1 signature to simple GET without token", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA1", "k", "s", null, null, null, null, "GET", "http://test/test", null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA256 signature to simple POST request with token", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA256", "k", "s", "t", "ts", null, null, "POST", "http://test/test", "test=hello")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA1 signature to simple POST request without token and using URLSearchParams for body", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA1", "k", "s", null, null, null, null, "POST", "http://test/test", new URLSearchParams({ test: "hello" }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA1 signature to simple POST request with query parameters", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA1", "k", "s", null, null, null, null, "POST", "http://test/test?test=1", null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA1 signature to simple POST request with query parameters in params as URLSearchParams", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA1", "k", "s", null, null, null, null, "POST", "http://test/test", null, new URLSearchParams([
                        ["r", "1"],
                        ["r", "2"],
                        ["q", "qq"],
                    ]))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA1 signature to simple POST request with callback URL", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA1", "k", "s", null, null, "http://test/callback", null, "POST", "http://test/test", null, null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA256 signature to simple POST request with callback URL", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA256", "k", "s", null, null, "http://test/callback", null, "POST", "http://test/test", null, null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA1 signature to simple POST request with verifier", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA1", "k", "s", null, null, null, "v", "POST", "http://test/test", null, null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("adds HMAC-SHA256 signature to simple POST request with verifier", function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testRequest("HMAC-SHA256", "k", "s", null, null, null, "v", "POST", "http://test/test", null, null)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
