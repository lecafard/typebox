import { Kind } from '../symbols/index.mjs';
import type { TSchema } from '../schema/index.mjs';
import type { Static } from '../static/index.mjs';
import type { Evaluate, Ensure, Assert } from '../helpers/index.mjs';
import { type TAny } from '../any/index.mjs';
import { type TComputed } from '../computed/index.mjs';
import { type TEnumRecord, type TEnum } from '../enum/index.mjs';
import { type TInteger } from '../integer/index.mjs';
import { type TLiteral, type TLiteralValue } from '../literal/index.mjs';
import { type TNever } from '../never/index.mjs';
import { type TNumber } from '../number/index.mjs';
import { type TObject, type TProperties, type TAdditionalProperties, type ObjectOptions } from '../object/index.mjs';
import { type TRef } from '../ref/index.mjs';
import { type TRegExp } from '../regexp/index.mjs';
import { type TString } from '../string/index.mjs';
import { type TUnion } from '../union/index.mjs';
import { TIsTemplateLiteralFinite, type TTemplateLiteral } from '../template-literal/index.mjs';
type TFromTemplateLiteralKeyInfinite<Key extends TTemplateLiteral, Type extends TSchema> = Ensure<TRecord<Key, Type>>;
type TFromTemplateLiteralKeyFinite<Key extends TTemplateLiteral, Type extends TSchema, I extends string = Static<Key>> = (Ensure<TObject<Evaluate<{
    [_ in I]: Type;
}>>>);
type TFromTemplateLiteralKey<Key extends TTemplateLiteral, Type extends TSchema> = TIsTemplateLiteralFinite<Key> extends false ? TFromTemplateLiteralKeyInfinite<Key, Type> : TFromTemplateLiteralKeyFinite<Key, Type>;
type TFromEnumKey<Key extends Record<string, string | number>, Type extends TSchema> = Ensure<TObject<{
    [_ in Key[keyof Key]]: Type;
}>>;
type TFromUnionKeyLiteralString<Key extends TLiteral<string>, Type extends TSchema> = {
    [_ in Key['const']]: Type;
};
type TFromUnionKeyLiteralNumber<Key extends TLiteral<number>, Type extends TSchema> = {
    [_ in Key['const']]: Type;
};
type TFromUnionKeyRest<Keys extends TSchema[], Type extends TSchema> = Keys extends [infer Left extends TSchema, ...infer Right extends TSchema[]] ? (Left extends TUnion<infer Types extends TSchema[]> ? TFromUnionKeyRest<Types, Type> & TFromUnionKeyRest<Right, Type> : Left extends TLiteral<string> ? TFromUnionKeyLiteralString<Left, Type> & TFromUnionKeyRest<Right, Type> : Left extends TLiteral<number> ? TFromUnionKeyLiteralNumber<Left, Type> & TFromUnionKeyRest<Right, Type> : {}) : {};
type TFromUnionKey<Key extends TSchema[], Type extends TSchema, P extends TProperties = TFromUnionKeyRest<Key, Type>> = (Ensure<TObject<Evaluate<P>>>);
type TFromLiteralKey<Key extends TLiteralValue, Type extends TSchema> = (Ensure<TObject<{
    [_ in Assert<Key, PropertyKey>]: Type;
}>>);
type TFromRegExpKey<_Key extends TRegExp, Type extends TSchema> = (Ensure<TRecord<TRegExp, Type>>);
type TFromStringKey<_Key extends TString, Type extends TSchema> = (Ensure<TRecord<TString, Type>>);
type TFromAnyKey<_Key extends TAny, Type extends TSchema> = (Ensure<TRecord<TAny, Type>>);
type TFromNeverKey<_Key extends TNever, Type extends TSchema> = (Ensure<TRecord<TNever, Type>>);
type TFromIntegerKey<_Key extends TSchema, Type extends TSchema> = (Ensure<TRecord<TNumber, Type>>);
type TFromNumberKey<_Key extends TSchema, Type extends TSchema> = (Ensure<TRecord<TNumber, Type>>);
type RecordStatic<Key extends TSchema, Type extends TSchema, P extends unknown[]> = (Evaluate<{
    [_ in Assert<Static<Key>, PropertyKey>]: Static<Type, P>;
}>);
export interface TRecord<Key extends TSchema = TSchema, Type extends TSchema = TSchema> extends TSchema {
    [Kind]: 'Record';
    static: RecordStatic<Key, Type, this['params']>;
    type: 'object';
    patternProperties: {
        [pattern: string]: Type;
    };
    additionalProperties: TAdditionalProperties;
}
export type TRecordOrObject<Key extends TSchema, Type extends TSchema> = (Type extends TComputed<infer Target extends string, infer Parameters extends TSchema[]> ? TComputed<'Record', [Key, TComputed<Target, Parameters>]> : Key extends TComputed<infer Target extends string, infer Parameters extends TSchema[]> ? TComputed<'Record', [TComputed<Target, Parameters>, Type]> : Key extends TRef<infer Ref extends string> ? TComputed<'Record', [TRef<Ref>, Type]> : Key extends TTemplateLiteral ? TFromTemplateLiteralKey<Key, Type> : Key extends TEnum<infer Enum extends TEnumRecord> ? TFromEnumKey<Enum, Type> : Key extends TUnion<infer Types extends TSchema[]> ? TFromUnionKey<Types, Type> : Key extends TLiteral<infer Value extends TLiteralValue> ? TFromLiteralKey<Value, Type> : Key extends TInteger ? TFromIntegerKey<Key, Type> : Key extends TNumber ? TFromNumberKey<Key, Type> : Key extends TRegExp ? TFromRegExpKey<Key, Type> : Key extends TString ? TFromStringKey<Key, Type> : Key extends TAny ? TFromAnyKey<Key, Type> : Key extends TNever ? TFromNeverKey<Key, Type> : TNever);
/** `[Json]` Creates a Record type */
export declare function Record<Key extends TSchema, Type extends TSchema>(key: Key, type: Type, options?: ObjectOptions): TRecordOrObject<Key, Type>;
export {};
