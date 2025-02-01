"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeCompiler = exports.Policy = exports.TypeCompilerTypeGuardError = exports.TypeCompilerUnknownTypeError = exports.TypeCheck = void 0;
const index_1 = require("../value/transform/index");
const index_2 = require("../errors/index");
const index_3 = require("../system/index");
const index_4 = require("../type/error/index");
const index_5 = require("../value/deref/index");
const index_6 = require("../value/hash/index");
const index_7 = require("../type/symbols/index");
const index_8 = require("../type/registry/index");
const index_9 = require("../type/keyof/index");
const extends_undefined_1 = require("../type/extends/extends-undefined");
const index_10 = require("../type/never/index");
const index_11 = require("../type/ref/index");
// ------------------------------------------------------------------
// ValueGuard
// ------------------------------------------------------------------
const index_12 = require("../value/guard/index");
// ------------------------------------------------------------------
// TypeGuard
// ------------------------------------------------------------------
const type_1 = require("../type/guard/type");
// ------------------------------------------------------------------
// TypeCheck
// ------------------------------------------------------------------
class TypeCheck {
    constructor(schema, references, checkFunc, code) {
        this.schema = schema;
        this.references = references;
        this.checkFunc = checkFunc;
        this.code = code;
        this.hasTransform = (0, index_1.HasTransform)(schema, references);
    }
    /** Returns the generated assertion code used to validate this type. */
    Code() {
        return this.code;
    }
    /** Returns the schema type used to validate */
    Schema() {
        return this.schema;
    }
    /** Returns reference types used to validate */
    References() {
        return this.references;
    }
    /** Returns an iterator for each error in this value. */
    Errors(value) {
        return (0, index_2.Errors)(this.schema, this.references, value);
    }
    /** Returns true if the value matches the compiled type. */
    Check(value) {
        return this.checkFunc(value);
    }
    /** Decodes a value or throws if error */
    Decode(value) {
        if (!this.checkFunc(value))
            throw new index_1.TransformDecodeCheckError(this.schema, value, this.Errors(value).First());
        return (this.hasTransform ? (0, index_1.TransformDecode)(this.schema, this.references, value) : value);
    }
    /** Encodes a value or throws if error */
    Encode(value) {
        const encoded = this.hasTransform ? (0, index_1.TransformEncode)(this.schema, this.references, value) : value;
        if (!this.checkFunc(encoded))
            throw new index_1.TransformEncodeCheckError(this.schema, value, this.Errors(value).First());
        return encoded;
    }
}
exports.TypeCheck = TypeCheck;
// ------------------------------------------------------------------
// Character
// ------------------------------------------------------------------
var Character;
(function (Character) {
    function DollarSign(code) {
        return code === 36;
    }
    Character.DollarSign = DollarSign;
    function IsUnderscore(code) {
        return code === 95;
    }
    Character.IsUnderscore = IsUnderscore;
    function IsAlpha(code) {
        return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    }
    Character.IsAlpha = IsAlpha;
    function IsNumeric(code) {
        return code >= 48 && code <= 57;
    }
    Character.IsNumeric = IsNumeric;
})(Character || (Character = {}));
// ------------------------------------------------------------------
// MemberExpression
// ------------------------------------------------------------------
var MemberExpression;
(function (MemberExpression) {
    function IsFirstCharacterNumeric(value) {
        if (value.length === 0)
            return false;
        return Character.IsNumeric(value.charCodeAt(0));
    }
    function IsAccessor(value) {
        if (IsFirstCharacterNumeric(value))
            return false;
        for (let i = 0; i < value.length; i++) {
            const code = value.charCodeAt(i);
            const check = Character.IsAlpha(code) || Character.IsNumeric(code) || Character.DollarSign(code) || Character.IsUnderscore(code);
            if (!check)
                return false;
        }
        return true;
    }
    function EscapeHyphen(key) {
        return key.replace(/'/g, "\\'");
    }
    function Encode(object, key) {
        return IsAccessor(key) ? `${object}.${key}` : `${object}['${EscapeHyphen(key)}']`;
    }
    MemberExpression.Encode = Encode;
})(MemberExpression || (MemberExpression = {}));
// ------------------------------------------------------------------
// Identifier
// ------------------------------------------------------------------
var Identifier;
(function (Identifier) {
    function Encode($id) {
        const buffer = [];
        for (let i = 0; i < $id.length; i++) {
            const code = $id.charCodeAt(i);
            if (Character.IsNumeric(code) || Character.IsAlpha(code)) {
                buffer.push($id.charAt(i));
            }
            else {
                buffer.push(`_${code}_`);
            }
        }
        return buffer.join('').replace(/__/g, '_');
    }
    Identifier.Encode = Encode;
})(Identifier || (Identifier = {}));
// ------------------------------------------------------------------
// LiteralString
// ------------------------------------------------------------------
var LiteralString;
(function (LiteralString) {
    function Escape(content) {
        return content.replace(/'/g, "\\'");
    }
    LiteralString.Escape = Escape;
})(LiteralString || (LiteralString = {}));
// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------
class TypeCompilerUnknownTypeError extends index_4.TypeBoxError {
    constructor(schema) {
        super('Unknown type');
        this.schema = schema;
    }
}
exports.TypeCompilerUnknownTypeError = TypeCompilerUnknownTypeError;
class TypeCompilerTypeGuardError extends index_4.TypeBoxError {
    constructor(schema) {
        super('Preflight validation check failed to guard for the given schema');
        this.schema = schema;
    }
}
exports.TypeCompilerTypeGuardError = TypeCompilerTypeGuardError;
// ------------------------------------------------------------------
// Policy
// ------------------------------------------------------------------
var Policy;
(function (Policy) {
    function IsExactOptionalProperty(value, key, expression) {
        return index_3.TypeSystemPolicy.ExactOptionalPropertyTypes ? `('${key}' in ${value} ? ${expression} : true)` : `(${MemberExpression.Encode(value, key)} !== undefined ? ${expression} : true)`;
    }
    Policy.IsExactOptionalProperty = IsExactOptionalProperty;
    function IsObjectLike(value) {
        return !index_3.TypeSystemPolicy.AllowArrayObject ? `(typeof ${value} === 'object' && ${value} !== null && !Array.isArray(${value}))` : `(typeof ${value} === 'object' && ${value} !== null)`;
    }
    Policy.IsObjectLike = IsObjectLike;
    function IsRecordLike(value) {
        return !index_3.TypeSystemPolicy.AllowArrayObject
            ? `(typeof ${value} === 'object' && ${value} !== null && !Array.isArray(${value}) && !(${value} instanceof Date) && !(${value} instanceof Uint8Array))`
            : `(typeof ${value} === 'object' && ${value} !== null && !(${value} instanceof Date) && !(${value} instanceof Uint8Array))`;
    }
    Policy.IsRecordLike = IsRecordLike;
    function IsNumberLike(value) {
        return index_3.TypeSystemPolicy.AllowNaN ? `typeof ${value} === 'number'` : `Number.isFinite(${value})`;
    }
    Policy.IsNumberLike = IsNumberLike;
    function IsVoidLike(value) {
        return index_3.TypeSystemPolicy.AllowNullVoid ? `(${value} === undefined || ${value} === null)` : `${value} === undefined`;
    }
    Policy.IsVoidLike = IsVoidLike;
})(Policy || (exports.Policy = Policy = {}));
/** Compiles Types for Runtime Type Checking */
var TypeCompiler;
(function (TypeCompiler) {
    // ----------------------------------------------------------------
    // Guards
    // ----------------------------------------------------------------
    function IsAnyOrUnknown(schema) {
        return schema[index_7.Kind] === 'Any' || schema[index_7.Kind] === 'Unknown';
    }
    // ----------------------------------------------------------------
    // Types
    // ----------------------------------------------------------------
    function* FromAny(schema, references, value) {
        yield 'true';
    }
    function* FromArray(schema, references, value) {
        yield `Array.isArray(${value})`;
        const [parameter, accumulator] = [CreateParameter('value', 'any'), CreateParameter('acc', 'number')];
        if ((0, index_12.IsNumber)(schema.maxItems))
            yield `${value}.length <= ${schema.maxItems}`;
        if ((0, index_12.IsNumber)(schema.minItems))
            yield `${value}.length >= ${schema.minItems}`;
        const elementExpression = CreateExpression(schema.items, references, 'value');
        yield `${value}.every((${parameter}) => ${elementExpression})`;
        if ((0, type_1.IsSchema)(schema.contains) || (0, index_12.IsNumber)(schema.minContains) || (0, index_12.IsNumber)(schema.maxContains)) {
            const containsSchema = (0, type_1.IsSchema)(schema.contains) ? schema.contains : (0, index_10.Never)();
            const checkExpression = CreateExpression(containsSchema, references, 'value');
            const checkMinContains = (0, index_12.IsNumber)(schema.minContains) ? [`(count >= ${schema.minContains})`] : [];
            const checkMaxContains = (0, index_12.IsNumber)(schema.maxContains) ? [`(count <= ${schema.maxContains})`] : [];
            const checkCount = `const count = value.reduce((${accumulator}, ${parameter}) => ${checkExpression} ? acc + 1 : acc, 0)`;
            const check = [`(count > 0)`, ...checkMinContains, ...checkMaxContains].join(' && ');
            yield `((${parameter}) => { ${checkCount}; return ${check}})(${value})`;
        }
        if (schema.uniqueItems === true) {
            const check = `const hashed = hash(element); if(set.has(hashed)) { return false } else { set.add(hashed) } } return true`;
            const block = `const set = new Set(); for(const element of value) { ${check} }`;
            yield `((${parameter}) => { ${block} )(${value})`;
        }
    }
    function* FromAsyncIterator(schema, references, value) {
        yield `(typeof value === 'object' && Symbol.asyncIterator in ${value})`;
    }
    function* FromBigInt(schema, references, value) {
        yield `(typeof ${value} === 'bigint')`;
        if ((0, index_12.IsBigInt)(schema.exclusiveMaximum))
            yield `${value} < BigInt(${schema.exclusiveMaximum})`;
        if ((0, index_12.IsBigInt)(schema.exclusiveMinimum))
            yield `${value} > BigInt(${schema.exclusiveMinimum})`;
        if ((0, index_12.IsBigInt)(schema.maximum))
            yield `${value} <= BigInt(${schema.maximum})`;
        if ((0, index_12.IsBigInt)(schema.minimum))
            yield `${value} >= BigInt(${schema.minimum})`;
        if ((0, index_12.IsBigInt)(schema.multipleOf))
            yield `(${value} % BigInt(${schema.multipleOf})) === 0`;
    }
    function* FromBoolean(schema, references, value) {
        yield `(typeof ${value} === 'boolean')`;
    }
    function* FromConstructor(schema, references, value) {
        yield* Visit(schema.returns, references, `${value}.prototype`);
    }
    function* FromDate(schema, references, value) {
        yield `(${value} instanceof Date) && Number.isFinite(${value}.getTime())`;
        if ((0, index_12.IsNumber)(schema.exclusiveMaximumTimestamp))
            yield `${value}.getTime() < ${schema.exclusiveMaximumTimestamp}`;
        if ((0, index_12.IsNumber)(schema.exclusiveMinimumTimestamp))
            yield `${value}.getTime() > ${schema.exclusiveMinimumTimestamp}`;
        if ((0, index_12.IsNumber)(schema.maximumTimestamp))
            yield `${value}.getTime() <= ${schema.maximumTimestamp}`;
        if ((0, index_12.IsNumber)(schema.minimumTimestamp))
            yield `${value}.getTime() >= ${schema.minimumTimestamp}`;
        if ((0, index_12.IsNumber)(schema.multipleOfTimestamp))
            yield `(${value}.getTime() % ${schema.multipleOfTimestamp}) === 0`;
    }
    function* FromFunction(schema, references, value) {
        yield `(typeof ${value} === 'function')`;
    }
    function* FromImport(schema, references, value) {
        const members = globalThis.Object.getOwnPropertyNames(schema.$defs).reduce((result, key) => {
            return [...result, schema.$defs[key]];
        }, []);
        yield* Visit((0, index_11.Ref)(schema.$ref), [...references, ...members], value);
    }
    function* FromInteger(schema, references, value) {
        yield `Number.isInteger(${value})`;
        if ((0, index_12.IsNumber)(schema.exclusiveMaximum))
            yield `${value} < ${schema.exclusiveMaximum}`;
        if ((0, index_12.IsNumber)(schema.exclusiveMinimum))
            yield `${value} > ${schema.exclusiveMinimum}`;
        if ((0, index_12.IsNumber)(schema.maximum))
            yield `${value} <= ${schema.maximum}`;
        if ((0, index_12.IsNumber)(schema.minimum))
            yield `${value} >= ${schema.minimum}`;
        if ((0, index_12.IsNumber)(schema.multipleOf))
            yield `(${value} % ${schema.multipleOf}) === 0`;
    }
    function* FromIntersect(schema, references, value) {
        const check1 = schema.allOf.map((schema) => CreateExpression(schema, references, value)).join(' && ');
        if (schema.unevaluatedProperties === false) {
            const keyCheck = CreateVariable(`${new RegExp((0, index_9.KeyOfPattern)(schema))};`);
            const check2 = `Object.getOwnPropertyNames(${value}).every(key => ${keyCheck}.test(key))`;
            yield `(${check1} && ${check2})`;
        }
        else if ((0, type_1.IsSchema)(schema.unevaluatedProperties)) {
            const keyCheck = CreateVariable(`${new RegExp((0, index_9.KeyOfPattern)(schema))};`);
            const check2 = `Object.getOwnPropertyNames(${value}).every(key => ${keyCheck}.test(key) || ${CreateExpression(schema.unevaluatedProperties, references, `${value}[key]`)})`;
            yield `(${check1} && ${check2})`;
        }
        else {
            yield `(${check1})`;
        }
    }
    function* FromIterator(schema, references, value) {
        yield `(typeof value === 'object' && Symbol.iterator in ${value})`;
    }
    function* FromLiteral(schema, references, value) {
        if (typeof schema.const === 'number' || typeof schema.const === 'boolean') {
            yield `(${value} === ${schema.const})`;
        }
        else {
            yield `(${value} === '${LiteralString.Escape(schema.const)}')`;
        }
    }
    function* FromNever(schema, references, value) {
        yield `false`;
    }
    function* FromNot(schema, references, value) {
        const expression = CreateExpression(schema.not, references, value);
        yield `(!${expression})`;
    }
    function* FromNull(schema, references, value) {
        yield `(${value} === null)`;
    }
    function* FromNumber(schema, references, value) {
        yield Policy.IsNumberLike(value);
        if ((0, index_12.IsNumber)(schema.exclusiveMaximum))
            yield `${value} < ${schema.exclusiveMaximum}`;
        if ((0, index_12.IsNumber)(schema.exclusiveMinimum))
            yield `${value} > ${schema.exclusiveMinimum}`;
        if ((0, index_12.IsNumber)(schema.maximum))
            yield `${value} <= ${schema.maximum}`;
        if ((0, index_12.IsNumber)(schema.minimum))
            yield `${value} >= ${schema.minimum}`;
        if ((0, index_12.IsNumber)(schema.multipleOf))
            yield `(${value} % ${schema.multipleOf}) === 0`;
    }
    function* FromObject(schema, references, value) {
        yield Policy.IsObjectLike(value);
        if ((0, index_12.IsNumber)(schema.minProperties))
            yield `Object.getOwnPropertyNames(${value}).length >= ${schema.minProperties}`;
        if ((0, index_12.IsNumber)(schema.maxProperties))
            yield `Object.getOwnPropertyNames(${value}).length <= ${schema.maxProperties}`;
        const knownKeys = Object.getOwnPropertyNames(schema.properties);
        for (const knownKey of knownKeys) {
            const memberExpression = MemberExpression.Encode(value, knownKey);
            const property = schema.properties[knownKey];
            if (schema.required && schema.required.includes(knownKey)) {
                yield* Visit(property, references, memberExpression);
                if ((0, extends_undefined_1.ExtendsUndefinedCheck)(property) || IsAnyOrUnknown(property))
                    yield `('${knownKey}' in ${value})`;
            }
            else {
                const expression = CreateExpression(property, references, memberExpression);
                yield Policy.IsExactOptionalProperty(value, knownKey, expression);
            }
        }
        if (schema.additionalProperties === false) {
            if (schema.required && schema.required.length === knownKeys.length) {
                yield `Object.getOwnPropertyNames(${value}).length === ${knownKeys.length}`;
            }
            else {
                const keys = `[${knownKeys.map((key) => `'${key}'`).join(', ')}]`;
                yield `Object.getOwnPropertyNames(${value}).every(key => ${keys}.includes(key))`;
            }
        }
        if (typeof schema.additionalProperties === 'object') {
            const expression = CreateExpression(schema.additionalProperties, references, `${value}[key]`);
            const keys = `[${knownKeys.map((key) => `'${key}'`).join(', ')}]`;
            yield `(Object.getOwnPropertyNames(${value}).every(key => ${keys}.includes(key) || ${expression}))`;
        }
    }
    function* FromPromise(schema, references, value) {
        yield `${value} instanceof Promise`;
    }
    function* FromRecord(schema, references, value) {
        yield Policy.IsRecordLike(value);
        if ((0, index_12.IsNumber)(schema.minProperties))
            yield `Object.getOwnPropertyNames(${value}).length >= ${schema.minProperties}`;
        if ((0, index_12.IsNumber)(schema.maxProperties))
            yield `Object.getOwnPropertyNames(${value}).length <= ${schema.maxProperties}`;
        const [patternKey, patternSchema] = Object.entries(schema.patternProperties)[0];
        const variable = CreateVariable(`${new RegExp(patternKey)}`);
        const check1 = CreateExpression(patternSchema, references, 'value');
        const check2 = (0, type_1.IsSchema)(schema.additionalProperties) ? CreateExpression(schema.additionalProperties, references, value) : schema.additionalProperties === false ? 'false' : 'true';
        const expression = `(${variable}.test(key) ? ${check1} : ${check2})`;
        yield `(Object.entries(${value}).every(([key, value]) => ${expression}))`;
    }
    function* FromRef(schema, references, value) {
        const target = (0, index_5.Deref)(schema, references);
        // Reference: If we have seen this reference before we can just yield and return the function call.
        // If this isn't the case we defer to visit to generate and set the function for subsequent passes.
        if (state.functions.has(schema.$ref))
            return yield `${CreateFunctionName(schema.$ref)}(${value})`;
        yield* Visit(target, references, value);
    }
    function* FromRegExp(schema, references, value) {
        const variable = CreateVariable(`${new RegExp(schema.source, schema.flags)};`);
        yield `(typeof ${value} === 'string')`;
        if ((0, index_12.IsNumber)(schema.maxLength))
            yield `${value}.length <= ${schema.maxLength}`;
        if ((0, index_12.IsNumber)(schema.minLength))
            yield `${value}.length >= ${schema.minLength}`;
        yield `${variable}.test(${value})`;
    }
    function* FromString(schema, references, value) {
        yield `(typeof ${value} === 'string')`;
        if ((0, index_12.IsNumber)(schema.maxLength))
            yield `${value}.length <= ${schema.maxLength}`;
        if ((0, index_12.IsNumber)(schema.minLength))
            yield `${value}.length >= ${schema.minLength}`;
        if (schema.pattern !== undefined) {
            const variable = CreateVariable(`${new RegExp(schema.pattern)};`);
            yield `${variable}.test(${value})`;
        }
        if (schema.format !== undefined) {
            yield `format('${schema.format}', ${value})`;
        }
    }
    function* FromSymbol(schema, references, value) {
        yield `(typeof ${value} === 'symbol')`;
    }
    function* FromTemplateLiteral(schema, references, value) {
        yield `(typeof ${value} === 'string')`;
        const variable = CreateVariable(`${new RegExp(schema.pattern)};`);
        yield `${variable}.test(${value})`;
    }
    function* FromThis(schema, references, value) {
        // Note: This types are assured to be hoisted prior to this call. Just yield the function.
        yield `${CreateFunctionName(schema.$ref)}(${value})`;
    }
    function* FromTuple(schema, references, value) {
        yield `Array.isArray(${value})`;
        if (schema.items === undefined)
            return yield `${value}.length === 0`;
        yield `(${value}.length === ${schema.maxItems})`;
        for (let i = 0; i < schema.items.length; i++) {
            const expression = CreateExpression(schema.items[i], references, `${value}[${i}]`);
            yield `${expression}`;
        }
    }
    function* FromUndefined(schema, references, value) {
        yield `${value} === undefined`;
    }
    function* FromUnion(schema, references, value) {
        const expressions = schema.anyOf.map((schema) => CreateExpression(schema, references, value));
        yield `(${expressions.join(' || ')})`;
    }
    function* FromUint8Array(schema, references, value) {
        yield `${value} instanceof Uint8Array`;
        if ((0, index_12.IsNumber)(schema.maxByteLength))
            yield `(${value}.length <= ${schema.maxByteLength})`;
        if ((0, index_12.IsNumber)(schema.minByteLength))
            yield `(${value}.length >= ${schema.minByteLength})`;
    }
    function* FromUnknown(schema, references, value) {
        yield 'true';
    }
    function* FromVoid(schema, references, value) {
        yield Policy.IsVoidLike(value);
    }
    function* FromKind(schema, references, value) {
        const instance = state.instances.size;
        state.instances.set(instance, schema);
        yield `kind('${schema[index_7.Kind]}', ${instance}, ${value})`;
    }
    function* Visit(schema, references, value, useHoisting = true) {
        const references_ = (0, index_12.IsString)(schema.$id) ? [...references, schema] : references;
        const schema_ = schema;
        // --------------------------------------------------------------
        // Hoisting
        // --------------------------------------------------------------
        if (useHoisting && (0, index_12.IsString)(schema.$id)) {
            const functionName = CreateFunctionName(schema.$id);
            if (state.functions.has(functionName)) {
                return yield `${functionName}(${value})`;
            }
            else {
                // Note: In the case of cyclic types, we need to create a 'functions' record
                // to prevent infinitely re-visiting the CreateFunction. Subsequent attempts
                // to visit will be caught by the above condition.
                state.functions.set(functionName, '<deferred>');
                const functionCode = CreateFunction(functionName, schema, references, 'value', false);
                state.functions.set(functionName, functionCode);
                return yield `${functionName}(${value})`;
            }
        }
        switch (schema_[index_7.Kind]) {
            case 'Any':
                return yield* FromAny(schema_, references_, value);
            case 'Array':
                return yield* FromArray(schema_, references_, value);
            case 'AsyncIterator':
                return yield* FromAsyncIterator(schema_, references_, value);
            case 'BigInt':
                return yield* FromBigInt(schema_, references_, value);
            case 'Boolean':
                return yield* FromBoolean(schema_, references_, value);
            case 'Constructor':
                return yield* FromConstructor(schema_, references_, value);
            case 'Date':
                return yield* FromDate(schema_, references_, value);
            case 'Function':
                return yield* FromFunction(schema_, references_, value);
            case 'Import':
                return yield* FromImport(schema_, references_, value);
            case 'Integer':
                return yield* FromInteger(schema_, references_, value);
            case 'Intersect':
                return yield* FromIntersect(schema_, references_, value);
            case 'Iterator':
                return yield* FromIterator(schema_, references_, value);
            case 'Literal':
                return yield* FromLiteral(schema_, references_, value);
            case 'Never':
                return yield* FromNever(schema_, references_, value);
            case 'Not':
                return yield* FromNot(schema_, references_, value);
            case 'Null':
                return yield* FromNull(schema_, references_, value);
            case 'Number':
                return yield* FromNumber(schema_, references_, value);
            case 'Object':
                return yield* FromObject(schema_, references_, value);
            case 'Promise':
                return yield* FromPromise(schema_, references_, value);
            case 'Record':
                return yield* FromRecord(schema_, references_, value);
            case 'Ref':
                return yield* FromRef(schema_, references_, value);
            case 'RegExp':
                return yield* FromRegExp(schema_, references_, value);
            case 'String':
                return yield* FromString(schema_, references_, value);
            case 'Symbol':
                return yield* FromSymbol(schema_, references_, value);
            case 'TemplateLiteral':
                return yield* FromTemplateLiteral(schema_, references_, value);
            case 'This':
                return yield* FromThis(schema_, references_, value);
            case 'Tuple':
                return yield* FromTuple(schema_, references_, value);
            case 'Undefined':
                return yield* FromUndefined(schema_, references_, value);
            case 'Union':
                return yield* FromUnion(schema_, references_, value);
            case 'Uint8Array':
                return yield* FromUint8Array(schema_, references_, value);
            case 'Unknown':
                return yield* FromUnknown(schema_, references_, value);
            case 'Void':
                return yield* FromVoid(schema_, references_, value);
            default:
                if (!index_8.TypeRegistry.Has(schema_[index_7.Kind]))
                    throw new TypeCompilerUnknownTypeError(schema);
                return yield* FromKind(schema_, references_, value);
        }
    }
    // ----------------------------------------------------------------
    // Compiler State
    // ----------------------------------------------------------------
    // prettier-ignore
    const state = {
        language: 'javascript', // target language
        functions: new Map(), // local functions
        variables: new Map(), // local variables
        instances: new Map() // exterior kind instances
    };
    // ----------------------------------------------------------------
    // Compiler Factory
    // ----------------------------------------------------------------
    function CreateExpression(schema, references, value, useHoisting = true) {
        return `(${[...Visit(schema, references, value, useHoisting)].join(' && ')})`;
    }
    function CreateFunctionName($id) {
        return `check_${Identifier.Encode($id)}`;
    }
    function CreateVariable(expression) {
        const variableName = `local_${state.variables.size}`;
        state.variables.set(variableName, `const ${variableName} = ${expression}`);
        return variableName;
    }
    function CreateFunction(name, schema, references, value, useHoisting = true) {
        const [newline, pad] = ['\n', (length) => ''.padStart(length, ' ')];
        const parameter = CreateParameter('value', 'any');
        const returns = CreateReturns('boolean');
        const expression = [...Visit(schema, references, value, useHoisting)].map((expression) => `${pad(4)}${expression}`).join(` &&${newline}`);
        return `function ${name}(${parameter})${returns} {${newline}${pad(2)}return (${newline}${expression}${newline}${pad(2)})\n}`;
    }
    function CreateParameter(name, type) {
        const annotation = state.language === 'typescript' ? `: ${type}` : '';
        return `${name}${annotation}`;
    }
    function CreateReturns(type) {
        return state.language === 'typescript' ? `: ${type}` : '';
    }
    // ----------------------------------------------------------------
    // Compile
    // ----------------------------------------------------------------
    function Build(schema, references, options) {
        const functionCode = CreateFunction('check', schema, references, 'value'); // will populate functions and variables
        const parameter = CreateParameter('value', 'any');
        const returns = CreateReturns('boolean');
        const functions = [...state.functions.values()];
        const variables = [...state.variables.values()];
        // prettier-ignore
        const checkFunction = (0, index_12.IsString)(schema.$id) // ensure top level schemas with $id's are hoisted
            ? `return function check(${parameter})${returns} {\n  return ${CreateFunctionName(schema.$id)}(value)\n}`
            : `return ${functionCode}`;
        return [...variables, ...functions, checkFunction].join('\n');
    }
    /** Generates the code used to assert this type and returns it as a string */
    function Code(...args) {
        const defaults = { language: 'javascript' };
        // prettier-ignore
        const [schema, references, options] = (args.length === 2 && (0, index_12.IsArray)(args[1]) ? [args[0], args[1], defaults] :
            args.length === 2 && !(0, index_12.IsArray)(args[1]) ? [args[0], [], args[1]] :
                args.length === 3 ? [args[0], args[1], args[2]] :
                    args.length === 1 ? [args[0], [], defaults] :
                        [null, [], defaults]);
        // compiler-reset
        state.language = options.language;
        state.variables.clear();
        state.functions.clear();
        state.instances.clear();
        if (!(0, type_1.IsSchema)(schema))
            throw new TypeCompilerTypeGuardError(schema);
        for (const schema of references)
            if (!(0, type_1.IsSchema)(schema))
                throw new TypeCompilerTypeGuardError(schema);
        return Build(schema, references, options);
    }
    TypeCompiler.Code = Code;
    /** Compiles a TypeBox type for optimal runtime type checking. Types must be valid TypeBox types of TSchema */
    function Compile(schema, references = []) {
        const generatedCode = Code(schema, references, { language: 'javascript' });
        const compiledFunction = globalThis.Function('kind', 'format', 'hash', generatedCode);
        const instances = new Map(state.instances);
        function typeRegistryFunction(kind, instance, value) {
            if (!index_8.TypeRegistry.Has(kind) || !instances.has(instance))
                return false;
            const checkFunc = index_8.TypeRegistry.Get(kind);
            const schema = instances.get(instance);
            return checkFunc(schema, value);
        }
        function formatRegistryFunction(format, value) {
            if (!index_8.FormatRegistry.Has(format))
                return false;
            const checkFunc = index_8.FormatRegistry.Get(format);
            return checkFunc(value);
        }
        function hashFunction(value) {
            return (0, index_6.Hash)(value);
        }
        const checkFunction = compiledFunction(typeRegistryFunction, formatRegistryFunction, hashFunction);
        return new TypeCheck(schema, references, checkFunction, generatedCode);
    }
    TypeCompiler.Compile = Compile;
})(TypeCompiler || (exports.TypeCompiler = TypeCompiler = {}));
