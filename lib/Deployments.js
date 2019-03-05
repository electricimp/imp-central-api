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

// This class provides access to Deployments impCentral API methods.
class Deployments extends Entities {

    constructor() {
        super();
        this._validFilters = { 
            [Deployments.FILTER_OWNER_ID] : false,
            [Deployments.FILTER_CREATOR_ID] : false,
            [Deployments.FILTER_PRODUCT_ID] : false,
            [Deployments.FILTER_DEVICE_GROUP_ID] : false,
            [Deployments.FILTER_SHA] : false,
            [Deployments.FILTER_FLAGGED] : false,
            [Deployments.FILTER_FLAGGER_ID] : false,
            [Deployments.FILTER_TAGS] : false
        };
        this._validCreateAttributes = {
            device_code : true,
            agent_code : true,
            description : false,
            origin : false,
            flagged : false,
            tags : false
        };
        this._validUpdateAttributes = {
            description : false,
            flagged : false,
            tags : false
        };
    }

    // Retrieves the account's Deployment history.
    //
    // Parameters:
    //     filters    : Object  Optional Key/Value filters that will be applied to the result list
    //                          The valid keys are:
    //                              'filter[owner.id]'             - filter by the Deployment owner
    //                              'filter[creator.id]'           - filter by the user who created the Deployment
    //                              'filter[product.id]'           - filter by Product that holds the Device Group 
    //                                  using the deployment
    //                              'filter[devicegroup.id]'       - filter by Device Group using the deployment
    //                              'filter[sha]'                  - filter by the Deployment SHA
    //                              'filter[flagged]'              - filter by the Deployment's flagged property. 
    //                                  Filter value can be 'true', 'false', or 'any'.
    //                              'filter[flagger.id]'           - filter by the user who flagged the Deployment
    //                              'filter[tags]'                 - filter by the Deployment's tags property. 
    //                                  The value can contain comma-separated list of multiple tags,
    //                                  Deployments will match all tags in this case.
    //     pageNumber : Number  Optional pagination page number (starts at 1).
    //                          If not specified, the default value is 1.
    //     pageSize   : Number  Optional pagination size - maximum number of items to return.
    //                          If not specified, the default value is 20.
    // 
    // Returns:                 Promise that resolves when the Deployment list is successfully
    //                          obtained, or rejects with an error
    list(filters = null, pageNumber = null, pageSize = null) {
        return super.list(filters, pageNumber, pageSize);
    }

    // Possible filter keys for the list() filters:
    
    static get FILTER_OWNER_ID() {
        return 'filter[owner.id]';
    }

    static get FILTER_CREATOR_ID() {
        return 'filter[creator.id]';
    }

    static get FILTER_PRODUCT_ID() {
        return 'filter[product.id]';
    }

    static get FILTER_DEVICE_GROUP_ID() {
        return 'filter[devicegroup.id]';
    }

    static get FILTER_SHA() {
        return 'filter[sha]';
    }

    static get FILTER_FLAGGED() {
        return 'filter[flagged]';
    }

    static get FILTER_FLAGGER_ID() {
        return 'filter[flagger.id]';
    }

    static get FILTER_TAGS() {
        return 'filter[tags]';
    }

    // Creates a Deployment.
    // A Deployment represents Squirrel code that has been assigned to all Devices of a Device Group 
    // specified by deviceGroupId and deviceGroupType.
    // 
    // Parameters:
    //     deviceGroupId   : String  The Device Group's ID
    //     deviceGroupType : String  The Device Group's type. One of DeviceGroups.TYPE_DEVELOPMENT,
    //                               DeviceGroups.TYPE_PRE_PRODUCTION, DeviceGroups.TYPE_PRODUCTION,
    //                               DeviceGroups.TYPE_PRE_FACTORY_FIXTURE, DeviceGroups.TYPE_FACTORY_FIXTURE,
    //                               DeviceGroups.TYPE_PRE_DUT, DeviceGroups.TYPE_DUT.
    //     attributes      : Object  Key/Value attributes of the Deployment to be created.
    //                               The valid keys are:
    //                                   'device_code' (String, required) - The Squirrel device code 
    //                                       for this Deployment
    //                                   'agent_code' (String, required) - The Squirrel agent code 
    //                                       for this Deployment
    //                                   'description' (String, optional) - an optional free-form 
    //                                       description of the Deployment
    //                                   'origin' (String, optional) - an optional free-form key 
    //                                       to store the source of the code. This field can only be 
    //                                       set at Deployment creation.
    //                                   'flagged' (Boolean, optional) - a toggle marking the deployment 
    //                                       as flagged or not. Deployments flagged true cannot be deleted
    //                                       without first setting flagged to false. Default value is false.
    //                                   'tags' (Array of String, optional) - an array of tags applied to 
    //                                       this Deployment. Tags must conform to the regular expression 
    //                                       /^[A-Za-z0-9_-*.]$/ and may not exceed a total of 500 characters.
    //
    // Returns:                      Promise that resolves when the Deployment is successfully created, 
    //                               or rejects with an error
    create(deviceGroupId, deviceGroupType, attributes) {
        let error = ParamsChecker.validateNonEmpty(deviceGroupId);
        if (error) {
            return Promise.reject(error);
        }
        error = DeviceGroups.validateType(deviceGroupType, 'deviceGroupType');
        if (error) {
            return Promise.reject(error);
        }
        const body = {
            data : {
                type : Deployments._TYPE,
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

    // Retrieves a specific Deployment.
    //
    // Parameters:
    //     deploymentId : String   ID of the Deployment to be retrieved
    //
    // Returns:                    Promise that resolves when the Deployment is successfully obtained, 
    //                             or rejects with an error
    get(deploymentId) {
        return super.get(deploymentId);
    }

    // Updates a specific Deployment.
    //
    // Parameters:
    //     deploymentId  : String  ID of the Deployment to be updated
    //     attributes    : Object  Key/Value attributes of the Deployment that will be updated. 
    //                             The valid keys are:
    //                                 'description' (String, optional) - an optional free-form 
    //                                     description of the Deployment
    //                                 'flagged' (Boolean, optional) - a toggle marking the deployment 
    //                                     as flagged or not. Deployments flagged true cannot be deleted
    //                                     without first setting flagged to false. Default value is false.
    //                                 'tags' (Array of String, optional) - an array of tags applied to 
    //                                     this Deployment. Tags must conform to the regular expression 
    //                                     /^[A-Za-z0-9_-*.]$/ and may not exceed a total of 500 characters.
    //
    // Returns:                    Promise that resolves when the Deployment is successfully updated, 
    //                             or rejects with an error
    update(deploymentId, attributes) {
        const body = {
            data : {
                type : Deployments._TYPE,
                id : deploymentId,
                attributes : attributes
            }
        };
        return super.update(deploymentId, attributes, body);
    }

    // Deletes a specific Deployment.
    //
    // Parameters:
    //     deploymentId  : String  ID of the Deployment to be deleted
    //
    // Returns:                    Promise that resolves when the Deployment is successfully deleted, 
    //                             or rejects with an error
    delete(deploymentId) {
        return super.delete(deploymentId);
    }

    _getPath(deploymentId = null) {
        if (deploymentId) {
            return '/deployments/' + deploymentId;
        }
        return '/deployments';
    }

    // Returns Deployment resource type
    static get _TYPE() {
        return 'deployment';
    }
}

module.exports = Deployments;
