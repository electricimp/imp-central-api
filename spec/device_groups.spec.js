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

describe('impCentralAPI.device_groups test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productName;
    let productId;
    let deviceGroupName;
    let deviceGroupId;
    let devices = {};
    let devicesInfo = [];

    beforeAll(util.init, util.TIMEOUT);

    it('should create a product', (done) => {
        productName = 'tst_product_' + util.getRandomInt();
        impCentralApi.products.create({name : productName}).
            then((res) => {
                productId = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should create a device group', (done) => {
        deviceGroupName = 'tst_dev_group_' + util.getRandomInt();
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_DEVELOPMENT, { name : deviceGroupName }).
            then((res) => {
                expect(res.data.type).toBe(DeviceGroups.TYPE_DEVELOPMENT);
                expect(res.data.attributes.name).toBe(deviceGroupName);
                expect(res.data.relationships.product.id).toBe(productId);
                deviceGroupId = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not create a device group with non unique name', (done) => {
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_DEVELOPMENT, { name : deviceGroupName }).
            then((res) => {
                done.fail('device group with non unique name created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a device group with wrong type', (done) => {
        let deviceGroupName = 'tst_dev_group_' + util.getRandomInt();
        impCentralApi.deviceGroups.create(productId, 'wrong_type', { name : deviceGroupName }).
            then((res) => {
                done.fail('device group with wrong type created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a device group with wrong attributes', (done) => {
        let deviceGroupName = 'tst_dev_group_' + util.getRandomInt();
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_DEVELOPMENT, { name_ : deviceGroupName }).
            then((res) => {
                done.fail('device group with wrong attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a device group without required attributes', (done) => {
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_DEVELOPMENT, { description : 'test description' }).
            then((res) => {
                done.fail('device group without required attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of device groups', (done) => {
        impCentralApi.deviceGroups.list().
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of device groups with pagination', (done) => {
        impCentralApi.deviceGroups.list(null, 1, 1).
            then((res) => {
                expect(res.data.length).toBe(1);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get list of device groups with incorrect filter', (done) => {
        impCentralApi.deviceGroups.list({ wrong_filter : productId }).
            then((res) => {
                done.fail('list of device groups with incorrect filter obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of device groups with valid filter', (done) => {
        impCentralApi.deviceGroups.list({ 
            [DeviceGroups.FILTER_PRODUCT_ID] : productId, 
            [DeviceGroups.FILTER_TYPE] : DeviceGroups.TYPE_DEVELOPMENT }).
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific device group', (done) => {
        impCentralApi.deviceGroups.get(deviceGroupId).
            then((res) => {
                expect(res.data.id).toBe(deviceGroupId);
                expect(res.data.type).toBe(DeviceGroups.TYPE_DEVELOPMENT);
                expect(res.data.attributes.name).toBe(deviceGroupName);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get device group with wrong id', (done) => {
        impCentralApi.deviceGroups.get(productId).
            then((res) => {
                done.fail('device group with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should update a specific device group', (done) => {
        let descr = 'test description';
        deviceGroupName = 'tst_dev_group_' + util.getRandomInt();
        impCentralApi.deviceGroups.update(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, { description : descr, name: deviceGroupName }).
            then((res) => {
                expect(res.data.id).toBe(deviceGroupId);
                expect(res.data.attributes.description).toBe(descr);
                expect(res.data.attributes.name).toBe(deviceGroupName);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not update a specific device group with wrong attributes', (done) => {
        impCentralApi.deviceGroups.update(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, { tst_description : 'test description', tst_name: 'test name' }).
            then((res) => {
                done.fail('device group updated successfully with wrong attributes');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not update device group with wrong id', (done) => {
        impCentralApi.deviceGroups.update(productId, DeviceGroups.TYPE_DEVELOPMENT, { description: 'test description' }).
            then((res) => {
                done.fail('device group with wrong id updated successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should add devices to a specific device group', (done) => {
        impCentralApi.devices.list().
            then((res) => {
                if (res.data.length > 0) {
                    for (let device of res.data) {
                        devices[device.id] = 
                            ('devicegroup' in device.relationships) ? 
                            device.relationships.devicegroup.id : 
                            null;
                    }
                    impCentralApi.deviceGroups.addDevices(deviceGroupId, ...Object.keys(devices)).
                        then((res) => {
                            impCentralApi.devices.list().
                            then((res) => {
                                expect(res.data.length).toBe(Object.keys(devices).length);
                                for (let device of res.data) {
                                    expect(device.relationships.devicegroup.id).toBe(deviceGroupId);
                                }
                                devicesInfo = res.data;
                                done();
                            }).
                            catch((error) => {
                                done.fail(error);
                            });
                        }).
                        catch((error) => {
                            done.fail(error);
                        });
                }
                else {
                    done();
                }
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should restart devices from a specific device group', (done) => {
        impCentralApi.deviceGroups.restartDevices(deviceGroupId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should remove devices by MAC address from a specific device group', (done) => {
        let devices = devicesInfo.map(deviceInfo => deviceInfo.attributes.mac_address);
        impCentralApi.deviceGroups.removeDevices(deviceGroupId, null, ...devices).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should add devices by MAC address to a specific device group', (done) => {
        let devices = devicesInfo.map(deviceInfo => deviceInfo.attributes.mac_address);
        impCentralApi.deviceGroups.addDevices(deviceGroupId, ...devices).
            then((res) => {
                impCentralApi.devices.list().
                then((res) => {
                    expect(res.data.length).toBe(Object.keys(devices).length);
                    for (let device of res.data) {
                        expect(device.relationships.devicegroup.id).toBe(deviceGroupId);
                    }
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should remove devices by Agent ID from a specific device group', (done) => {
        let devices = devicesInfo.map(deviceInfo => deviceInfo.attributes.agent_id);
        impCentralApi.deviceGroups.removeDevices(deviceGroupId, null, ...devices).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    }, util.TIMEOUT);

    it('should add devices by Agent ID to a specific device group', (done) => {
        let devices = devicesInfo.map(deviceInfo => deviceInfo.attributes.agent_id);
        impCentralApi.deviceGroups.addDevices(deviceGroupId, ...devices).
            then((res) => {
                impCentralApi.devices.list().
                then((res) => {
                    expect(res.data.length).toBe(Object.keys(devices).length);
                    for (let device of res.data) {
                        expect(device.relationships.devicegroup.id).toBe(deviceGroupId);
                    }
                    done();
                }).
                catch((error) => {
                    done.fail(error);
                });
            }).
            catch((error) => {
                done.fail(error);
            });
    }, util.TIMEOUT);

    it('should remove devices from a specific device group', (done) => {
        impCentralApi.deviceGroups.removeDevices(deviceGroupId, null, ...Object.keys(devices)).
            then((res) => {
                for (let device in devices) {
                    if (devices[device]) {
                        impCentralApi.deviceGroups.addDevices(devices[device], device).
                            then((res) => {}).
                            catch((error) => {
                                done.fail(error);
                            });
                    }
                }
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should delete a specific device group', (done) => {
        impCentralApi.deviceGroups.delete(deviceGroupId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not delete nonexistent device group', (done) => {
        impCentralApi.deviceGroups.delete(deviceGroupId).
            then((res) => {
                done.fail('nonexistent device group deleted successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
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
