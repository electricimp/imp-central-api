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

const ParamsChecker = require('./ParamsChecker');
const HttpHelper = require('./HttpHelper');

// Helper parent class for all types of entities the library deals with: 
// Products, DeviceGroups, Devices and Deployments.
class Entities {

    // Retrieves a list of the Entities associated with the logged-in account.
    //
    // Parameters:
    //     filters    : Object  Optional Key/Value filters that will be applied to the result list
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Entity list is successfully
    //                          obtained, or rejects with an error
    list(filters = null, pageNumber = null, pageSize = null) {
        let error = ParamsChecker.validateFilters(filters, this._validFilters);
        if (error) {
            return Promise.reject(error);
        }
        error = ParamsChecker.validatePagination(pageNumber, pageSize);
        if (error) {
            return Promise.reject(error);
        }

        const query = {};
        Object.assign(query, filters);
        // add pagination to query
        Object.assign(query, HttpHelper.getPaginationQuery(pageNumber, pageSize));
        return HttpHelper.get(this._getPath(), query);
    }

    // Creates a new Entity.
    //
    // Parameters:
    //     attributes : Object  Key/Value attributes of the Entity to be created. 
    //     body       : Object  Request body
    //
    // Returns:                 Promise that resolves when the Entity is successfully created, 
    //                          or rejects with an error
    create(attributes, body) {
        const error = ParamsChecker.validateAttrs(attributes, this._validCreateAttributes, true);
        if (error) {
            return Promise.reject(error);
        }

        return HttpHelper.post(this._getPath(), body);
    }

    // Retrieves a specific Entity.
    //
    // Parameters:
    //     id : String          ID of the Entity to be retrieved
    //
    // Returns:                 Promise that resolves when the Entity is successfully obtained, 
    //                          or rejects with an error
    get(id) {
        const error = ParamsChecker.validateNonEmpty(id);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.get(this._getPath(id));
    }

    // Updates a specific Entity.
    //
    // Parameters:
    //     id         : String  ID of the Entity to be updated
    //     attributes : Object  Key/Value attributes of the Entity that will be updated. 
    //     body       : Object  Request body
    //
    // Returns:                 Promise that resolves when the Entity is successfully updated, 
    //                          or rejects with an error
    update(id, attributes, body) {
        let error = ParamsChecker.validateNonEmpty(id);
        if (error) {
            return Promise.reject(error);
        }
        error = ParamsChecker.validateAttrs(attributes, this._validUpdateAttributes);
        if (error) {
            return Promise.reject(error);
        }

        return HttpHelper.patch(this._getPath(id), body);
    }

    // Deletes a specific Entity.
    //
    // Parameters:
    //     id : String          ID of the Entity to be deleted
    //
    // Returns:                 Promise that resolves when the Entity is successfully deleted, 
    //                          or rejects with an error
    delete(id) {
        const error = ParamsChecker.validateNonEmpty(id);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.delete(this._getPath(id));
    }
}

module.exports = Entities;
