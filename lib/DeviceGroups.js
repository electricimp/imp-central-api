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
const Util = require('util');
const Errors = require('./Errors');

// This class provides access to Device Groups impCentral API methods.
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
            description : false,
            region : false
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
    //
    // Parameters:
    //     productId     : String  The Product's ID 
    //     type          : String  The Device Group type.
    //                             One of DeviceGroups.TYPE_DEVELOPMENT,
    //                             DeviceGroups.TYPE_PRE_PRODUCTION, DeviceGroups.TYPE_PRODUCTION,
    //                             DeviceGroups.TYPE_PRE_FACTORY_FIXTURE, DeviceGroups.TYPE_FACTORY_FIXTURE.
    //     attributes    : Object  Key/Value attributes of the Device Group to be created. 
    //                             The valid keys are:
    //                                 'name' (String, required) - the Device Group's name,
    //                                     this must be unique for all DeviceGroups in this Product
    //                                 'description' (String, optional) - an optional free-form 
    //                                     description of the Device Group
    //                                 'region' (String, optional) - a Device Group's region,
    //                                     May be specified if the new Device Group is of the production 
    //                                     or pre_production type only
    //     productionTarget :      Optional production_target relationship of the Device Group to be
    //         Object              created. Must be specified for pre_factoryfixture and factoryfixture device groups.
    //                             The valid keys are:
    //                                 'type' (String, required) - the target Device Group's type.
    //                                     One of DeviceGroups.TYPE_PRE_PRODUCTION,
    //                                     DeviceGroups.TYPE_PRODUCTION.
    //                                 'id' (String, required) - the target Device Group's ID.
    //
    // Returns:                    Promise that resolves when the Device Group is successfully created, 
    //                             or rejects with an error
    create(productId, type, attributes, productionTarget = null) {
        let error = ParamsChecker.validateNonEmpty(productId) ||
            DeviceGroups.validateType(type, 'type') ||
            this._validateProductionTarget(type, productionTarget, true);
        if (!error && 'region' in attributes &&
            !(type == DeviceGroups.TYPE_PRE_PRODUCTION || type == DeviceGroups.TYPE_PRODUCTION)) {
            error = new Errors.InvalidDataError(
                Util.format(
                    'region may be specified for "%s" or "%s" device groups only',
                    DeviceGroups.TYPE_PRE_PRODUCTION,
                    DeviceGroups.TYPE_PRODUCTION));
        }
        if (error) {
            return Promise.reject(error);
        }

        const relationships = {
            [Products._TYPE] : {
                type : Products._TYPE,
                id : productId
            }
        };
        if (productionTarget) {
            relationships['production_target'] = productionTarget;
        }

        const body = {
            data : {
                type : type,
                attributes : attributes,
                relationships : relationships
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
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group to be updated
    //     type          : String  The Device Group type.
    //                             One of DeviceGroups.TYPE_DEVELOPMENT,
    //                             DeviceGroups.TYPE_PRE_PRODUCTION, DeviceGroups.TYPE_PRODUCTION,
    //                             DeviceGroups.TYPE_PRE_FACTORY_FIXTURE, DeviceGroups.TYPE_FACTORY_FIXTURE.
    //     attributes    : Object  Key/Value attributes of the Device Group that will be updated. 
    //                             The valid keys are:
    //                                 'name' (String, optional) - the Device Group's name,
    //                                     this must be unique for all Device Groups in this Product
    //                                 'description' (String, optional) - an optional free-form 
    //                                     description of the Device Group
    //                                 'load_code_after_blessing' (boolean, optional) -     
    //                                     indicates whether production code will be loaded by the
    //                                     device while in your factory.
    //                                     If true, code is immediately loaded by the device after
    //                                     blessing, and will run when the device is powered on.
    //                                     If false, code will be loaded the next time the device
    //                                     connects as part of BlinkUp, whether successful or not.
    //                                     Valid for production and pre_production Device Groups only.
    //                                     Default value is true.
    //     productionTarget :      Optional production_target relationship of the Device Group to be
    //         Object              updated. Can be specified for pre_factoryfixture and factoryfixture
    //                             device groups only.
    //                             The valid keys are:
    //                                 'type' (String, required) - the target Device Group's type.
    //                                     One of DeviceGroups.TYPE_PRE_PRODUCTION,
    //                                     DeviceGroups.TYPE_PRODUCTION.
    //                                 'id' (String, required) - the target Device Group's ID.
    //
    // Returns:                    Promise that resolves when the Device Group is successfully updated, 
    //                             or rejects with an error
    update(deviceGroupId, type, attributes, productionTarget = null) {
        let error = DeviceGroups.validateType(type, 'type') ||
            this._validateProductionTarget(type, productionTarget, false);
        if (!error && 'load_code_after_blessing' in attributes &&
            !(type == DeviceGroups.TYPE_PRE_PRODUCTION || type == DeviceGroups.TYPE_PRODUCTION)) {
            error = new Errors.InvalidDataError(
                Util.format(
                    'load_code_after_blessing can be specified for "%s" and "%s" device groups only',
                    DeviceGroups.TYPE_PRE_PRODUCTION,
                    DeviceGroups.TYPE_PRODUCTION));
        }
        if (error) {
            return Promise.reject(error);
        }
        const data = {
            type : type,
            id : deviceGroupId,
            attributes : attributes
        };
        if (productionTarget) {
            data['relationships'] = {
                production_target : productionTarget
            };
        }
        return super.update(deviceGroupId, attributes, { data: data });
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

    // Conditionally restarts all the devices in a Device Group.
    // Sends a SHUTDOWN_NEWSQUIRREL message to a all devices in the Device Group running a Deployment
    // newer-than or equal-to the Device Group's min_supported_deployment,
    // or restarts all devices running an older Deployment.
    //
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group
    //
    // Returns:                    Promise that resolves when the Device Group's devices were restarted, 
    //                             or rejects with an error
    conditionalRestartDevices(deviceGroupId) {
        const error = ParamsChecker.validateNonEmpty(deviceGroupId);
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.post(this._getPath(deviceGroupId) + '/conditional_restart');
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
    //     unbondKey     : String  Optional unbond key that must be specified
    //                             when removing devices from a production device group. Removing devices
    //                             from a production group is a rate-limited operation.
    //     deviceIds     : String  One or more Devices identifiers to be removed from the Device Group.
    //                             Device identifier can be a MAC address, an Agent ID, or the device ID.
    //
    // Returns:                    Promise that resolves when all of the devices were successfully removed 
    //                             from the Device Group or rejects with an error when one or more devices 
    //                             could not be unassigned
    removeDevices(deviceGroupId, unbondKey = null, ...deviceIds) {
        let error = ParamsChecker.validateNonEmpty(deviceGroupId);
        if (error) {
            return Promise.reject(error);
        }
        let additionalHeaders = null;
        if (unbondKey) {
            additionalHeaders = {
                'X-Electricimp-Key' : unbondKey
            };
        }
        return HttpHelper.delete(
            this._getPath(deviceGroupId) + '/relationships/devices',
            { data : this._convertDeviceIds(deviceIds) },
            additionalHeaders);
    }

    // Updates the min_supported_deployment relationship for the specified Devicegroup.
    // 
    // Parameters:
    //     deviceGroupId : String  ID of the Device Group
    //     deploymentId  : String  ID of the Deployment that will be set as min_supported_deployment
    //                             for the Device Group. Must be newer than the current Device Group's
    //                             min_supported_deployment
    //
    // Returns:                    Promise that resolves when the Device Group min_supported_deployment
    //                             relationships is updated successfully, or rejects with an error
    updateMinSupportedDeployment(deviceGroupId, deploymentId) {
        const error = ParamsChecker.validateNonEmpty(deviceGroupId) ||
                      ParamsChecker.validateNonEmpty(deploymentId, 'deploymentId');
        if (error) {
            return Promise.reject(error);
        }
        
        const Deployments = require('./Deployments');
        return HttpHelper.put(this._getPath(deviceGroupId) + '/relationships/min_supported_deployment',
            { data : { type : Deployments._TYPE, id : deploymentId } });
    }

    // converts [id1, id2, ...] array to array of objects [{ type : 'device', id : id1 }, { type : 'device', id : id2 }, ...]
    _convertDeviceIds(deviceIds) {
        const Devices = require('./Devices');
        return deviceIds.map((deviceId) => {
            return {
                type : Devices._TYPE,
                id : deviceId
            };
        });
    }

    _validateProductionTarget(deviceGroupType, productionTarget, isCreate) {
        let isFactoryFixture =
            (deviceGroupType == DeviceGroups.TYPE_PRE_FACTORY_FIXTURE ||
             deviceGroupType == DeviceGroups.TYPE_FACTORY_FIXTURE);
        if (productionTarget) {
            if (!isFactoryFixture) {
                return new Errors.InvalidDataError(
                    Util.format(
                        'productionTarget can be specified for "%s" and "%s" Device Groups only',
                        DeviceGroups.TYPE_PRE_FACTORY_FIXTURE,
                        DeviceGroups.TYPE_FACTORY_FIXTURE));
            }
            return ParamsChecker.validateOptions(productionTarget, { type : true, id : true }, 'productionTarget', true) ||
                ParamsChecker.validateEnum(
                    productionTarget.type,
                    [DeviceGroups.TYPE_PRE_PRODUCTION, DeviceGroups.TYPE_PRODUCTION],
                    'productionTarget.type');
        }
        else if (isFactoryFixture && isCreate) {
            return new Errors.InvalidDataError(
                Util.format(
                    'productionTarget must be specified for "%s" and "%s" Device Groups',
                    DeviceGroups.TYPE_PRE_FACTORY_FIXTURE,
                    DeviceGroups.TYPE_FACTORY_FIXTURE));
        }
        return null;
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
