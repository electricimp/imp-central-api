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
const config = require('./config');

describe('impCentralAPI.auth test suite', () => {
    let impCentralApi = util.impCentralApi;
    let accountId;

    it('should refresh access token', (done) => {
        impCentralApi.auth.login(config.email, config.password).
            then((res) => {
                if ('refresh_token' in res) {
                    impCentralApi.auth.refreshAccessToken(res.refresh_token).
                        then((res) => {
                            expect('access_token' in res).toBeTruthy();
                            done();
                        }).
                        catch((error) => {
                            done.fail(error);
                        });
                }
                else {
                    done.fail('No refresh_token in login response');
                }
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get access token by login key', (done) => {
        if (config.login_key) {
            impCentralApi.auth.getAccessToken(config.login_key).
                then((res) => {
                    expect('access_token' in res).toBeTruthy();
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

    it('should not get access token by empty login key', (done) => {
        impCentralApi.auth.getAccessToken('').
            then((res) => {
                done.fail('get access token by empty login key');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not get access token by wrong login key', (done) => {
        impCentralApi.auth.getAccessToken('wrong_login_key').
            then((res) => {
                done.fail('get access token by wrong login key');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not login with empty email or password', (done) => {
        impCentralApi.auth.login('', null).
            then((res) => {
                done.fail('login with empty email or password');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not login with wrong email or password', (done) => {
        impCentralApi.auth.login(config.email, config.password + '123').
            then((res) => {
                done.fail('login with wrong email or password');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });
});
