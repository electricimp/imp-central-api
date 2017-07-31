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
const Entities = require('./util/Entities');

// This class provides access to Products impCentral API methods.
class Products extends Entities {

    constructor() {
        super();
        this._validFilters = { [Products.FILTER_OWNER_ID] : false };
        this._validCreateAttributes = {
            name : true,
            description : false
        };
        this._validUpdateAttributes = this._validCreateAttributes;
    }

    // Retrieves a list of the Products associated with the logged-in account.
    //
    // Parameters:
    //     filters    : Object  Optional Key/Value filters that will be applied to the result list
    //                          The valid keys are:
    //                              'filter[owner.id]' - filter by Product owner ID
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Products list is successfully
    //                          obtained, or rejects with an error
    list(filters = null, pageNumber = null, pageSize = null) {
        return super.list(filters, pageNumber, pageSize);
    }

    // Possible filter keys for the list() filters:
    
    static get FILTER_OWNER_ID() {
        return 'filter[owner.id]';
    }

    // Creates a Product.
    //
    // Parameters:
    //     attributes : Object  Key/Value attributes of the Product to be created. 
    //                          The valid keys are:
    //                              'name' (required) - the product's name, this must be unique 
    //                                  for all Products owned by a particular Account
    //                              'description' (optional) - an optional free-form description 
    //                                  of the product
    //     ownerId    : String  Account ID of the product owner. If no ownerId is provided,
    //                          the product is assigned to the logged-in account
    //
    // Returns:                 Promise that resolves when the Product is successfully created, 
    //                          or rejects with an error
    create(attributes, ownerId = null) {
        const body = {
            data : {
                type : Products._TYPE,
                attributes : attributes
            }
        };
        if (ownerId) {
            body.data.relationships = {
                owner : {
                    type : Accounts._TYPE,
                    id : ownerId
                }
            };
        }
        return super.create(attributes, body);
    }

    // Retrieves a specific Product.
    //
    // Parameters:
    //     productId : String   ID of the Product to be retrieved
    //
    // Returns:                 Promise that resolves when the Product is successfully obtained, 
    //                          or rejects with an error
    get(productId) {
        return super.get(productId);
    }

    // Updates a specific Product.
    //
    // Parameters:
    //     productId  : String  ID of the Product to be updated
    //     attributes : Object  Key/Value attributes of the Product that will be updated. 
    //                          The valid keys are:
    //                          'name' - the product's name, this must be unique 
    //                              for all Products owned by a particular Account
    //                          'description' - an optional free-form description 
    //                              of the product
    //
    // Returns:                 Promise that resolves when the Product is successfully updated, 
    //                          or rejects with an error
    update(productId, attributes) {
        const body = {
            data : {
                type : Products._TYPE,
                id : productId,
                attributes : attributes
            }
        };
        return super.update(productId, attributes, body);
    }

    // Deletes a specific Product.
    //
    // Parameters:
    //     productId : String   ID of the Product to be deleted
    //
    // Returns:                 Promise that resolves when the Product is successfully deleted, 
    //                          or rejects with an error
    delete(productId) {
        return super.delete(productId);
    }

    _getPath(productId = null) {
        if (productId) {
            return '/products/' + productId;
        }
        return '/products';
    }

    // Returns Product resource type
    static get _TYPE() {
        return 'product';
    }
}

module.exports = Products;
