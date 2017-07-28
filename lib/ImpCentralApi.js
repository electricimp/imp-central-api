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

const Accounts = require('./Accounts');
const Auth = require('./Auth');
const DeviceGroups = require('./DeviceGroups');
const Devices = require('./Devices');
const Deployments = require('./Deployments');
const Products = require('./Products');
const LogStreams = require('./LogStreams');

const HttpHelper = require('./util/HttpHelper');
const Logger = require('./util/Logger');

// Client library for Electric Imp impCentral API (v5).
// Provides access to Accounts, Authentication, Products, Device Groups, Devices,
// Deployments, Logs interfaces of impCentral API.
//
// All requests to impCentral API are made asynchronously via Promises.
// Any method which sends a request returns Promise that resolves with HTTP response body 
// if operation succeeds, or rejects with an error if operation fails.
//
// The exact format of HTTP response body for every request can be found in 
// Electric Imp impCentral API (v5).
//
// The possible errors are defined in Errors module.
// They are: 
//   - InvalidDataError - the library detects an error, e.g. the library is wrongly initialized
//       (apiEndpoint has invalid scheme or accessToken is not provided)
//       or the library method is called with invalid argument(s).
//       The error details can be found in message property.
//   - ImpCentralApiError - HTTP request to impCentral API failed. 
//       The error details can be found in message, statusCode and body properties. 
//       The exact body format is described in Error Handling section of Electric Imp impCentral API (v5).

class ImpCentralApi {

    // Creates ImpCentralApi library instance.
    //
    // Parameters:
    //     apiEndpoint : String   impCentral API endpoint
    //                            If not specified, the default one is used.
    constructor(apiEndpoint = null) {
        HttpHelper.apiEndpoint = apiEndpoint;

        this._auth = new Auth();
        this._accounts = new Accounts();
        this._products = new Products();
        this._deviceGroups = new DeviceGroups();
        this._devices = new Devices();
        this._deployments = new Deployments();
        this._logStreams = new LogStreams();
    }

    // Provides access to Accounts impCentral API methods.
    get accounts() {
        return this._accounts;
    }

    // Provides access to Authentication impCentral API methods.
    get auth() {
        return this._auth;
    }

    // Provides access to Products impCentral API methods.
    get products() {
        return this._products;
    }

    // Provides access to Device Groups impCentral API methods.
    get deviceGroups() {
        return this._deviceGroups;
    }

    // Provides access to Devices impCentral API methods.
    get devices() {
        return this._devices;
    }

    // Provides access to Deployments impCentral API methods.
    get deployments() {
        return this._deployments;
    }

    // Provides access to LogStreams impCentral API methods.
    get logStreams() {
        return this._logStreams;
    }

    // Enables/disables the library debug output (including errors logging).
    // Disabled by default (after the library instantiation).
    //
    // Parameters:
    //     value : Boolean    true to enable, false to disable
    set debug(value) {
        Logger.debug = value;
    }

    // Returns impCentral API endpoint used by the library.
    get apiEndpoint() {
        return HttpHelper.apiEndpoint;
    }
}

module.exports = ImpCentralApi;
