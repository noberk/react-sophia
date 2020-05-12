"use strict";
/**
* @license nested-property https://github.com/cosmosio/nested-property
*
* The MIT License (MIT)
*
* Copyright (c) 2014-2020 Olivier Scherrer <pode.fr@gmail.com>
*/
Object.defineProperty(exports, "__esModule", { value: true });
var ARRAY_WILDCARD = "+";
var PATH_DELIMITER = ".";
exports.default = {
    set: setNestedProperty,
    get: getNestedProperty,
    has: hasNestedProperty,
    hasOwn: function (object, property, options) {
        return this.has(object, property, options || { own: true });
    },
    isIn: isInNestedProperty
};
/**
 * Get the property of an object nested in one or more objects or array
 * Given an object such as a.b.c.d = 5, getNestedProperty(a, "b.c.d") will return 5.
 * It also works through arrays. Given a nested array such as a[0].b = 5, getNestedProperty(a, "0.b") will return 5.
 * For accessing nested properties through all items in an array, you may use the array wildcard "+".
 * For instance, getNestedProperty([{a:1}, {a:2}, {a:3}], "+.a") will return [1, 2, 3]
 * @param {Object} object the object to get the property from
 * @param {String} property the path to the property as a string
 * @returns the object or the the property value if found
 */
function getNestedProperty(object, property) {
    if (typeof object != "object" || object === null) {
        return object;
    }
    if (typeof property == "undefined") {
        return object;
    }
    if (typeof property == "number") {
        return object[property];
    }
    try {
        return traverse(object, property, function _getNestedProperty(currentObject, currentProperty) {
            return currentObject[currentProperty];
        });
    }
    catch (err) {
        return object;
    }
}
/**
 * Tell if a nested object has a given property (or array a given index)
 * given an object such as a.b.c.d = 5, hasNestedProperty(a, "b.c.d") will return true.
 * It also returns true if the property is in the prototype chain.
 * @param {Object} object the object to get the property from
 * @param {String} property the path to the property as a string
 * @param {Object} options:
 *  - own: set to reject properties from the prototype
 * @returns true if has (property in object), false otherwise
 */
function hasNestedProperty(object, property, options) {
    if (options === void 0) { options = {}; }
    if (typeof object != "object" || object === null) {
        return false;
    }
    if (typeof property == "undefined") {
        return false;
    }
    if (typeof property == "number") {
        return property in object;
    }
    try {
        var has_1 = false;
        traverse(object, property, function _hasNestedProperty(currentObject, currentProperty, segments, index) {
            if (isLastSegment(segments, index)) {
                if (options.own) {
                    has_1 = currentObject.hasOwnProperty(currentProperty);
                }
                else {
                    has_1 = currentProperty in currentObject;
                }
            }
            else {
                return currentObject && currentObject[currentProperty];
            }
        });
        return has_1;
    }
    catch (err) {
        return false;
    }
}
/**
 * Set the property of an object nested in one or more objects
 * If the property doesn't exist, it gets created.
 * @param {Object} object
 * @param {String} property
 * @param value the value to set
 * @returns object if no assignment was made or the value if the assignment was made
 */
function setNestedProperty(object, property, value) {
    if (typeof object != "object" || object === null) {
        return object;
    }
    if (typeof property == "undefined") {
        return object;
    }
    if (typeof property == "number") {
        object[property] = value;
        return object[property];
    }
    try {
        return traverse(object, property, function _setNestedProperty(currentObject, currentProperty, segments, index) {
            if (!currentObject[currentProperty]) {
                var nextPropIsNumber = Number.isInteger(Number(segments[index + 1]));
                var nextPropIsArrayWildcard = segments[index + 1] === ARRAY_WILDCARD;
                if (nextPropIsNumber || nextPropIsArrayWildcard) {
                    currentObject[currentProperty] = [];
                }
                else {
                    currentObject[currentProperty] = {};
                }
            }
            if (isLastSegment(segments, index)) {
                currentObject[currentProperty] = value;
            }
            return currentObject[currentProperty];
        });
    }
    catch (err) {
        return object;
    }
}
/**
 * Tell if an object is on the path to a nested property
 * If the object is on the path, and the path exists, it returns true, and false otherwise.
 * @param {Object} object to get the nested property from
 * @param {String} property name of the nested property
 * @param {Object} objectInPath the object to check
 * @param {Object} options:
 *  - validPath: return false if the path is invalid, even if the object is in the path
 * @returns {boolean} true if the object is on the path
 */
function isInNestedProperty(object, property, objectInPath, options) {
    if (options === void 0) { options = {}; }
    if (typeof object != "object" || object === null) {
        return false;
    }
    if (typeof property == "undefined") {
        return false;
    }
    try {
        var isIn_1 = false, pathExists_1 = false;
        traverse(object, property, function _isInNestedProperty(currentObject, currentProperty, segments, index) {
            isIn_1 = isIn_1 ||
                currentObject === objectInPath ||
                (!!currentObject && currentObject[currentProperty] === objectInPath);
            pathExists_1 = isLastSegment(segments, index) &&
                typeof currentObject === "object" &&
                currentProperty in currentObject;
            return currentObject && currentObject[currentProperty];
        });
        if (options.validPath) {
            return isIn_1 && pathExists_1;
        }
        else {
            return isIn_1;
        }
    }
    catch (err) {
        return false;
    }
}
function traverse(object, path, callback) {
    if (callback === void 0) { callback = function () { }; }
    var segments = path.split(PATH_DELIMITER);
    var length = segments.length;
    var _loop_1 = function (idx) {
        var currentSegment = segments[idx];
        if (!object) {
            return { value: void 0 };
        }
        if (currentSegment === ARRAY_WILDCARD) {
            if (Array.isArray(object)) {
                return { value: object.map(function (value, index) {
                        var remainingSegments = segments.slice(idx + 1);
                        if (remainingSegments.length > 0) {
                            return traverse(value, remainingSegments.join(PATH_DELIMITER), callback);
                        }
                        else {
                            return callback(object, index, segments, idx);
                        }
                    }) };
            }
            else {
                var pathToHere = segments.slice(0, idx).join(PATH_DELIMITER);
                throw new Error("Object at wildcard (" + pathToHere + ") is not an array");
            }
        }
        else {
            object = callback(object, currentSegment, segments, idx);
        }
    };
    for (var idx = 0; idx < length; idx++) {
        var state_1 = _loop_1(idx);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    return object;
}
function isLastSegment(segments, index) {
    return segments.length === (index + 1);
}