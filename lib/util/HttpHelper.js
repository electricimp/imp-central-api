// MIT License
//
// Copyright 2017 Electric Imp
//
// SPDX-License-Identifier: MIT
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
// EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
// OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

'use strict';

const Request = require('request');
const Logger = require('./Logger');
const Errors = require('./../Errors');

const PAGE_SIZE_DEFAULT = 20;
const PAGE_NUMBER_DEFAULT = 1;
const API_ENDPOINT_DEFAULT = 'https://api.electricimp.com/v5';

// Helper class for HTTP requests/responses processing
class HttpHelper {
    static set apiEndpoint(apiEndpoint) {
        if (apiEndpoint) {
            HttpHelper._apiEndpoint = apiEndpoint;
        }
    }

    static get apiEndpoint() {
        return HttpHelper._apiEndpoint || API_ENDPOINT_DEFAULT;
    }

    static set accessToken(accessToken) {
        if (accessToken) {
            HttpHelper._accessToken = accessToken;
        }
    }

    static getPaginationQuery(pageNumber, pageSize) {
        if (pageNumber || pageSize) {
            return {
                'page[number]' : pageNumber || PAGE_NUMBER_DEFAULT,
                'page[size]' : pageSize || PAGE_SIZE_DEFAULT
            };
        }
        return null;
    }

    static request(method, path, query = null, body = null, additionalHeaders = null) {
        if (!HttpHelper._accessToken) {
            return Promise.reject(new Errors.InvalidDataError('Library initialization failed: access_token is not set'));
        }
        const headers = {
            'Content-type' : 'application/vnd.api+json',
            'Authorization' : 'Bearer ' + HttpHelper._accessToken
        };
        if (additionalHeaders) {
            Object.assign(headers, additionalHeaders);
        }
        return HttpHelper._request(method, path, headers, query, body);
    }

    static auth(path, body) {
        const headers = {
            'Content-type' : 'application/json'
        };
        return HttpHelper._request('POST', path, headers, null, body, true);
    }

    static get(path, query = null) {
        return HttpHelper.request('GET', path, query);
    }

    static post(path, body = null, additionalHeaders = null) {
        return HttpHelper.request('POST', path, null, body, additionalHeaders);
    }

    static patch(path, body, additionalHeaders = null) {
        return HttpHelper.request('PATCH', path, null, body, additionalHeaders);
    }

    static put(path, body = null) {
        return HttpHelper.request('PUT', path, null, body);
    }

    static delete(path, body = null, additionalHeaders = null) {
        return HttpHelper.request('DELETE', path, null, body, additionalHeaders);
    }

    static _getError(error, response, body) {
        if (error) {
            // error is produced by request library
            return new Errors.InvalidDataError('Request error: ' + error);
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
            if (body && body.errors && body.errors.length > 0) {
                const error = body.errors[0];
                if (error.title && error.detail) {
                    return new Errors.ImpCentralApiError(error.title + ': ' + error.detail, response.statusCode, body);
                }
            }
            return new Errors.ImpCentralApiError('impCentral API error HTTP/' + response.statusCode, response.statusCode, body);
        }
        // no error
        return null;
    }

    static _request(method, path, headers, query = null, body = null, isAuth = false) {
        return new Promise((resolve, reject) => {
            method = method.toUpperCase();

            const options = {
                url : HttpHelper.apiEndpoint + path,
                method : method,
                headers : headers,
                json : true,
                qs : query,
                body : body,
                qsStringifyOptions : { arrayFormat: 'repeat' }
            };

            if (Logger.debug) {
                const debugOptions = JSON.parse(JSON.stringify(options));
                // hide authorization header
                if ('Authorization' in debugOptions.headers) {
                    debugOptions.headers.Authorization = '[hidden]';
                }
                Logger.logDebug('Doing the request with options:');
                Logger.logDebug(JSON.stringify(debugOptions, null, 2));
            }

            // do request to impCentral api
            Request(options, (error, response, body) => {
                if (Logger.debug && response) {
                    Logger.logDebug('');
                    Logger.logDebug('Response code:', response.statusCode);
                    Logger.logDebug('Response headers:', JSON.stringify(response.headers, null, 2));
                    Logger.logDebug('Response body:', JSON.stringify(response.body, null, 2));
                }

                const err = HttpHelper._getError(error, response, body);
                if (err) {
                    reject(err);
                }
                else {
                    if (isAuth && ('access_token' in body)) {
                        HttpHelper.accessToken = body.access_token;
                    }
                    resolve(body);
                }
            });
        });
    }
}

module.exports = HttpHelper;
