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
const LogStreams = require('../lib/LogStreams');

describe('impCentralAPI.logStreams test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productId;
    let productName;
    let ownerId;
    let deviceGroupName;
    let deviceGroupId;
    let deviceId = null;
    let deviceMacAddress;
    let deviceAgentId;
    let deploymentId;
    let textLogStreamId;
    let jsonLogStreamId;
    let devices = {};

    let logStreamsInfo = {};

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

    it('should not create a logstream with invalid format', (done) => {
        impCentralApi.logStreams.create(function(message) {}, null, null, 'wrong_format').then(() => {
            done.fail('logstream with invalid format created successfully');
        }).
        catch((error) => {
            if (!(error instanceof Errors.InvalidDataError)) {
                done.fail('unexpected error');
            }
            done();
        });
    });

    it('should not create a logstream with empty messageHandler', (done) => {
        impCentralApi.logStreams.create(null).then(() => {
            done.fail('logstream with empty messageHandler created successfully');
        }).
        catch((error) => {
            if (!(error instanceof Errors.InvalidDataError)) {
                done.fail('unexpected error');
            }
            done();
        });
    });

    it('should create a logstream', (done) => {
        impCentralApi.logStreams.create(
            function(message) {
                if (logStreamsInfo[textLogStreamId]) {
                    if (message.indexOf('Hello World, from your Device!') >= 0 || 
                        message.indexOf('Hello World, from your Agent!') >= 0) {
                        logStreamsInfo[textLogStreamId].message = true;
                    }
                }
            },
            function(state) {
                if (logStreamsInfo[textLogStreamId]) {
                    if (state.indexOf('opened') >= 0) {
                        logStreamsInfo[textLogStreamId].opened = true;
                    }
                    else if (state.indexOf('closed') >= 0) {
                        logStreamsInfo[textLogStreamId].closed = true;
                    }
                    else if (state.indexOf('unsubscribed') >= 0) {
                        logStreamsInfo[textLogStreamId].removed = true;
                    }
                    else if (state.indexOf('subscribed') >= 0) {
                        logStreamsInfo[textLogStreamId].added = true;
                    }
                }
            },
            function(error) {
                if (logStreamsInfo[textLogStreamId]) {
                    logStreamsInfo[textLogStreamId].error = error;
                }
            },
            LogStreams.FORMAT_TEXT
        ).then((res) => {
            textLogStreamId = res.data.id;
            logStreamsInfo[textLogStreamId] = { opened: false, added: false, removed: false, closed: false, message: false, error: false };
            done();
        }).
        catch((error) => {
            done.fail(error);
        });
    });

    it('should add device to a text logstream', (done) => {
        impCentralApi.devices.list().then((res) => {
            if (res.data.length > 0) {
                for (let device of res.data) {
                    devices[device.id] = 
                        ('devicegroup' in device.relationships) ? 
                        device.relationships.devicegroup.id : 
                        null;
                }
                deviceId = res.data[0].id;
                impCentralApi.logStreams.addDevice(textLogStreamId, deviceId).
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
        }).
        catch((error) => {
            done.fail(error);
        });
    });

    it('should create a deployment', (done) => {
        let attrs = {
            device_code : 'server.log("Hello World, from your Device!");',
            agent_code : 'server.log("Hello World, from your Agent!");'
        };
        impCentralApi.deployments.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).then((res) => {
            deploymentId = res.data.id;
            if (deviceId) {
                impCentralApi.deviceGroups.addDevices(deviceGroupId, deviceId).then(() => {
                    impCentralApi.devices.restart(deviceId).then(() => {
                        done();
                    });
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

    it('should remove device from a text logstream', (done) => {
        if (deviceId) {
            impCentralApi.logStreams.removeDevice(textLogStreamId, deviceId).
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

    it('should create a json logstream', (done) => {
        impCentralApi.logStreams.create(
            function(message) {
                try {
                    let json = JSON.parse(message);
                    if (logStreamsInfo[jsonLogStreamId]) {
                        if (json.msg.indexOf('Hello World, from your Device!') >= 0 || 
                            json.msg.indexOf('Hello World, from your Agent!') >= 0) {
                            logStreamsInfo[jsonLogStreamId].message = true;
                        }
                    }
                }
                catch (ex) {
                    console.log(ex);
                }
            },
            function(state) {
                try {
                    let json = JSON.parse(state);
                    if (logStreamsInfo[jsonLogStreamId]) {
                        if (json.state === 'opened') {
                            logStreamsInfo[jsonLogStreamId].opened = true;
                        }
                        else if (json.state === 'closed') {
                            logStreamsInfo[jsonLogStreamId].closed = true;
                        }
                        else if (json.state === 'unsubscribed') {
                            logStreamsInfo[jsonLogStreamId].removed = true;
                        }
                        else if (json.state === 'subscribed') {
                            logStreamsInfo[jsonLogStreamId].added = true;
                        }
                    }
                }
                catch (ex) {
                    console.log(ex);
                }
            },
            function(error) {
                if (logStreamsInfo[jsonLogStreamId]) {
                    logStreamsInfo[jsonLogStreamId].error = error;
                }
            },
            LogStreams.FORMAT_JSON
        ).then((res) => {
            jsonLogStreamId = res.data.id;
            logStreamsInfo[jsonLogStreamId] = { opened: false, added: false, removed: false, closed: false, message: false, error: false };
            done();
        }).
        catch((error) => {
            done.fail(error);
        });
    });

    it('should add device by MAC address to a json logstream', (done) => {
        if (deviceId) {
            impCentralApi.devices.get(deviceId).then((res) => {
                deviceMacAddress = res.data.attributes.mac_address;
                return impCentralApi.logStreams.addDevice(jsonLogStreamId, deviceMacAddress);
            }).then(() => {
                done();
            }).catch((error) => {
                done.fail(error);
            });
        }
        else {
            done();
        }
    });

    it('should restart a device', (done) => {
        if (deviceId) {
            impCentralApi.devices.restart(deviceId).then(() => {
                done();
            }).catch((error) => {
                done.fail(error);
            });
        }
        else {
            done();
        }
    });

    it('should remove device by MAC address from a json logstream', (done) => {
        if (deviceId) {
            impCentralApi.logStreams.removeDevice(jsonLogStreamId, deviceMacAddress).
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

    it('should add device by Agent ID to a json logstream', (done) => {
        if (deviceId) {
            impCentralApi.devices.get(deviceId).then((res) => {
                deviceAgentId = res.data.attributes.agent_id;
                return impCentralApi.logStreams.addDevice(jsonLogStreamId, deviceAgentId);
            }).then(() => {
                done();
            }).catch((error) => {
                done.fail(error);
            });
        }
        else {
            done();
        }
    }, util.TIMEOUT * 3);

    it('should remove device by Agent ID from a json logstream', (done) => {
        if (deviceId) {
            impCentralApi.logStreams.removeDevice(jsonLogStreamId, deviceAgentId).
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
    }, util.TIMEOUT);

    it('should remove devices from a specific device group', (done) => {
        if (deviceId) {
            impCentralApi.deviceGroups.removeDevices(deviceGroupId, null, deviceId).
                then((res) => {
                    if (devices[deviceId]) {
                        impCentralApi.deviceGroups.addDevices(devices[deviceId], deviceId).
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
                }).
                catch((error) => {
                    done.fail(error);
                });
        }
        else {
            done();
        }
    });

    it('should close a text logstream', (done) => {
        impCentralApi.logStreams.close(textLogStreamId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not close a logstream twice', (done) => {
        impCentralApi.logStreams.close(textLogStreamId).
            then((res) => {
                done.fail('logsream is successfully closed twice');
            }).
            catch((error) => {
                done();
            });
    });

    it('should close a json logstream', (done) => {
        impCentralApi.logStreams.close(jsonLogStreamId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('validate text logstreams state', (done) => {
        let logStreamInfo = logStreamsInfo[textLogStreamId];
        if (deviceId) {
            expect(logStreamInfo.added).toBe(true);
            expect(logStreamInfo.removed).toBe(true);
            expect(logStreamInfo.message).toBe(true);
        }
        expect(logStreamInfo.closed).toBe(true);
        done();
    });

    it('validate json logstreams state', (done) => {
        let logStreamInfo = logStreamsInfo[jsonLogStreamId];
        if (deviceId) {
            expect(logStreamInfo.added).toBe(true);
            expect(logStreamInfo.removed).toBe(true);
            expect(logStreamInfo.message).toBe(true);
        }
        done();
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
