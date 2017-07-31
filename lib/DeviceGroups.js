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

const Products = require('./Products');
const Entities = require('./util/Entities');
const ParamsChecker = require('./util/ParamsChecker');
const HttpHelper = require('./util/HttpHelper');

// This class provides access to Device Groups impCentral API methods.
// NOTE: only 'development_devicegroup' type is currently supported.
class DeviceGroups extends Entities {

    constructor() {
        super();
        this._validFilters = { 
            [DeviceGroups.FILTER_OWNER_ID] : false,
            [DeviceGroups.FILTER_PRODUCT_ID] : false,
            [DeviceGroups.FILTER_TYPE] : false
        };
        this._validCreateAttributes = {
            name : true,
            description : false
        };
        this._validUpdateAttributes = {
            name : true,
            description : false,
            load_code_after_blessing : false
        };
    }

    // Device Groups types
    static get TYPE_DEVELOPMENT() {
        return 'development_devicegroup';
    }

    static get TYPE_PRE_PRODUCTION() {
        return 'pre_production_devicegroup';
    }

    static get TYPE_PRODUCTION() {
        return 'production_devicegroup';
    }

    static get TYPE_PRE_FACTORY_FIXTURE() {
        return 'pre_factoryfixture_devicegroup';
    }

    static get TYPE_FACTORY_FIXTURE() {
        return 'factoryfixture_devicegroup';
    }

    // NOTE: only 'development_devicegroup' type is currently supported for create/update operations.
    static validateDevType(param, paramName) {
        return ParamsChecker.validateEnum(param, [DeviceGroups.TYPE_DEVELOPMENT], paramName);
    }

    static get _validTypes() {
        return [
            DeviceGroups.TYPE_DEVELOPMENT, 
            DeviceGroups.TYPE_PRE_PRODUCTION,
            DeviceGroups.TYPE_PRODUCTION,
            DeviceGroups.TYPE_PRE_FACTORY_FIXTURE,
            DeviceGroups.TYPE_FACTORY_FIXTURE
        ];
    }

    static validateType(param, paramName) {
        return ParamsChecker.validateEnum(param, DeviceGroups._validTypes, paramName);
    }

    // Retrieves a list of Device Groups associated with the logged-in account.
    //
    // Parameters:
    //     filters    : Object  Optional Key/Value filters that will be applied to the result list
    //                          The valid keys are:
    //                              'filter[owner.id]'   - filter by the Device Group owner
    //                              'filter[product.id]' - filter by the Product that holds the Device Group
    //                              'filter[type]'       - filter by the Device Group type
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Device Groups list is successfully
    //                          obtained, or rejects with an error
    list(filters = null, pageNumber = null, pageSize = null) {
        if (filters && DeviceGroups.FILTER_TYPE in filters) {
            const error = DeviceGroups.validateType(filters[DeviceGroups.FILTER_TYPE], DeviceGroups.FILTER_TYPE);
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

    static get FILTER_TYPE() {
        return 'filter[type]';
    }

    // Creates a Device Group of specified type and associates it with an existing Product 
    // specified by productId.
    // NOTE: only 'development_devicegroup' type is currently supported, all other values 
    // cause the method failure.
    //
    // Parameters:
    //     productId     : String  The Product's ID 
    //     type          : String  The Device Group type
    //     attributes    : Object  Key/Value attributes of the Device Group to be created. 
    //                             The valid keys are:
    //                                 'name' (required) - the Device Group's name, this must be 
    //                                     unique for all DeviceGroups in this Product
    //                                 'description' (optional) - an optional free-form 
    //                                     description of the Device Group
    //     relationships : Object  Optional Key/Value relationships of the Device Group to be 
    //                             created. The only valid key is 'production_target'.
    //                             NOTE: Currently ignored as Production Device Groups feature.
    //
    // Returns:                    Promise that resolves when the Device Group is successfully created, 
    //                             or rejects with an error
    create(productId, type, attributes, relationships = null) {
        let error = ParamsChecker.validateNonEmpty(productId);
        if (error) {
            return Promise.reject(error);
        }
        error = DeviceGroups.validateDevType(type, 'type');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            data : {
                type : type,
                attributes : attributes,
                relationships : {
                    [Products._TYPE] : {
                        type : Products._TYPE,
                        id : productId
                    }
                }
            }
        };
        return super.create(attributes, body);
    }

    // Retrieves a specific Device Group.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group to be retrieved
    //
    // Returns:                    Promise that resolves when the Device Group is successfully obtained, 
    //                             or rejects with an error
    get(deviceGroupId) {
        return super.get(deviceGroupId);
    }

    // Updates a specific Device Group.
    // NOTE: only 'development_devicegroup' type is currently supported, all other values 
    // cause the method failure.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group to be updated
    //     type          : String  The Device Group type
    //     attributes    : Object  Key/Value attributes of the Device Group that will be updated. 
    //                             The valid keys are:
    //                                 'name' - the Device Group's name, this must be 
    //                                     unique for all Device Groups in this Product
    //                                 'description' - an optional free-form 
    //                                     description of the Device Group
    //                                 'load_code_after_blessing'
    //                                     NOTE: Currently ignored as Production Device Groups feature.
    //     relationships : Object  Optional Key/Value relationships of the Device Group to be 
    //                             created. The only valid key is 'production_target'.
    //                             NOTE: Currently ignored as Production Device Groups feature.
    //
    // Returns:                    Promise that resolves when the Device Group is successfully updated, 
    //                             or rejects with an error
    update(deviceGroupId, type, attributes, relationships = null) {
        const error = DeviceGroups.validateDevType(type, 'type');
        if (error) {
            return Promise.reject(error);
        }
        const attrs = {};
        Object.assign(attrs, attributes);
        delete attrs.load_code_after_blessing;
        const body = {
            data : {
                type : type,
                id : deviceGroupId,
                attributes : attrs
            }
        };
        return super.update(deviceGroupId, attrs, body);
    }

    // Deletes a specific Device Group.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group to be deleted
    //
    // Returns:                    Promise that resolves when the Device Group is successfully deleted, 
    //                             or rejects with an error
    delete(deviceGroupId) {
        return super.delete(deviceGroupId);
    }

    // Restarts all the devices in a Device Group immediately.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group
    //
    // Returns:                    Promise that resolves when the Device Group's devices were restarted, 
    //                             or rejects with an error
    restartDevices(deviceGroupId) {
        const error = ParamsChecker.validateNonEmpty(deviceGroupId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.post(this._getPath(deviceGroupId) + '/restart');
    }

    // Adds one or more devices to the specified Device Group. 
    // It is not an atomic operation — it is possible for some Devices to be added and other Devices 
    // to fail to be added.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group
    //     deviceIds     : String  One or more Devices identifiers to be added to the Device Group.
    //                             Device identifier can be a MAC address, an Agent ID, or the device ID.
    //
    // Returns:                    Promise that resolves when all of the devices were successfully added 
    //                             to the Device Group or rejects with an error when one or more devices 
    //                             could not be assigned
    addDevices(deviceGroupId, ...deviceIds) {
        const error = ParamsChecker.validateNonEmpty(deviceGroupId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.post(this._getPath(deviceGroupId) + '/relationships/devices', { data : this._convertDeviceIds(deviceIds) });
    }

    // Removes one or more devices from the specified Device Group.
    // It is not an atomic operation — it's possible for some Devices to be unassigned and other Devices
    // to fail to be unassigned.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group
    //     headers       : Object  Optional header parameters which must be specified when removing devices 
    //                             from a production device group
    //                             NOTE: Currently ignored as Production Device Groups feature
    //     deviceIds     : String  One or more Devices identifiers to be removed from the Device Group.
    //                             Device identifier can be a MAC address, an Agent ID, or the device ID.
    //
    // Returns:                    Promise that resolves when all of the devices were successfully removed 
    //                             from the Device Group or rejects with an error when one or more devices 
    //                             could not be unassigned
    removeDevices(deviceGroupId, headers = null, ...deviceIds) {
        const error = ParamsChecker.validateNonEmpty(deviceGroupId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.delete(this._getPath(deviceGroupId) + '/relationships/devices', { data : this._convertDeviceIds(deviceIds) });
    }

    // converts [id1, id2, ...] array to array of objects [{ type : 'device', id : id1 }, { type : 'device', id : id2 }, ...]
    _convertDeviceIds(deviceIds) {
        return deviceIds.map((deviceId) => {
            return {
                type : 'device',
                id : deviceId
            };
        });
    }

    _getPath(deviceGroupId = null) {
        if (deviceGroupId) {
            return '/devicegroups/' + deviceGroupId;
        }
        return '/devicegroups';
    }

    // Returns DeviceGroup resource type
    static get _TYPE() {
        return 'devicegroup';
    }
}

module.exports = DeviceGroups;
