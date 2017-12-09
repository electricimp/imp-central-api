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

const Entities = require('./util/Entities');
const ParamsChecker = require('./util/ParamsChecker');
const HttpHelper = require('./util/HttpHelper');

// This class provides access to Accounts impCentral API methods.
class Accounts extends Entities {
    constructor() {
        super();
        this._loginKeys = new LoginKeys();
    }

    // Retrieves account information.
    //
    // Parameters:
    //     accountId : String   ID of the Account to be retrieved, can be literal string 'me'
    //                          in which case the users' own information will be returned.
    //
    // Returns:                 Promise that resolves when the Account information is successfully 
    //                          obtained, or rejects with an error
    get(accountId) {
        return super.get(accountId);
    }

    // Retrieves a list of Accounts associated with the logged-in account.
    //
    // Parameters:
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Products list is successfully
    //                          obtained, or rejects with an error
    list(pageNumber = null, pageSize = null) {
        return super.list(null, pageNumber, pageSize);
    }

    // Retrieves a list of the Login Keys associated with the logged-in account.
    //
    // Parameters:
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Login Keys list is successfully
    //                          obtained, or rejects with an error
    listLoginKeys(pageNumber = null, pageSize = null) {
        return this._loginKeys.list(null, pageNumber, pageSize);
    }

    // Creates a Login Key.
    //
    // Parameters:
    //     password : String    the account password
    //     attributes : Object  Key/Value attributes of the Login Key to be created.
    //                          The valid keys are:
    //                              'description' (optional) - an optional free-form description
    //                                  of the Login Key
    //
    // Returns:                 Promise that resolves when the Login Key is successfully created, 
    //                          or rejects with an error
    createLoginKey(password, attributes = null) {
        const attrs = {
            password : password
        };
        Object.assign(attrs, attributes);
        return this._loginKeys.create(attrs);
    }

    // Retrieves a specific Login Key.
    //
    // Parameters:
    //     loginKeyId : String  ID of the Login Key to be retrieved
    //
    // Returns:                 Promise that resolves when the Login Key is successfully obtained, 
    //                          or rejects with an error
    getLoginKey(loginKeyId) {
        return this._loginKeys.get(loginKeyId);
    }

    // Updates a specific Login Key.
    //
    // Parameters:
    //     loginKeyId : String  ID of the Login Key to be updated
    //     password : String    the account password
    //     attributes : Object  Key/Value attributes of the Login Key that will be updated. 
    //                          The valid keys are:
    //                          'description' - an optional free-form description 
    //                              of the Login Key
    //
    // Returns:                 Promise that resolves when the Login Key is successfully updated, 
    //                          or rejects with an error
    updateLoginKey(loginKeyId, password, attributes) {
        const attrs = {
            password : password
        };
        Object.assign(attrs, attributes);
        return this._loginKeys.update(loginKeyId, attrs);
    }

    // Deletes a specific Login Key.
    //
    // Parameters:
    //     loginKeyId : String  ID of the Login Key to be updated
    //     password : String    the account password
    //
    // Returns:                 Promise that resolves when the Login Key is successfully deleted, 
    //                          or rejects with an error
    deleteLoginKey(loginKeyId, password) {
        const attrs = {
            password : password
        };
        return this._loginKeys.delete(loginKeyId, attrs);
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

class LoginKeys extends Entities {
    constructor() {
        super();
        this._validCreateAttributes = {
            description : false
        };
        this._validUpdateAttributes = {
            description : false
        };
    }

    // Creates a Login Key.
    //
    // Parameters:
    //     attributes : Object  Key/Value attributes of the Login Key to be created.
    //                          The valid keys are:
    //                              'description' (optional) - an optional free-form description
    //                                  of the Login Key
    //                              'password' - the account password
    //
    // Returns:                 Promise that resolves when the Login Key is successfully created, 
    //                          or rejects with an error
    create(attributes) {
        const password = attributes.password;
        delete attributes.password;
        const error = ParamsChecker.validateNonEmpty(password, 'password');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            data : {
                type : LoginKeys._TYPE,
                attributes : attributes
            }
        };
        return super.create(attributes, body, this._getAdditionalHeaders(password));
    }

    // Retrieves a specific Login Key.
    //
    // Parameters:
    //     loginKeyId : String  ID of the Login Key to be retrieved
    //
    // Returns:                 Promise that resolves when the Login Key is successfully obtained, 
    //                          or rejects with an error
    get(loginKeyId) {
        return super.get(loginKeyId);
    }

    // Updates a specific Login Key.
    //
    // Parameters:
    //     loginKeyId : String  ID of the Login Key to be updated
    //     attributes : Object  Key/Value attributes of the Login Key that will be updated. 
    //                          The valid keys are:
    //                          'description' - an optional free-form description 
    //                              of the Login Key
    //                          'password' - the account password
    //
    // Returns:                 Promise that resolves when the Login Key is successfully updated, 
    //                          or rejects with an error
    update(loginKeyId, attributes) {
        const password = attributes.password;
        delete attributes.password;
        const error = ParamsChecker.validateNonEmpty(password, 'password');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            data : {
                type : LoginKeys._TYPE,
                id : loginKeyId,
                attributes : attributes
            }
        };
        return super.update(loginKeyId, attributes, body, this._getAdditionalHeaders(password));
    }

    // Deletes a specific Login Key.
    //
    // Parameters:
    //     loginKeyId : String  ID of the Login Key to be updated
    //     attributes : Object  Key/Value attributes for the Login Key deleting.
    //                          The valid keys are:
    //                              'password' - the account password
    //
    // Returns:                 Promise that resolves when the Login Key is successfully deleted, 
    //                          or rejects with an error
    delete(loginKeyId, attributes) {
        const password = attributes.password;
        const error = ParamsChecker.validateNonEmpty(password, 'password');
        if (error) {
            return Promise.reject(error);
        }
        return super.delete(loginKeyId, this._getAdditionalHeaders(password));
    }

    _getAdditionalHeaders(password) {
        return {
            'X-Electricimp-Password' : password
        };
    }

    _getPath(loginKeyId = null) {
        let path = '/accounts/me/login_keys';
        if (loginKeyId) {
            return path + '/' + loginKeyId;
        }
        return path;
    }

    // Returns Login Key resource type
    static get _TYPE() {
        return 'login_key';
    }
}

module.exports = Accounts;
