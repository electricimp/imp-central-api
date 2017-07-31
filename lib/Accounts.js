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

// This class provides access to Accounts impCentral API methods.
class Accounts {

    // Retrieves account information.
    //
    // Parameters:
    //     accountId : String   ID of the Account to be retrieved, can be literal string 'me'
    //                          in which case the users' own information will be returned.
    //
    // Returns:                 Promise that resolves when the Account information is successfully 
    //                          obtained, or rejects with an error
    get(accountId) {
        return HttpHelper.get(this._getPath(accountId));
    }

    _getPath(accountId = null) {
        if (accountId) {
            return '/accounts/' + accountId;
        }
        return '/accounts';
    }

    // Returns Account resource type
    static get _TYPE() {
        return 'account';
    }
}

module.exports = Accounts;
