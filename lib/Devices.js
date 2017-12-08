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

const DeviceGroups = require('./DeviceGroups');
const Entities = require('./util/Entities');
const ParamsChecker = require('./util/ParamsChecker');
const HttpHelper = require('./util/HttpHelper');

// This class provides access to Devices impCentral API methods.
class Devices extends Entities {
    
    constructor() {
        super();
        this._validFilters = { 
            [Devices.FILTER_OWNER_ID] : false,
            [Devices.FILTER_PRODUCT_ID] : false,
            [Devices.FILTER_DEVICE_GROUP_ID] : false,
            [Devices.FILTER_DEVICE_GROUP_OWNER_ID] : false,
            [Devices.FILTER_DEVICE_GROUP_TYPE] : false
        };
        this._validUpdateAttributes = {
            name : true
        };
    }

    // Retrieves a list of devices associated with the logged-in account.
    //
    // Parameters:
    //     filters    : Object  Optional Key/Value filters that will be applied to the result list
    //                          The valid keys are:
    //                              'filter[owner.id]'             - filter by the Device owner
    //                              'filter[product.id]'           - filter by the Product that holds the 
    //                                  Device Group to which the Device is assigned
    //                              'filter[devicegroup.id]'       - filter by the Device Group to 
    //                                  which the Device is assigned
    //                              'filter[devicegroup.owner.id]' - filter by the owner of the Device Group 
    //                                  to which the Device is assigned. The value can be the literal string 'null',
    //                                  meaning return only unassigned devices.
    //                              'filter[devicegroup.type]'     - filter by the type of the Device Group 
    //                                  to which the Device is assigned
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Devices list is successfully
    //                          obtained, or rejects with an error
    list(filters = null, pageNumber = null, pageSize = null) {
        if (filters && Devices.FILTER_DEVICE_GROUP_TYPE in filters) {
            const error = DeviceGroups.validateType(filters[Devices.FILTER_DEVICE_GROUP_TYPE], Devices.FILTER_DEVICE_GROUP_TYPE);
            if (error) {
                return Promise.reject(error);
            }
        }
        return super.list(filters, pageNumber, pageSize);
    }

    // Possible filter keys for the list() filters:
    
    static get FILTER_OWNER_ID() {
        return 'filter[owner.id]';
    }

    static get FILTER_PRODUCT_ID() {
        return 'filter[product.id]';
    }

    static get FILTER_DEVICE_GROUP_ID() {
        return 'filter[devicegroup.id]';
    }

    static get FILTER_DEVICE_GROUP_OWNER_ID() {
        return 'filter[devicegroup.owner.id]';
    }

    static get FILTER_DEVICE_GROUP_TYPE() {
        return 'filter[devicegroup.type]';
    }

    // Retrieves a specific Device.
    //
    // Parameters:
    //     deviceId : String    the Device's identifier. This can be a MAC address, an Agent ID, 
    //                          or the device ID.
    //
    // Returns:                 Promise that resolves when the Device is successfully obtained, 
    //                          or rejects with an error
    get(deviceId) {
        return super.get(deviceId);
    }

    // Updates a specific Device.
    //
    // Parameters:
    //     deviceId      : String  ID of the Device to be updated. This can be a MAC address, an Agent ID, 
    //                             or the device ID.
    //     attributes    : Object  Key/Value attributes of the Device that will be updated. 
    //                             The valid keys are:
    //                                 'name' - the Device's name
    //
    // Returns:                    Promise that resolves when the Device is successfully updated, 
    //                             or rejects with an error
    update(deviceId, attributes) {
        const body = {
            data : {
                type : Devices._TYPE,
                id : deviceId,
                attributes : attributes
            }
        };
        return super.update(deviceId, attributes, body);
    }

    // Removes a specific device from the logged-in account.
    //
    // Parameters:
    //     deviceId : String       ID of the Device to be removed. This can be a MAC address, an Agent ID, 
    //                             or the device ID.
    //
    // Returns:                    Promise that resolves when the Device is successfully removed 
    //                             from the account, or rejects with an error
    delete(deviceId) {
        return super.delete(deviceId);
    }

    // Restarts a Device.
    //
    // Parameters:
    //     deviceId : String       ID of the Device to be restarted. This can be a MAC address, an Agent ID, 
    //                             or the device ID.
    //
    // Returns:                    Promise that resolves when the Device was restarted, 
    //                             or rejects with an error
    restart(deviceId) {
        const error = ParamsChecker.validateNonEmpty(deviceId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.post(this._getPath(deviceId) + '/restart');
    }

    // Conditionally restarts a Device.
    // Sends a SHUTDOWN_NEWSQUIRREL message to a Device running a Deployment newer-than or equal-to the
    // Device Group's min_supported_deployment, or restarts the device if it is running an older Deployment.
    //
    // Parameters:
    //     deviceId : String       ID of the Device to be restarted. This can be a MAC address, an Agent ID, 
    //                             or the device ID.
    //
    // Returns:                    Promise that resolves when the Device was restarted, 
    //                             or rejects with an error
    conditionalRestart(deviceId) {
        const error = ParamsChecker.validateNonEmpty(deviceId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.post(this._getPath(deviceId) + '/conditional_restart');
    }

    // Gets historical logs for a specific Device.
    // A limited number of logs are kept for a limited period of time. All available logs will be 
    // returned in chronological order (most recent last).
    //
    // Parameters:
    //     deviceId   : String     the Device's identifier. This can be a MAC address, an Agent ID, 
    //                             or the device ID.
    //     pageNumber : Number     Optional pagination page number (starts at 1).
    //                             If not specified, the default value is 1.
    //     pageSize   : Number     Optional pagination size - maximum number of items to return.
    //                             If not specified, the default value is 20.
    //
    // Returns:                    Promise that resolves when the Device logs are successfully obtained, 
    //                             or rejects with an error
    getLogs(deviceId, pageNumber = null, pageSize = null) {
        let error = ParamsChecker.validateNonEmpty(deviceId);
        if (error) {
            return Promise.reject(error);
        }
        error = ParamsChecker.validatePagination(pageNumber, pageSize);
        if (error) {
            return Promise.reject(error);
        }

        const query = HttpHelper.getPaginationQuery(pageNumber, pageSize);

        return HttpHelper.get(this._getPath(deviceId) + '/logs', query);
    }

    _getPath(deviceId = null) {
        if (deviceId) {
            return '/devices/' + deviceId;
        }
        return '/devices';
    }

    // Returns Device resource type
    static get _TYPE() {
        return 'device';
    }
}

module.exports = Devices;
