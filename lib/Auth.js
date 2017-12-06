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

const HttpHelper = require('./util/HttpHelper');
const ParamsChecker = require('./util/ParamsChecker');

// This class provides access to Authentication impCentral API methods.
//
// Access to almost every endpoint in the impCentral API requires authorization.
// Authorization is presented via an access_token in the HTTP Authorization header.
//
// There are four separate ways to initialize the library by an access token to allow further access to impCentral API.
// a) if you already have a non-expired access token (e.g. saved after the previous usage of the library):
//    use set accessToken() property setter;
// b) if an access token is expired but you have a refresh token (e.g. saved after the previous usage of the library
//    or received after login methods): use refreshAccessToken() method;
// c) if you have a login key: use getAccessToken() with login key;
// d) alternatively, use login() method with identifier/password pair and, additionally,
//    if Two-Factor authentication is enabled for your account, loginWithOtp() method with one-time password.
//    Login methods allow to obtain the both - an access token and a refresh token.
//
// Remember, when access token is expired any call of Imp Central API returns 401 error. You need to re-initialize
// the library by a new access token using one of the above ways.
//
class Auth {

    // Sets an access token for further access to Imp Central API.
    // 
    // Parameters:
    //     token    : String    an access token
    set accessToken(token) {
        HttpHelper.accessToken = token;
    }

    // Retrieves a new access token from a refresh token.
    //
    // The obtained access token to be automatically used by the library for further access to Imp Central API.
    // Also, the access token is returned to the caller in the HTTP response body.
    //
    // Parameters:
    //     refreshToken : String    a refresh token
    //
    // Returns:                     Promise that resolves if operation succeeds, or rejects 
    //                              with an error
    refreshAccessToken(refreshToken) {
        const error = ParamsChecker.validateNonEmpty(refreshToken, 'refreshToken');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            token : refreshToken
        };
        return HttpHelper.auth('/auth/token', body);
    }

    // Retrieves a new access token from a login key.
    //
    // The obtained access token to be automatically used by the library for further access to Imp Central API.
    // Also, the access token is returned to the caller in the HTTP response body.
    //
    // Parameters:
    //     loginKey : String    a login_key
    //
    // Returns:                 Promise that resolves if operation succeeds, or rejects 
    //                          with an error
    getAccessToken(loginKey) {
        const error = ParamsChecker.validateNonEmpty(loginKey, 'loginKey');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            key : loginKey
        };
        return HttpHelper.auth('/auth/token', body);
    }

    // Authenticate a user via an identifier/password pair.
    //
    // If the authentication is successfully completed, the obtained access token to be automatically used
    // by the library for further access to Imp Central API.
    // Also, the access token and the obtained refresh token are returned to the caller in the HTTP response body.
    //
    // If Two-Factor authentication is enabled for the user, loginWithOtp() method needs to be
    // additionally called to complete the authentication.
    //
    // Parameters:
    //     id       : String    the account identifier, this could be an email address or a username
    //     password : String    the account password.
    //
    // Returns:                 Promise that resolves if the operation succeeds, or rejects 
    //                          with an error
    login(id, password) {
        let error = ParamsChecker.validateNonEmpty(id);
        if (error) {
            return Promise.reject(error);
        }
        error = ParamsChecker.validateNonEmpty(password, 'password');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            id : id,
            password : password
        };
        return HttpHelper.auth('/auth', body);
    }

    // Authenticate a user via an one-time password (second phase of Two-Factor authentication).
    // See Two-Factor Auth of Electric Imp impCentral API (v5).
    //
    // If the authentication is successfully completed, the obtained access token to be automatically used
    // by the library for further access to Imp Central API.
    // Also, the access token and the obtained refresh token are returned to the caller in the HTTP response body.
    //
    // Parameters:
    //     otp        : String  one-time password
    //     loginToken : String  short-lived token obtained using login(id, password) method call
    //
    // Returns:                 Promise that resolves if the operation succeeds, or rejects 
    //                          with an error
    loginWithOTP(otp, loginToken) {
        let error = ParamsChecker.validateNonEmpty(otp, 'otp');
        if (error) {
            return Promise.reject(error);
        }
        error = ParamsChecker.validateNonEmpty(loginToken, 'loginToken');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            login_token : loginToken,
            password : otp
        };
        return HttpHelper.auth('/auth', body);
    }

    // Retrieves a set of currently active Refresh Tokens for logged-in account.
    // 
    // Returns:                     Promise that resolves if the operation succeeds, or rejects 
    //                              with an error
    getRefreshTokens() {
        return HttpHelper.get('/accounts/me/refresh_tokens');
    }

    // Deletes a refresh token.
    // Deleting a Refresh Token makes it unusable in the future, it does not invalidate existing
    // access tokens.
    //
    // Parameters:
    //     refreshTokenId : String  The refresh token ID
    //
    // Returns:                     Promise that resolves if operation succeeds, or rejects 
    //                              with an error
    deleteRefreshToken(refreshTokenId) {
        const error = ParamsChecker.validateNonEmpty(refreshTokenId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.delete('/accounts/me/refresh_tokens/' + refreshTokenId);
    }
}

module.exports = Auth;
