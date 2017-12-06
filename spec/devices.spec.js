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
const Devices = require('../lib/Devices');
const DeviceGroups = require('../lib/DeviceGroups');

describe('impCentralAPI.devices test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productId;
    let productName;
    let ownerId;
    let deviceGroupName;
    let deviceGroupId;

    let devices = {};

    beforeAll(util.init, util.TIMEOUT);

    it('should create a product', (done) => {
        productName = 'tst_product_' + util.getRandomInt();
        impCentralApi.products.create({name : productName}).
            then((res) => {
                expect(res.data.type).toBe('product');
                expect(res.data.attributes.name).toBe(productName);
                productId = res.data.id;
                ownerId = res.data.relationships.owner.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of devices', (done) => {
        impCentralApi.devices.list().
            then((res) => {
                if (res.data.length > 0) {
                    for (let device of res.data) {
                        devices[device.id] = device;
                    }
                }
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });
    
    it('should get list of devices with pagination', (done) => {
        impCentralApi.devices.list(null, 1, 1).
            then((res) => {
                if (Object.keys(devices).length > 0) {
                    expect(res.data.length).toBe(1);
                }
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get list of devices with incorrect filter', (done) => {
        impCentralApi.devices.list({ wrong_filter : 'value' }).
            then((res) => {
                done.fail('list of devices with incorrect filter obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of devices with valid filter', (done) => {
        impCentralApi.devices.list({ [Devices.FILTER_OWNER_ID] : ownerId }).
            then((res) => {
                if (Object.keys(devices).length > 0) {
                    expect(res.data.length).toBeGreaterThan(0);
                }
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of devices with all available filters', (done) => {
        impCentralApi.devices.list({
            [Devices.FILTER_OWNER_ID] : ownerId,
            [Devices.FILTER_PRODUCT_ID] : productId,
            [Devices.FILTER_DEVICE_GROUP_ID] : deviceGroupId,
            [Devices.FILTER_DEVICE_GROUP_OWNER_ID] : ownerId,
            [Devices.FILTER_DEVICE_GROUP_TYPE] : DeviceGroups.TYPE_DEVELOPMENT}).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific device by ID, MAC address and Agent ID', (done) => {
        if (Object.keys(devices).length > 0) {
            let deviceId = Object.keys(devices)[0];
            let device = devices[deviceId];
            let deviceIdentifiers = [deviceId, device.attributes.mac_address];
            let agentId = device.attributes.agent_id;
            if (agentId) {
                deviceIdentifiers.push(agentId);
            }
            deviceIdentifiers.reduce(
                (acc, identifier) => acc.then(() => {
                    return impCentralApi.devices.get(identifier).
                        then((res) => {
                            expect(res.data.id).toBe(deviceId);
                            expect(res.data.type).toBe('device');
                        }).
                        catch((error) => {
                            done.fail(error);
                        });
                }), Promise.resolve()).then(() => done());
        }
        else {
            done();
        }
    }, util.TIMEOUT * 3);

    it('should not get device with wrong id', (done) => {
        impCentralApi.devices.get('wrong_id').
            then((res) => {
                done.fail('device with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });
    
    it('should update a specific device by ID, MAC address and Agent ID', (done) => {
        if (Object.keys(devices).length > 0) {
            let deviceId = Object.keys(devices)[0];
            impCentralApi.devices.get(deviceId).
                then((res) => {
                    let deviceName = res.data.attributes.name;
                    let testName = 'device test name';
                    let deviceIdentifiers = [deviceId, res.data.attributes.mac_address];
                    let agentId = res.data.attributes.agent_id;
                    if (agentId) {
                        deviceIdentifiers.push(agentId);
                    }
                    deviceIdentifiers.reduce(
                        (acc, identifier) => acc.then(() => {
                            return impCentralApi.devices.update(identifier, { name : testName }).
                                then((res) => {
                                    expect(res.data.attributes.name).toBe(testName);
                                    return impCentralApi.devices.update(identifier, { name : deviceName }).
                                        then((res) => {
                                            expect(res.data.attributes.name).toBe(deviceName);
                                        }).
                                        catch((error) => {
                                            done.fail(error);
                                        });
                                }).
                                catch((error) => {
                                    done.fail(error);
                                });
                        }), Promise.resolve()).then(() => done());
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    }, util.TIMEOUT * 3);

    it('should not update a specific device with wrong attributes', (done) => {
        if (Object.keys(devices).length > 0) {
            let deviceId = Object.keys(devices)[0];
            impCentralApi.devices.update(deviceId, { tst_name: 'test name' }).
                then((res) => {
                    done.fail('device updated successfully with wrong attributes');
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

    it('should not update device with wrong id', (done) => {
        impCentralApi.devices.update(ownerId, { name : 'test name' }).
            then((res) => {
                done.fail('device with wrong id updated successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should restart a specific device by ID, MAC address and Agent ID', (done) => {
        if (Object.keys(devices).length > 0) {
            let deviceId = Object.keys(devices)[0];
            impCentralApi.devices.get(deviceId).
                then((res) => {
                    // unassigned devices can not be restarted
                    if (('devicegroup' in res.data.relationships)) {
                        let deviceIdentifiers = [deviceId, res.data.attributes.mac_address, res.data.attributes.agent_id];
                        deviceIdentifiers.reduce(
                            (acc, identifier) => acc.then(() => {
                                return impCentralApi.devices.restart(identifier).
                                    then((res) => {
                                    }).
                                    catch((error) => {
                                        done.fail(error);
                                    });
                            }), Promise.resolve()).then(() => done());
                    }
                    else {
                        done();
                    }
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    }, util.TIMEOUT * 3);

    it('should get historical logs for a specific Device by ID, MAC address and Agent ID', (done) => {
        if (Object.keys(devices).length > 0) {
            let deviceId = Object.keys(devices)[0];
            impCentralApi.devices.get(deviceId).
                then((res) => {
                    let deviceIdentifiers = [deviceId, res.data.attributes.mac_address];
                    let agentId = res.data.attributes.agent_id;
                    if (agentId) {
                        deviceIdentifiers.push(agentId);
                    }
                    deviceIdentifiers.reduce(
                        (acc, identifier) => acc.then(() => {
                            return impCentralApi.devices.getLogs(identifier).
                                then((res) => {
                                }).
                                catch((error) => {
                                    done.fail(error);
                                });
                        }), Promise.resolve()).then(() => done());
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    }, util.TIMEOUT * 3);

    it('should get historical logs for a specific Device with pagination', (done) => {
        if (Object.keys(devices).length > 0) {
            let deviceId = Object.keys(devices)[0];
            return impCentralApi.devices.getLogs(deviceId, 1, 1).
                then((res) => {
                    expect(res.data.length).toBe(1);
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
