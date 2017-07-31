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
const Deployments = require('../lib/Deployments');

describe('impCentralAPI.deployments test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productId;
    let productName;
    let deviceGroupId;
    let deviceGroupName;
    let deploymentId;

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

    it('should create a deployment', (done) => {
        let attrs = {
            device_code : 'server.log("Hello World, from your Device!");',
            agent_code : 'server.log("Hello World, from your Agent!");',
            flagged : true
        };
        impCentralApi.deployments.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                expect(res.data.type).toBe('deployment');
                expect(res.data.relationships.devicegroup.id).toBe(deviceGroupId);
                deploymentId = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not create a deployment with wrong attributes', (done) => {
        let attrs = {
            device_code : 'server.log("Hello World, from your Device!");',
            tst_agent_code : 'server.log("Hello World, from your Agent!");'
        };
        impCentralApi.deployments.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                done.fail('deployment with wrong attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a deployment without required attributes', (done) => {
        let attrs = {
            device_code : 'server.log("Hello World, from your Device!");',
            description : 'tst description',
            flagged : true
        };
        impCentralApi.deployments.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                done.fail('deployment without required attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of deployments', (done) => {
        impCentralApi.deployments.list().
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of deployments with pagination', (done) => {
        impCentralApi.deployments.list(null, 1, 1).
            then((res) => {
                expect(res.data.length).toBe(1);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get list of deployments with incorrect filter', (done) => {
        impCentralApi.deployments.list({ wrong_filter : productId }).
            then((res) => {
                done.fail('list of deployments with incorrect filter obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of deployments with valid filters', (done) => {
        impCentralApi.deployments.list({ 
            [Deployments.FILTER_PRODUCT_ID] : productId, 
            [Deployments.FILTER_DEVICE_GROUP_ID] : deviceGroupId }).
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific deployment', (done) => {
        impCentralApi.deployments.get(deploymentId).
            then((res) => {
                expect(res.data.id).toBe(deploymentId);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get deployment with wrong id', (done) => {
        impCentralApi.deployments.get(productId).
            then((res) => {
                done.fail('deployment with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });
   
    it('should update a specific deployment', (done) => {
        let descr = 'test description';
        let tags = ['test', 'test2'];
        let attrs = {
            description : 'test description',
            flagged : false,
            tags : tags
        };
        impCentralApi.deployments.update(deploymentId, attrs).
            then((res) => {
                expect(res.data.id).toBe(deploymentId);
                expect(res.data.attributes.description).toBe(descr);
                expect(res.data.attributes.flagged).toBe(false);
                expect(JSON.stringify(res.data.attributes.tags)).toBe(JSON.stringify(tags));
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not update a specific deployment with wrong attributes', (done) => {
        impCentralApi.deployments.update(deploymentId, DeviceGroups.TYPE_DEVELOPMENT, { tst_description : 'test description' }).
            then((res) => {
                done.fail('deployment updated successfully with wrong attributes');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not update deployment with wrong id', (done) => {
        impCentralApi.deployments.update(deviceGroupId, { description: 'test description' }).
            then((res) => {
                done.fail('deployment with wrong id updated successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should delete a specific deployment', (done) => {
        // The most recent deployment for a devicegroup can not be deleted.
        // So we create a new one before.
        let attrs = {
            device_code : 'server.log("Hello World, from your Device!");',
            agent_code : 'server.log("Hello World, from your Agent!");'
        };
        impCentralApi.deployments.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                impCentralApi.deployments.delete(deploymentId).
                    then((res) => {
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

    it('should not delete nonexistent deployment', (done) => {
        impCentralApi.deployments.delete(deploymentId).
            then((res) => {
                done.fail('nonexistent deployment deleted successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
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
