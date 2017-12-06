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

describe('impCentralAPI.products test suite', () => {
    let impCentralApi = util.impCentralApi;
    let productId;
    let productName;
    let ownerId;

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

    it('should not create a product with non unique name', (done) => {
        impCentralApi.products.create({ name : productName }).
            then((res) => {
                done.fail('product with non unique name created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not create a product without required attributes', (done) => {
        impCentralApi.products.create({ description : 'description' }).
            then((res) => {
                done.fail('product without required attributes created successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of products', (done) => {
        impCentralApi.products.list().
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of products with pagination', (done) => {
        impCentralApi.products.list(null, 1, 1).
            then((res) => {
                expect(res.data.length).toBe(1);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get list of products with incorrect filter', (done) => {
        impCentralApi.products.list({ wrong_filter : ownerId }).
            then((res) => {
                done.fail('list of products with incorrect filter obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get list of products with valid filter', (done) => {
        impCentralApi.products.list({ [Products.FILTER_OWNER_ID] : ownerId }).
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific product', (done) => {
        impCentralApi.products.get(productId).
            then((res) => {
                expect(res.data.id).toBe(productId);
                expect(res.data.attributes.name).toBe(productName);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get product with wrong id', (done) => {
        impCentralApi.products.get(ownerId).
            then((res) => {
                done.fail('product with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should update a specific product', (done) => {
        let descr = 'test description';
        productName = 'tst_product_' + util.getRandomInt();
        impCentralApi.products.update(productId, {description : descr, name: productName}).
            then((res) => {
                expect(res.data.id).toBe(productId);
                expect(res.data.attributes.description).toBe(descr);
                expect(res.data.attributes.name).toBe(productName);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not update a specific product with wrong attributes', (done) => {
        impCentralApi.products.update(productId, { tst_description : 'test description', tst_name: 'test name' }).
            then((res) => {
                done.fail('product updated successfully with wrong attributes');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not update product with wrong id', (done) => {
        impCentralApi.products.update(ownerId, { description: 'test description' }).
            then((res) => {
                done.fail('product with wrong id updated successfully');
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

    it('should not delete nonexistent product', (done) => {
        impCentralApi.products.delete(productId).
            then((res) => {
                done.fail('nonexistent product deleted successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });
});
