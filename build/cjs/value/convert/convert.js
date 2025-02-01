"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Convert = Convert;
const index_1 = require("../clone/index");
const index_2 = require("../check/index");
const index_3 = require("../deref/index");
const index_4 = require("../../type/symbols/index");
const index_5 = require("../../type/registry/index");
// ------------------------------------------------------------------
// ValueGuard
// ------------------------------------------------------------------
const index_6 = require("../guard/index");
// ------------------------------------------------------------------
// Conversions
// ------------------------------------------------------------------
function IsStringNumeric(value) {
    return (0, index_6.IsString)(value) && !isNaN(value) && !isNaN(parseFloat(value));
}
function IsValueToString(value) {
    return (0, index_6.IsBigInt)(value) || (0, index_6.IsBoolean)(value) || (0, index_6.IsNumber)(value);
}
function IsValueTrue(value) {
    return value === true || ((0, index_6.IsNumber)(value) && value === 1) || ((0, index_6.IsBigInt)(value) && value === BigInt('1')) || ((0, index_6.IsString)(value) && (value.toLowerCase() === 'true' || value === '1'));
}
function IsValueFalse(value) {
    return value === false || ((0, index_6.IsNumber)(value) && (value === 0 || Object.is(value, -0))) || ((0, index_6.IsBigInt)(value) && value === BigInt('0')) || ((0, index_6.IsString)(value) && (value.toLowerCase() === 'false' || value === '0' || value === '-0'));
}
function IsTimeStringWithTimeZone(value) {
    return (0, index_6.IsString)(value) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test(value);
}
function IsTimeStringWithoutTimeZone(value) {
    return (0, index_6.IsString)(value) && /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test(value);
}
function IsDateTimeStringWithTimeZone(value) {
    return (0, index_6.IsString)(value) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i.test(value);
}
function IsDateTimeStringWithoutTimeZone(value) {
    return (0, index_6.IsString)(value) && /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)?$/i.test(value);
}
function IsDateString(value) {
    return (0, index_6.IsString)(value) && /^\d\d\d\d-[0-1]\d-[0-3]\d$/i.test(value);
}
// ------------------------------------------------------------------
// Convert
// ------------------------------------------------------------------
function TryConvertLiteralString(value, target) {
    const conversion = TryConvertString(value);
    return conversion === target ? conversion : value;
}
function TryConvertLiteralNumber(value, target) {
    const conversion = TryConvertNumber(value);
    return conversion === target ? conversion : value;
}
function TryConvertLiteralBoolean(value, target) {
    const conversion = TryConvertBoolean(value);
    return conversion === target ? conversion : value;
}
// prettier-ignore
function TryConvertLiteral(schema, value) {
    return ((0, index_6.IsString)(schema.const) ? TryConvertLiteralString(value, schema.const) :
        (0, index_6.IsNumber)(schema.const) ? TryConvertLiteralNumber(value, schema.const) :
            (0, index_6.IsBoolean)(schema.const) ? TryConvertLiteralBoolean(value, schema.const) :
                value);
}
function TryConvertBoolean(value) {
    return IsValueTrue(value) ? true : IsValueFalse(value) ? false : value;
}
function TryConvertBigInt(value) {
    const truncateInteger = (value) => value.split('.')[0];
    return IsStringNumeric(value) ? BigInt(truncateInteger(value)) : (0, index_6.IsNumber)(value) ? BigInt(Math.trunc(value)) : IsValueFalse(value) ? BigInt(0) : IsValueTrue(value) ? BigInt(1) : value;
}
function TryConvertString(value) {
    return (0, index_6.IsSymbol)(value) && value.description !== undefined ? value.description.toString() : IsValueToString(value) ? value.toString() : value;
}
function TryConvertNumber(value) {
    return IsStringNumeric(value) ? parseFloat(value) : IsValueTrue(value) ? 1 : IsValueFalse(value) ? 0 : value;
}
function TryConvertInteger(value) {
    return IsStringNumeric(value) ? parseInt(value) : (0, index_6.IsNumber)(value) ? Math.trunc(value) : IsValueTrue(value) ? 1 : IsValueFalse(value) ? 0 : value;
}
function TryConvertNull(value) {
    return (0, index_6.IsString)(value) && value.toLowerCase() === 'null' ? null : value;
}
function TryConvertUndefined(value) {
    return (0, index_6.IsString)(value) && value === 'undefined' ? undefined : value;
}
// ------------------------------------------------------------------
// note: this function may return an invalid dates for the regex
// tests above. Invalid dates will however be checked during the
// casting function and will return a epoch date if invalid.
// Consider better string parsing for the iso dates in future
// revisions.
// ------------------------------------------------------------------
// prettier-ignore
function TryConvertDate(value) {
    return ((0, index_6.IsDate)(value) ? value :
        (0, index_6.IsNumber)(value) ? new Date(value) :
            IsValueTrue(value) ? new Date(1) :
                IsValueFalse(value) ? new Date(0) :
                    IsStringNumeric(value) ? new Date(parseInt(value)) :
                        IsTimeStringWithoutTimeZone(value) ? new Date(`1970-01-01T${value}.000Z`) :
                            IsTimeStringWithTimeZone(value) ? new Date(`1970-01-01T${value}`) :
                                IsDateTimeStringWithoutTimeZone(value) ? new Date(`${value}.000Z`) :
                                    IsDateTimeStringWithTimeZone(value) ? new Date(value) :
                                        IsDateString(value) ? new Date(`${value}T00:00:00.000Z`) :
                                            value);
}
// ------------------------------------------------------------------
// Default
// ------------------------------------------------------------------
function Default(value) {
    return value;
}
// ------------------------------------------------------------------
// Convert
// ------------------------------------------------------------------
function FromArray(schema, references, value, data) {
    const elements = (0, index_6.IsArray)(value) ? value : [value];
    return elements.map((element) => Visit(schema.items, references, element, data));
}
function FromBigInt(schema, references, value, data) {
    return TryConvertBigInt(value);
}
function FromBoolean(schema, references, value, data) {
    return TryConvertBoolean(value);
}
function FromDate(schema, references, value, data) {
    return TryConvertDate(value);
}
function FromImport(schema, references, value, data) {
    const definitions = globalThis.Object.values(schema.$defs);
    const target = schema.$defs[schema.$ref];
    return Visit(target, [...references, ...definitions], value, data);
}
function FromInteger(schema, references, value, data) {
    return TryConvertInteger(value);
}
function FromIntersect(schema, references, value, data) {
    return schema.allOf.reduce((value, schema) => Visit(schema, references, value, data), value);
}
function FromLiteral(schema, references, value, data) {
    return TryConvertLiteral(schema, value);
}
function FromNull(schema, references, value, data) {
    return TryConvertNull(value);
}
function FromNumber(schema, references, value, data) {
    return TryConvertNumber(value);
}
// prettier-ignore
function FromObject(schema, references, value, data) {
    if (!(0, index_6.IsObject)(value))
        return value;
    for (const propertyKey of Object.getOwnPropertyNames(schema.properties)) {
        if (!(0, index_6.HasPropertyKey)(value, propertyKey))
            continue;
        value[propertyKey] = Visit(schema.properties[propertyKey], references, value[propertyKey], data);
    }
    return value;
}
function FromRecord(schema, references, value, data) {
    const isConvertable = (0, index_6.IsObject)(value);
    if (!isConvertable)
        return value;
    const propertyKey = Object.getOwnPropertyNames(schema.patternProperties)[0];
    const property = schema.patternProperties[propertyKey];
    for (const [propKey, propValue] of Object.entries(value)) {
        value[propKey] = Visit(property, references, propValue, data);
    }
    return value;
}
function FromRef(schema, references, value, data) {
    return Visit((0, index_3.Deref)(schema, references), references, value, data);
}
function FromString(schema, references, value, data) {
    return TryConvertString(value);
}
function FromSymbol(schema, references, value, data) {
    return (0, index_6.IsString)(value) || (0, index_6.IsNumber)(value) ? Symbol(value) : value;
}
function FromThis(schema, references, value, data) {
    return Visit((0, index_3.Deref)(schema, references), references, value, data);
}
// prettier-ignore
function FromTuple(schema, references, value, data) {
    const isConvertable = (0, index_6.IsArray)(value) && !(0, index_6.IsUndefined)(schema.items);
    if (!isConvertable)
        return value;
    return value.map((value, index) => {
        return (index < schema.items.length)
            ? Visit(schema.items[index], references, value, data)
            : value;
    });
}
function FromUndefined(schema, references, value, data) {
    return TryConvertUndefined(value);
}
function FromUnion(schema, references, value, data) {
    for (const subschema of schema.anyOf) {
        const converted = Visit(subschema, references, (0, index_1.Clone)(value), data);
        if (!(0, index_2.Check)(subschema, references, converted))
            continue;
        return converted;
    }
    return value;
}
function FromKind(schema, references, value, data) {
    if (!index_5.ConvertRegistry.Has(schema[index_4.Kind]))
        return Default(value);
    const func = index_5.ConvertRegistry.Get(schema[index_4.Kind]);
    return func(schema, value, data && data.get(schema[index_4.Kind]));
}
function Visit(schema, references, value, data) {
    const references_ = (0, index_3.Pushref)(schema, references);
    const schema_ = schema;
    switch (schema[index_4.Kind]) {
        case 'Array':
            return FromArray(schema_, references_, value, data);
        case 'BigInt':
            return FromBigInt(schema_, references_, value, data);
        case 'Boolean':
            return FromBoolean(schema_, references_, value, data);
        case 'Date':
            return FromDate(schema_, references_, value, data);
        case 'Import':
            return FromImport(schema_, references_, value, data);
        case 'Integer':
            return FromInteger(schema_, references_, value, data);
        case 'Intersect':
            return FromIntersect(schema_, references_, value, data);
        case 'Literal':
            return FromLiteral(schema_, references_, value, data);
        case 'Null':
            return FromNull(schema_, references_, value, data);
        case 'Number':
            return FromNumber(schema_, references_, value, data);
        case 'Object':
            return FromObject(schema_, references_, value, data);
        case 'Record':
            return FromRecord(schema_, references_, value, data);
        case 'Ref':
            return FromRef(schema_, references_, value, data);
        case 'String':
            return FromString(schema_, references_, value, data);
        case 'Symbol':
            return FromSymbol(schema_, references_, value, data);
        case 'This':
            return FromThis(schema_, references_, value, data);
        case 'Tuple':
            return FromTuple(schema_, references_, value, data);
        case 'Undefined':
            return FromUndefined(schema_, references_, value, data);
        case 'Union':
            return FromUnion(schema_, references_, value, data);
        default:
            return FromKind(schema, references_, value, data);
    }
}
/** `[Mutable]` Converts any type mismatched values to their target type if a reasonable conversion is possible. */
// prettier-ignore
function Convert(...args) {
    return args.length >= 3 ? Visit(args[0], args[1], args[2], args[3]) : Visit(args[0], [], args[1]);
}
