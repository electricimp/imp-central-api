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

const EventSource = require('eventsource');
const Util = require('util');
const ParamsChecker = require('./util/ParamsChecker');
const HttpHelper = require('./util/HttpHelper');
const Errors = require('./Errors');

// This class provides access to LogStreams impCentral API methods.
// To retrieve logs from a specific device(s), one need to call the library create() method,
// obtain the id of newly created LogStream from the response and add one or more devices to 
// the LogStream using addDevice() method.
// LogStream id can only be used to add/remove devices to the existing LogStream. 
// It's impossible to retrieve logs from the same stream using multiple clients.
// A new LogStream should be created every time the library is restarted.
class LogStreams {

    constructor() {
        this._logStreams = {};
    }

    // Logs format
    static get FORMAT_TEXT() {
        return 'text';
    }

    static get FORMAT_JSON() {
        return 'json';
    }
    
    // Creates a new LogStream and retrieves logs from it.
    // An account may have only one LogStream open at a time, creating a new LogStream will 
    // immediately close an existing one.
    // 
    // If operation succeeds, the method returns Promise that resolves with HTTP response body 
    // of Electric Imp impCentral API (v5) 'Request a new logstream' request.
    // id of the newly created LogStream can be found in that response body.
    //
    // The exact format of response body and the format of all handler parameters can be found 
    // in Electric Imp impCentral API (v5) specification.
    //
    // Parameters:
    //     messageHandler : function  Handler to be executed when the LogStream reports 'message' event.
    //                                It has messageHandler(message) signature, where <message> contains 
    //                                the received log message.
    //
    //     stateChangeHandler         Optional handler to be executed when the LogStream reports 'state-change' event:
    //                    : function    the stream has been opened or closed
    //                                  or a device has been added or removed to the stream.
    //                                It has stateChangeHandler(state) signature, where <state> contains
    //                                the event details.
    //
    //     errorHandler   : function  Optional handler to be executed when the LogStream reports error.
    //                                It has errorHandler(error) signature, where <error> contains the error details.
    //
    //     format         : String    Optional logs format:
    //                                  one of LogStreams.FORMAT_TEXT and LogStreams.FORMAT_JSON values.
    //                                It affects the format of received messages.
    //                                The default value is LogStreams.FORMAT_TEXT.
    //
    // Returns:                       Promise that resolves when the LogStream is successfully created,
    //                                or rejects with an error
    create(messageHandler, stateChangeHandler = null, errorHandler = null, format = LogStreams.FORMAT_TEXT) {
        let error = ParamsChecker.validateNonEmpty(messageHandler, 'messageHandler');
        if (error) {
            return Promise.reject(error);
        }
        error = ParamsChecker.validateEnum(format, [LogStreams.FORMAT_TEXT, LogStreams.FORMAT_JSON], 'format');
        if (error) {
            return Promise.reject(error);
        }
        return HttpHelper.post(this._getPath()).then(result => {
            return new Promise((resolve, reject) => {
                const logStreamId = result.data.id;
                const formatQuery = '?format=' + format;
                const eventSource = new EventSource(HttpHelper.apiEndpoint + this._getPath(logStreamId) + formatQuery);

                eventSource.onopen = function() {
                    this._logStreams[logStreamId] = eventSource;
                    resolve(result);
                }.bind(this);

                eventSource.onmessage = function(message) {
                    messageHandler(message.data);
                }

                eventSource.onerror = function(error) {
                    if (error.status) {
                        const err = new Errors.ImpCentralApiError(null, error.status);
                        if (errorHandler) {
                            errorHandler(err);
                        }
                        reject(err);
                    }
                }

                if (stateChangeHandler) {
                    eventSource.on('state_change', function (state) {
                        stateChangeHandler(state.data);
                    });
                }
            });
        });
    }

    // Adds logs for a particular Device to a stream.
    // A LogStream can support five devices at a time, the least recently added device will be removed 
    // as devices are added beyond that limit.
    //
    // Parameters:
    //     logStreamId    : String    The LogStream's ID
    //     deviceId       : String    ID of the Device to be added to the LogStream. 
    //                                This can be a MAC address, an Agent ID, or the device ID.
    //
    // Returns:                       Promise that resolves when the Device was successfully added 
    //                                to the LogStream or rejects with an error
    addDevice(logStreamId, deviceId) {
        const error = ParamsChecker.validateNonEmpty(logStreamId, 'logStreamId') ||
                      ParamsChecker.validateNonEmpty(deviceId, 'deviceId');
        if (error) {
            return Promise.reject(error);
        }

        return HttpHelper.put(this._getPath(logStreamId) + '/' + deviceId);
    }

    // Removes logs for a particular Device from a stream.
    //
    // Parameters:
    //     logStreamId    : String    The LogStream's ID
    //     deviceId       : String    ID of the Device to be added to the LogStream. 
    //                                This can be a MAC address, an Agent ID, or the device ID.
    //
    // Returns:                       Promise that resolves when the Device was successfully removed
    //                                from the LogStream or rejects with an error
    removeDevice(logStreamId, deviceId) {
        const error = ParamsChecker.validateNonEmpty(logStreamId, 'logStreamId') ||
                      ParamsChecker.validateNonEmpty(deviceId, 'deviceId');
        if (error) {
            return Promise.reject(error);
        }

        return HttpHelper.delete(this._getPath(logStreamId) + '/' + deviceId);
    }

    // Closes a LogStream.
    //
    // Parameters:
    //     logStreamId : String       The LogStream's ID
    //
    // Returns:                       Promise that resolves when the LogStream is successfully closed, 
    //                                or rejects with an error
    close(logStreamId) {
        const error = ParamsChecker.validateNonEmpty(logStreamId, 'logStreamId');
        if (error) {
            return Promise.reject(error);
        }

        const eventSource = this._logStreams[logStreamId];
        if (eventSource) {
            eventSource.close();
            delete this._logStreams[logStreamId];
            return Promise.resolve();
        }
        else {
            return Promise.reject(new Errors.InvalidDataError(Util.format('Incorrect LogStream id: "%s"', logStreamId)));
        }
    }

    _getPath(logStreamId = null) {
        if (logStreamId) {
            return '/logstream/' + logStreamId;
        }
        return '/logstream';
    }
}

module.exports = LogStreams;
