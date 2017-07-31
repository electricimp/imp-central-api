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

const Util = require('util');
const Errors = require('./../Errors');

// Helper class for the library methods parameters validation
class ParamsChecker {
    static validateNonEmpty(param, paramName = 'id') {
        if (!param) {
            return new Errors.InvalidDataError(Util.format('Non empty "%s" parameter required', paramName));
        }
        return null;
    }

    static validateEnum(param, validValues, paramName) {
        for (let val of validValues) {
            if (param === val) {
                return null;
            }
        }
        return new Errors.InvalidDataError(Util.format('Wrong "%s" parameter value: "%s"', paramName, param));
    }

    static validatePagination(pageName, pageSize) {
        let error = ParamsChecker._validateNullOrPositiveInteger(pageName, 'pageName');
        if (error) {
            return error;
        }
        error = ParamsChecker._validateNullOrPositiveInteger(pageSize, 'pageSize');
        if (error) {
            return error;
        }
        return null;
    }

    static _validateNullOrPositiveInteger(param, paramName) {
        if (!(param == null ||
            typeof(param) === 'number' && param > 0 && param === parseInt(param))) {
            return new Errors.InvalidDataError(Util.format('Invalid parameter "%s": positive integer required', paramName));
        }
        return null;
    }

    static validateOptions(options, validOptions, optionName, checkRequired) {
        let error;
        if (typeof options !== 'object') {
            return new Errors.InvalidDataError(Util.format('Wrong type of "%s" parameter, Object expected', optionName));
        }

        for (let opt in options) {
            if (!(opt in validOptions)) {
                return new Errors.InvalidDataError(Util.format('Invalid key "%s" in "%s" parameter', opt, optionName));
            }
        }
        // check required options
        if (checkRequired) {
            for (let opt in validOptions) {
                if (validOptions[opt] && (!options || !(opt in options))) {
                    return new Errors.InvalidDataError(Util.format('Required key "%s" absent in "%s" parameter', opt, optionName));
                }
            }
        }
        return null;
    }

    static validateFilters(filters, validFilters) {
        return ParamsChecker.validateOptions(filters, validFilters, 'filters', false);
    }

    static validateAttrs(attributes, validAttributes, checkRequired = false) {
        return ParamsChecker.validateOptions(attributes, validAttributes, 'attributes', checkRequired);
    }
}

module.exports = ParamsChecker;
