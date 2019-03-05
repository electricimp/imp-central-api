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

require('jasmine-expect');

const ImpCentralApi = require('../lib/ImpCentralApi');
const util = require('./util');
const Errors = require('../lib/Errors');
const Products = require('../lib/Products');
const DeviceGroups = require('../lib/DeviceGroups');
const Webhooks = require('../lib/Webhooks');

describe('impCentralAPI.webhooks test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productId;
    let productName;
    let deviceGroupId;
    let deviceGroupName;
    let productionDevGroupId;
    let webhookId;
    let blessingWebhookId;
    let blinkupWebhookId;

    beforeAll(util.init, util.TIMEOUT);

    it('should create a product', (done) => {
        productName = util.getProductName();
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
        deviceGroupName = util.getDeviceGroupName();
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

    it('attempt to create a production device group', (done) => {
        deviceGroupName = util.getDeviceGroupName(1);
        impCentralApi.deviceGroups.create(productId, DeviceGroups.TYPE_PRODUCTION, { name : deviceGroupName }).
            then((res) => {
                expect(res.data.type).toBe(DeviceGroups.TYPE_PRODUCTION);
                productionDevGroupId = res.data.id;
                done();
            }).
            catch((error) => {
                done();
            });
    });

    it('should create a webhook', (done) => {
        let attrs = {
            url : 'http://www.electricimp.test.com',
            event : Webhooks.EVENT_DEPLOYMENT,
            content_type : Webhooks.CONTENT_TYPE_JSON
        };
        impCentralApi.webhooks.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                expect(res.data.type).toBe('webhook');
                expect(res.data.relationships.devicegroup.id).toBe(deviceGroupId);
                webhookId = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not create a webhook with wrong attributes', (done) => {
        let attrs = {
            url : 'http://www.electricimp.test.com',
            event : Webhooks.EVENT_DEPLOYMENT,
            tst_content_type : Webhooks.CONTENT_TYPE_JSON
        };
        impCentralApi.webhooks.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                done.fail('webhook with wrong attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a webhook with wrong attribute values', (done) => {
        let attrs = {
            url : 'http://www.electricimp.test.com',
            event : 'test_event',
            content_type : Webhooks.CONTENT_TYPE_JSON
        };
        impCentralApi.webhooks.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                done.fail('webhook with wrong attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a webhook without required attributes', (done) => {
        let attrs = {
            url : 'http://www.electricimp.test.com',
            content_type : Webhooks.CONTENT_TYPE_JSON
        };
        impCentralApi.webhooks.create(deviceGroupId, DeviceGroups.TYPE_DEVELOPMENT, attrs).
            then((res) => {
                done.fail('webhook without required attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should create blessing webhook', (done) => {
        if (productionDevGroupId) {
            let attrs = {
                url : 'http://www.electricimp.test.com',
                event : Webhooks.EVENT_BLESSING,
                content_type : Webhooks.CONTENT_TYPE_JSON
            };
            impCentralApi.webhooks.create(productionDevGroupId, DeviceGroups.TYPE_PRODUCTION, attrs).
                then((res) => {
                    expect(res.data.type).toBe('webhook');
                    expect(res.data.relationships.devicegroup.id).toBe(productionDevGroupId);
                    blessingWebhookId = res.data.id;
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

    it('should create blinkup webhook', (done) => {
        if (productionDevGroupId) {
            let attrs = {
                url : 'http://www.electricimp.test.com',
                event : Webhooks.EVENT_BLINKUP,
                content_type : Webhooks.CONTENT_TYPE_WWW_FORM
            };
            impCentralApi.webhooks.create(productionDevGroupId, DeviceGroups.TYPE_PRODUCTION, attrs).
                then((res) => {
                    expect(res.data.type).toBe('webhook');
                    expect(res.data.relationships.devicegroup.id).toBe(productionDevGroupId);
                    blinkupWebhookId = res.data.id;
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

    it('should get list of webhooks', (done) => {
        impCentralApi.webhooks.list().
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of webhooks with pagination', (done) => {
        impCentralApi.webhooks.list(null, 1, 1).
            then((res) => {
                expect(res.data.length).toBe(1);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get list of webhooks with incorrect filter', (done) => {
        impCentralApi.webhooks.list({ wrong_filter : deviceGroupId }).
            then((res) => {
                done.fail('list of webhooks with incorrect filter obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of webhooks with valid filters', (done) => {
        impCentralApi.webhooks.list({ 
            [Webhooks.FILTER_DEVICE_GROUP_ID] : deviceGroupId }).
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific webhook', (done) => {
        impCentralApi.webhooks.get(webhookId).
            then((res) => {
                expect(res.data.id).toBe(webhookId);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get webhook with wrong id', (done) => {
        impCentralApi.webhooks.get(productId).
            then((res) => {
                done.fail('webhook with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });
   
    it('should update a specific webhook', (done) => {
        let url = 'http://www.electricimp.test2.com';
        let contentType = Webhooks.CONTENT_TYPE_WWW_FORM;
        let attrs = {
            url : url,
            content_type : contentType
        };
        impCentralApi.webhooks.update(webhookId, attrs).
            then((res) => {
                expect(res.data.id).toBe(webhookId);
                expect(res.data.attributes.url).toBe(url);
                expect(res.data.attributes.content_type).toBe(contentType);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not update a specific webhook with wrong attributes', (done) => {
        impCentralApi.webhooks.update(webhookId, { tst_content_type : Webhooks.CONTENT_TYPE_JSON }).
            then((res) => {
                done.fail('webhook updated successfully with wrong attributes');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not update a specific webhook with wrong attribute values', (done) => {
        impCentralApi.webhooks.update(webhookId, { content_type : 'test content type' }).
            then((res) => {
                done.fail('webhook updated successfully with wrong attributes');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not update webhook with wrong id', (done) => {
        impCentralApi.webhooks.update(deviceGroupId, { content_type : Webhooks.CONTENT_TYPE_JSON }).
            then((res) => {
                done.fail('webhook with wrong id updated successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should delete a specific webhook', (done) => {
        impCentralApi.webhooks.delete(webhookId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not delete nonexistent webhook', (done) => {
        impCentralApi.webhooks.delete(webhookId).
            then((res) => {
                done.fail('nonexistent webhook deleted successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should delete blessing webhook', (done) => {
        if (blessingWebhookId) {
            impCentralApi.webhooks.delete(blessingWebhookId).
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

    it('should delete blinkup webhook', (done) => {
        if (blinkupWebhookId) {
            impCentralApi.webhooks.delete(blinkupWebhookId).
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

    it('should delete a specific device group', (done) => {
        impCentralApi.deviceGroups.delete(deviceGroupId).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should delete production device group', (done) => {
        if (productionDevGroupId) {
            impCentralApi.deviceGroups.delete(productionDevGroupId).
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
