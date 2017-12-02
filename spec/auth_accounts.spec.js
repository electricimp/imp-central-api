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

describe('impCentralAPI.auth and impCentralAPI.accounts test suite', () => {
    let impCentralApi = util.impCentralApi;
    let accountId;
    let refreshTokenId;
    let loginKey;
    let loginKeyDescr;

    beforeAll(util.init, util.TIMEOUT);

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

    it('should get refresh tokens', (done) => {
        impCentralApi.auth.getRefreshTokens().
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                if (res.data.length > 0) {
                    refreshTokenId = res.data[0].id;
                }
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should delete refresh token', (done) => {
        if (refreshTokenId) {
            impCentralApi.auth.deleteRefreshToken(refreshTokenId).
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

    it('should not delete refresh token with empty id', (done) => {
        if (refreshTokenId) {
            impCentralApi.auth.deleteRefreshToken('').
                then((res) => {
                    done.fail('delete refresh token with empty id');
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

    it('should get "me" account', (done) => {
        impCentralApi.accounts.get('me').
            then((res) => {
                expect(res.data.type).toBe('account');
                accountId = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific account', (done) => {
        impCentralApi.accounts.get(accountId).
            then((res) => {
                expect(res.data.type).toBe('account');
                expect(res.data.id).toBe(accountId);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get an account with wrong id', (done) => {
        impCentralApi.accounts.get('wrong-id').
            then((res) => {
                done.fail('account with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should create login key', (done) => {
        loginKeyDescr = 'test description';
        impCentralApi.accounts.createLoginKey(config.password, { 'description' : loginKeyDescr }).
            then((res) => {
                expect(res.data.type).toBe('login_key');
                expect(res.data.attributes.description).toBe(loginKeyDescr);
                loginKey = res.data.id;
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of login keys', (done) => {
        impCentralApi.accounts.listLoginKeys().
            then((res) => {
                expect(res.data.length).toBeGreaterThan(0);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get list of login keys with pagination', (done) => {
        impCentralApi.accounts.listLoginKeys(1, 1).
            then((res) => {
                expect(res.data.length).toBe(1);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should get a specific login key', (done) => {
        impCentralApi.accounts.getLoginKey(loginKey).
            then((res) => {
                expect(res.data.id).toBe(loginKey);
                expect(res.data.attributes.description).toBe(loginKeyDescr);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not get login key with wrong id', (done) => {
        impCentralApi.accounts.getLoginKey(accountId).
            then((res) => {
                done.fail('login key with wrong id obtained successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should update a specific login key', (done) => {
        loginKeyDescr = 'updated test description';
        impCentralApi.accounts.updateLoginKey(loginKey, config.password, { description : loginKeyDescr}).
            then((res) => {
                expect(res.data.attributes.description).toBe(loginKeyDescr);
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not update a specific login key with wrong attributes', (done) => {
        impCentralApi.accounts.updateLoginKey(loginKey, config.password, { name : 'test name' }).
            then((res) => {
                done.fail('login key updated successfully with wrong attributes');
            }).
            catch((error) => {
                if (!(error instanceof Errors.InvalidDataError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should not update login key with wrong id', (done) => {
        impCentralApi.products.update(loginKey + '123', { description: 'test description' }).
            then((res) => {
                done.fail('login key with wrong id updated successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });

    it('should get access token by login key', (done) => {
        impCentralApi.auth.getAccessToken(loginKey).
            then((res) => {
                expect('access_token' in res).toBeTruthy();
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
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

    it('should delete a specific login key', (done) => {
        impCentralApi.accounts.deleteLoginKey(loginKey, config.password).
            then((res) => {
                done();
            }).
            catch((error) => {
                done.fail(error);
            });
    });

    it('should not delete nonexistent login key', (done) => {
        impCentralApi.accounts.deleteLoginKey(loginKey, config.password).
            then((res) => {
                done.fail('nonexistent login key deleted successfully');
            }).
            catch((error) => {
                if (!(error instanceof Errors.ImpCentralApiError)) {
                    done.fail('unexpected error');
                }
                done();
            });
    });
});
