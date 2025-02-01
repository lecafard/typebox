"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Required = Required;
const type_1 = require("../create/type");
const index_1 = require("../computed/index");
const index_2 = require("../object/index");
const index_3 = require("../intersect/index");
const index_4 = require("../union/index");
const index_5 = require("../ref/index");
const index_6 = require("../symbols/index");
const index_7 = require("../discard/index");
const required_from_mapped_result_1 = require("./required-from-mapped-result");
// ------------------------------------------------------------------
// TypeGuard
// ------------------------------------------------------------------
const kind_1 = require("../guard/kind");
// prettier-ignore
function FromComputed(target, parameters) {
    return (0, index_1.Computed)('Required', [(0, index_1.Computed)(target, parameters)]);
}
// prettier-ignore
function FromRef($ref) {
    return (0, index_1.Computed)('Required', [(0, index_5.Ref)($ref)]);
}
// prettier-ignore
function FromProperties(properties) {
    const requiredProperties = {};
    for (const K of globalThis.Object.getOwnPropertyNames(properties))
        requiredProperties[K] = (0, index_7.Discard)(properties[K], [index_6.OptionalKind]);
    return requiredProperties;
}
// prettier-ignore
function FromObject(type) {
    const options = (0, index_7.Discard)(type, [index_6.TransformKind, '$id', 'required', 'properties']);
    const properties = FromProperties(type['properties']);
    return (0, index_2.Object)(properties, options);
}
// prettier-ignore
function FromRest(types) {
    return types.map(type => RequiredResolve(type));
}
// ------------------------------------------------------------------
// RequiredResolve
// ------------------------------------------------------------------
// prettier-ignore
function RequiredResolve(type) {
    return ((0, kind_1.IsComputed)(type) ? FromComputed(type.target, type.parameters) :
        (0, kind_1.IsRef)(type) ? FromRef(type.$ref) :
            (0, kind_1.IsIntersect)(type) ? (0, index_3.Intersect)(FromRest(type.allOf)) :
                (0, kind_1.IsUnion)(type) ? (0, index_4.Union)(FromRest(type.anyOf)) :
                    (0, kind_1.IsObject)(type) ? FromObject(type) :
                        (0, index_2.Object)({}));
}
/** `[Json]` Constructs a type where all properties are required */
function Required(type, options) {
    if ((0, kind_1.IsMappedResult)(type)) {
        return (0, required_from_mapped_result_1.RequiredFromMappedResult)(type, options);
    }
    else {
        // special: mapping types require overridable options
        return (0, type_1.CreateType)({ ...RequiredResolve(type), ...options });
    }
}
