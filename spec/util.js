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

const config = require('./config');
const ImpCentralApi = require('../lib/ImpCentralApi');
const Errors = require('../lib/Errors');
const Devices = require('../lib/Devices');
const Deployments = require('../lib/Deployments');

const TIMEOUT = 20000;
const PRODUCT_NAME = '__test_product__imp_central_api';
const DEVICE_GROUP_NAME = '__test_device_group__imp_central_api';

const PRODUCTS = [
    PRODUCT_NAME,
    PRODUCT_NAME + '_2'
];
const DEVICE_GROUPS = [
    DEVICE_GROUP_NAME,
    DEVICE_GROUP_NAME + '_2',
    DEVICE_GROUP_NAME + '_3',
    DEVICE_GROUP_NAME + '_4',
    DEVICE_GROUP_NAME + '_5',
    DEVICE_GROUP_NAME + '_6',
    DEVICE_GROUP_NAME + '_7',
    DEVICE_GROUP_NAME + '_8',
    DEVICE_GROUP_NAME + '_9',
    DEVICE_GROUP_NAME + '_10',
    DEVICE_GROUP_NAME + '_11',
    DEVICE_GROUP_NAME + '_12'
];

var impCentralApi = new ImpCentralApi(config.apiEndpoint);

function _listEntities(entityApi, filters, pageNumber = 1, pageSize = 100) {
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
            let devGroupsIds = [];
            for (let dg of res) {
                if (DEVICE_GROUPS.includes(dg.attributes.name)) {
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
            let productIds = [];
            for (let product of res) {
                if (PRODUCTS.includes(product.attributes.name)) {
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
            // timeout to increase available requests limit
            setTimeout(() => {
                done();
            }, 5000);
        }).
        catch((error) => {
            done.fail(error);
        });
}

module.exports.noProductionPermissions = function(error) {
    return (error instanceof Errors.ImpCentralApiError && error.message.indexOf('Invalid Permission') >= 0);
}

module.exports.getProductName = function(index = 0) {
    if (index >= PRODUCTS.length) {
        throw new Error('Unexpected product name index: ' + index);
    }
    return PRODUCTS[index];
}

module.exports.getDeviceGroupName = function(index = 0) {
    if (index >= DEVICE_GROUPS.length) {
        throw new Error('Unexpected device group name index: ' + index);
    }
    return DEVICE_GROUPS[index];
}

module.exports.impCentralApi = impCentralApi;
module.exports.TIMEOUT = TIMEOUT;
