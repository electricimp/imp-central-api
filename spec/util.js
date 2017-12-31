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

const config = require('./config');
const ImpCentralApi = require('../lib/ImpCentralApi');
const Errors = require('../lib/Errors');
const Devices = require('../lib/Devices');
const Deployments = require('../lib/Deployments');

const TIMEOUT = 20000;
const PRODUCT_NAME = '__test_product__imp_central_api';
const PRODUCT_NAME_2 = PRODUCT_NAME + '_2';
const DEVICE_GROUP_NAME = '__test_device_group__imp_central_api';
const DEVICE_GROUP_NAME_2 = DEVICE_GROUP_NAME + '_2';
const DEVICE_GROUP_NAME_3 = DEVICE_GROUP_NAME + '_3';
const DEVICE_GROUP_NAME_4 = DEVICE_GROUP_NAME + '_4';
const DEVICE_GROUP_NAME_5 = DEVICE_GROUP_NAME + '_5';
const DEVICE_GROUP_NAME_6 = DEVICE_GROUP_NAME + '_6';
const DEVICE_GROUP_NAME_7 = DEVICE_GROUP_NAME + '_7';
const DEVICE_GROUP_NAME_8 = DEVICE_GROUP_NAME + '_8';

var impCentralApi = new ImpCentralApi(config.apiEndpoint);

function _listEntities(entityApi, filters, pageNumber = 1, pageSize = 20) {
    return entityApi.list(filters, pageNumber, pageSize).then(result => {
        let data = result.data;
        if ('next' in result.links) {
            return _listEntities(entityApi, filters, pageNumber + 1, pageSize).then(nextRes => {
                data = data.concat(nextRes);
                return Promise.resolve(data);
            });
        }
        else {
            return Promise.resolve(data);
        }
    });
}

function deleteDeviceGroup(id) {
    return _listEntities(impCentralApi.devices, { [Devices.FILTER_DEVICE_GROUP_ID] : id }).
        then((res) => {
            if (res.length > 0) {
                const deviceIds = res.map(device => device.id);
                return impCentralApi.deviceGroups.removeDevices(id, null, ...deviceIds);
            }
            return Promise.resolve();
        }).
        then(() => _listEntities(impCentralApi.deployments, { 
                [Deployments.FILTER_DEVICE_GROUP_ID] : id,
                [Deployments.FILTER_FLAGGED] : true })).
        then((res) => {
            if (res.length > 0) {
                return Promise.all(res.map(deployment => impCentralApi.deployments.update(deployment.id, { 'flagged' : false })));
            }
            return Promise.resolve();
        }).
        then(() => {
            return impCentralApi.deviceGroups.delete(id);
        });
}

function cleanupDeviceGroups() {
    return _listEntities(impCentralApi.deviceGroups, null).
        then((res) => {
            let devGroupNames = [DEVICE_GROUP_NAME, DEVICE_GROUP_NAME_2, DEVICE_GROUP_NAME_3, DEVICE_GROUP_NAME_4,
                DEVICE_GROUP_NAME_5, DEVICE_GROUP_NAME_6, DEVICE_GROUP_NAME_7, DEVICE_GROUP_NAME_8];
            let devGroupsIds = [];
            for (let dg of res) {
                if (devGroupNames.includes(dg.attributes.name)) {
                    devGroupsIds.push(dg.id);
                }
            }
            if (devGroupsIds.length > 0) {
                return Promise.all(devGroupsIds.map(id => deleteDeviceGroup(id)));
            }
        }).
        catch((error) => {
            return Promise.reject(error);
        });
}

function cleanupProducts() {
    return _listEntities(impCentralApi.products, null).
        then((res) => {
            let productNames = [PRODUCT_NAME, PRODUCT_NAME_2];
            let productIds = [];
            for (let product of res) {
                if (productNames.includes(product.attributes.name)) {
                    productIds.push(product.id);
                }
            }
            if (productIds.length > 0) {
                return Promise.all(productIds.map(id => impCentralApi.products.delete(id)));
            }
        }).
        catch((error) => {
            return Promise.reject(error);
        });
}

module.exports.init = function (done) {
    impCentralApi.debug = config.debug;
    impCentralApi.auth.login(config.email, config.password).
        then(() => cleanupDeviceGroups()).
        then(() => cleanupProducts()).
        then(() => {
            done();
        }).
        catch((error) => {
            done.fail(error);
        });
}

module.exports.noProductionPermissions = function(error) {
    return (error instanceof Errors.ImpCentralApiError && error.message.indexOf('Invalid Permission') >= 0);
}

module.exports.impCentralApi = impCentralApi;
module.exports.TIMEOUT = TIMEOUT;
module.exports.PRODUCT_NAME = PRODUCT_NAME;
module.exports.PRODUCT_NAME_2 = PRODUCT_NAME_2;
module.exports.DEVICE_GROUP_NAME = DEVICE_GROUP_NAME;
module.exports.DEVICE_GROUP_NAME_2 = DEVICE_GROUP_NAME_2;
module.exports.DEVICE_GROUP_NAME_3 = DEVICE_GROUP_NAME_3;
module.exports.DEVICE_GROUP_NAME_4 = DEVICE_GROUP_NAME_4;
module.exports.DEVICE_GROUP_NAME_5 = DEVICE_GROUP_NAME_5;
module.exports.DEVICE_GROUP_NAME_6 = DEVICE_GROUP_NAME_6;
module.exports.DEVICE_GROUP_NAME_7 = DEVICE_GROUP_NAME_7;
module.exports.DEVICE_GROUP_NAME_8 = DEVICE_GROUP_NAME_8;