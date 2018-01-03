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

require('jasmine-expect');

const ImpCentralApi = require('../lib/ImpCentralApi');
const util = require('./util');
const Errors = require('../lib/Errors');
const Products = require('../lib/Products');
const DeviceGroups = require('../lib/DeviceGroups');

describe('impCentralAPI.production_device_groups test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productName;
    let productId;
    let prodDeviceGroupName;
    let prodDeviceGroupId;
    let ffDeviceGroupName;
    let ffDeviceGroupId;
    let preProdDeviceGroupName;
    let preProdDeviceGroupId;
    let preFFDeviceGroupName;
    let preFFDeviceGroupId;

    beforeAll(util.init, util.TIMEOUT);

    it('should create a product', (done) => {
        productName = util.PRODUCT_NAME;
        impCentralApi.products.create({name : productName}).
            then((res) => {
                productId = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should create a production device group', (done) => {
        prodDeviceGroupName = util.DEVICE_GROUP_NAME;
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_PRODUCTION, { name : prodDeviceGroupName }).
            then((res) => {
                expect(res.data.type).toBe(DeviceGroups.TYPE_PRODUCTION);
                expect(res.data.attributes.name).toBe(prodDeviceGroupName);
                expect(res.data.relationships.product.id).toBe(productId);
                prodDeviceGroupId = res.data.id;
                done();
            }).
            catch((error) => {
                if (util.noProductionPermissions(error)) {
                    done();
                }
                else {
                    done.fail(error);
                }
            });
    });

    it('should not create a factoryfixture device group without production_target', (done) => {
        ffDeviceGroupName = util.DEVICE_GROUP_NAME_2;
        impCentralApi.deviceGroups.create(
            productId, DeviceGroups.TYPE_FACTORY_FIXTURE, 
            { name : ffDeviceGroupName, description : 'test description' }).
            then((res) => {
                done.fail('factoryfixture device group without production_target created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should create a factoryfixture device group with production_target', (done) => {
        if (prodDeviceGroupId) {
            ffDeviceGroupName = util.DEVICE_GROUP_NAME_3;
            impCentralApi.deviceGroups.create(
                productId, DeviceGroups.TYPE_FACTORY_FIXTURE, 
                { name : ffDeviceGroupName, description : 'test description' },
                { type : DeviceGroups.TYPE_PRODUCTION, id : prodDeviceGroupId }).
                then((res) => {
                    expect(res.data.type).toBe(DeviceGroups.TYPE_FACTORY_FIXTURE);
                    expect(res.data.attributes.name).toBe(ffDeviceGroupName);
                    expect(res.data.relationships.product.id).toBe(productId);
                    expect(res.data.relationships.production_target.id).toBe(prodDeviceGroupId);
                    ffDeviceGroupId = res.data.id;
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should create a pre_production device group', (done) => {
        preProdDeviceGroupName = util.DEVICE_GROUP_NAME_4;
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_PRE_PRODUCTION, { name : preProdDeviceGroupName }).
            then((res) => {
                expect(res.data.type).toBe(DeviceGroups.TYPE_PRE_PRODUCTION);
                expect(res.data.attributes.name).toBe(preProdDeviceGroupName);
                expect(res.data.relationships.product.id).toBe(productId);
                preProdDeviceGroupId = res.data.id;
                done();
            }).
            catch((error) => {
                if (util.noProductionPermissions(error)) {
                    done();
                }
                else {
                    done.fail(error);
                }
            });
    });

    it('should create a pre_factoryfixture device group', (done) => {
        if (preProdDeviceGroupId) {
            preFFDeviceGroupName = util.DEVICE_GROUP_NAME_5;
            impCentralApi.deviceGroups.create(
                productId, DeviceGroups.TYPE_PRE_FACTORY_FIXTURE, 
                { name : preFFDeviceGroupName, description : 'test description' },
                { type : DeviceGroups.TYPE_PRE_PRODUCTION, id : preProdDeviceGroupId }).
                then((res) => {
                    expect(res.data.type).toBe(DeviceGroups.TYPE_PRE_FACTORY_FIXTURE);
                    expect(res.data.attributes.name).toBe(preFFDeviceGroupName);
                    expect(res.data.relationships.product.id).toBe(productId);
                    expect(res.data.relationships.production_target.id).toBe(preProdDeviceGroupId);
                    preFFDeviceGroupId = res.data.id;
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should update production device group', (done) => {
        if (prodDeviceGroupId) {
            let descr = 'new test description';
            prodDeviceGroupName = util.DEVICE_GROUP_NAME_6;
            impCentralApi.deviceGroups.update(
                prodDeviceGroupId,
                DeviceGroups.TYPE_PRODUCTION,
                { description : descr, name: prodDeviceGroupName, load_code_after_blessing : false }).
                then((res) => {
                    expect(res.data.id).toBe(prodDeviceGroupId);
                    expect(res.data.attributes.description).toBe(descr);
                    expect(res.data.attributes.name).toBe(prodDeviceGroupName);
                    expect(res.data.attributes.load_code_after_blessing).toBe(false);
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should not update production device group with production_target', (done) => {
        if (prodDeviceGroupId) {
            impCentralApi.deviceGroups.update(
                prodDeviceGroupId,
                DeviceGroups.TYPE_PRODUCTION,
                { load_code_after_blessing : false },
                { type : DeviceGroups.TYPE_PRE_PRODUCTION, id : preProdDeviceGroupId }).
                then((res) => {
                    done.fail('production device group successfully updated with production_target');
                }).
                catch((error) => {
                    if (!(error instanceof Errors.InvalidDataError)) {
                        done.fail('unexpected error');
                    }
                    done();
                });
        }
        else {
            done();
        }
    });

    it('should update factoryfixture device group', (done) => {
        if (ffDeviceGroupId) {
            let descr = 'new test description';
            ffDeviceGroupName = util.DEVICE_GROUP_NAME_7;
            impCentralApi.deviceGroups.update(
                ffDeviceGroupId,
                DeviceGroups.TYPE_FACTORY_FIXTURE,
                { description : descr, name: ffDeviceGroupName },
                { type : DeviceGroups.TYPE_PRODUCTION, id : prodDeviceGroupId }).
                then((res) => {
                    expect(res.data.id).toBe(ffDeviceGroupId);
                    expect(res.data.attributes.description).toBe(descr);
                    expect(res.data.attributes.name).toBe(ffDeviceGroupName);
                    expect(res.data.relationships.production_target.id).toBe(prodDeviceGroupId);
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should not set load_code_after_blessing for factoryfixture device group', (done) => {
        if (ffDeviceGroupId) {
            impCentralApi.deviceGroups.update(
                ffDeviceGroupId,
                DeviceGroups.TYPE_FACTORY_FIXTURE,
                { load_code_after_blessing : false }).
                then((res) => {
                    done.fail('load_code_after_blessing successfully set for factoryfixture device group');
                }).
                catch((error) => {
                    if (!(error instanceof Errors.InvalidDataError)) {
                        done.fail('unexpected error');
                    }
                    done();
                });
        }
        else {
            done();
        }
    });

    it('should update pre_factoryfixture device group', (done) => {
        if (preFFDeviceGroupId) {
            let descr = 'new test description';
            preFFDeviceGroupName = util.DEVICE_GROUP_NAME_8;
            impCentralApi.deviceGroups.update(
                preFFDeviceGroupId,
                DeviceGroups.TYPE_PRE_FACTORY_FIXTURE,
                { description : descr, name: preFFDeviceGroupName }).
                then((res) => {
                    expect(res.data.id).toBe(preFFDeviceGroupId);
                    expect(res.data.attributes.description).toBe(descr);
                    expect(res.data.attributes.name).toBe(preFFDeviceGroupName);
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should delete factoryfixture device group', (done) => {
        if (ffDeviceGroupId) {
            impCentralApi.deviceGroups.delete(ffDeviceGroupId).
                then((res) => {
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should delete production device group', (done) => {
        if (prodDeviceGroupId) {
            impCentralApi.deviceGroups.delete(prodDeviceGroupId).
                then((res) => {
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should delete pre_factoryfixture device group', (done) => {
        if (preFFDeviceGroupId) {
            impCentralApi.deviceGroups.delete(preFFDeviceGroupId).
                then((res) => {
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should delete pre_production device group', (done) => {
        if (preProdDeviceGroupId) {
            impCentralApi.deviceGroups.delete(preProdDeviceGroupId).
                then((res) => {
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should delete a specific product', (done) => {
        impCentralApi.products.delete(productId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });
});
