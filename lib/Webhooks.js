// MIT License
//
// Copyright 2017-2019 Electric Imp
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

const DeviceGroups = require('./DeviceGroups');
const Entities = require('./util/Entities');
const ParamsChecker = require('./util/ParamsChecker');

// This class provides access to Webhooks impCentral API methods.
class Webhooks extends Entities {

    constructor() {
        super();
        this._validFilters = { 
            [Webhooks.FILTER_DEVICE_GROUP_ID] : false
        };
        this._validCreateAttributes = {
            url : true,
            event : true,
            content_type : true
        };
        this._validUpdateAttributes = {
            url : false,
            content_type : false
        };
        this._validEvents = [
            Webhooks.EVENT_BLESSING, 
            Webhooks.EVENT_BLINKUP,
            Webhooks.EVENT_DEPLOYMENT
        ];
        this._validContentTypes = [
            Webhooks.CONTENT_TYPE_JSON,
            Webhooks.CONTENT_TYPE_WWW_FORM
        ];
    }

    // Webhooks event types
    static get EVENT_BLESSING() {
        return 'blessing';
    }

    static get EVENT_BLINKUP() {
        return 'blinkup';
    }

    static get EVENT_DEPLOYMENT() {
        return 'deployment';
    }

    // Webhooks content types
    static get CONTENT_TYPE_JSON() {
        return 'application/json';
    }

    static get CONTENT_TYPE_WWW_FORM() {
        return 'application/x-www-form-urlencoded';
    }

    // Retrieves a list of the Webhooks associated with the logged-in account.
    //
    // Parameters:
    //     filters    : Object  Optional Key/Value filters that will be applied to the result list
    //                          The valid keys are:
    //                              'filter[devicegroup.id]'       - filter by Device Group
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Webhooks list is successfully
    //                          obtained, or rejects with an error
    list(filters = null, pageNumber = null, pageSize = null) {
        return super.list(filters, pageNumber, pageSize);
    }

    // Possible filter keys for the list() filters:
    static get FILTER_DEVICE_GROUP_ID() {
        return 'filter[devicegroup.id]';
    }

    // Creates a Webhook.
    //
    // Parameters:
    //     deviceGroupId   : String  ID of the Device Group for which the Webhook is created.
    //     deviceGroupType : String  The Device Group's type. One of DeviceGroups.TYPE_DEVELOPMENT,
    //                               DeviceGroups.TYPE_PRE_PRODUCTION, DeviceGroups.TYPE_PRODUCTION,
    //                               DeviceGroups.TYPE_PRE_FACTORY_FIXTURE, DeviceGroups.TYPE_FACTORY_FIXTURE,
    //                               DeviceGroups.TYPE_PRE_DUT, DeviceGroups.TYPE_DUT.
    //     attributes      : Object  Key/Value attributes of the Webhook to be created.
    //                               The valid keys are:
    //                                 'url' (String, required) - the Webhook's target URL.
    //                                 'event' (String, required) - the event that triggers the webhook.
    //                                     One of Webhooks.EVENT_BLESSING, Webhooks.EVENT_BLINKUP,
    //                                     Webhooks.EVENT_DEPLOYMENT values.
    //                                 'content_type' (String, required) - format of the data sent by the webhook.
    //                                     One of Webhooks.CONTENT_TYPE_JSON, Webhooks.CONTENT_TYPE_WWW_FORM.
    //
    // Returns:                      Promise that resolves when the Webhook is successfully created, 
    //                               or rejects with an error
    create(deviceGroupId, deviceGroupType, attributes) {
        let error = ParamsChecker.validateNonEmpty(deviceGroupId) ||
            DeviceGroups.validateType(deviceGroupType, 'deviceGroupType') ||
            ParamsChecker.validateAttr(attributes, 'event', this._validEvents) ||
            ParamsChecker.validateAttr(attributes, 'content_type', this._validContentTypes);
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            data : {
                type : Webhooks._TYPE,
                attributes : attributes,
                relationships : {
                    [DeviceGroups._TYPE] : {
                        type : deviceGroupType,
                        id : deviceGroupId
                    }
                }
            }
        };
        return super.create(attributes, body);
    }

    // Retrieves a specific Webhook.
    //
    // Parameters:
    //     webhookId : String      ID of the Webhook to be retrieved
    //
    // Returns:                    Promise that resolves when the Webhook is successfully obtained, 
    //                             or rejects with an error
    get(webhookId) {
        return super.get(webhookId);
    }

    // Updates a specific Webhook.
    //
    // Parameters:
    //     webhookId     : String  ID of the Webhook to be updated
    //     attributes    : Object  Key/Value attributes of the Webhook that will be updated. 
    //                             The valid keys are:
    //                                 'url' (String, optional) - the Webhook's target URL.
    //                                 'content_type' (String, optional) - format of the data sent by the webhook.
    //                                     One of Webhooks.CONTENT_TYPE_JSON, Webhooks.CONTENT_TYPE_WWW_FORM.
    //
    // Returns:                    Promise that resolves when the Webhook is successfully updated, 
    //                             or rejects with an error
    update(webhookId, attributes) {
        let error = ParamsChecker.validateAttr(attributes, 'content_type', this._validContentTypes);
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            data : {
                type : Webhooks._TYPE,
                id : webhookId,
                attributes : attributes
            }
        };
        return super.update(webhookId, attributes, body);
    }

    // Deletes a specific Webhook.
    //
    // Parameters:
    //     webhookId  : String     ID of the Webhook to be deleted
    //
    // Returns:                    Promise that resolves when the Webhook is successfully deleted, 
    //                             or rejects with an error
    delete(webhookId) {
        return super.delete(webhookId);
    }

    _getPath(webhookId = null) {
        if (webhookId) {
            return '/webhooks/' + webhookId;
        }
        return '/webhooks';
    }

    // Returns Webhook resource type
    static get _TYPE() {
        return 'webhook';
    }
}

module.exports = Webhooks;
