import { IIdent, INumber, IRef, IString, IConst, ITuple, IUnion } from './types';
/** Returns true if the value is a Tuple Parser */
export declare function IsTuple(value: unknown): value is ITuple;
/** Returns true if the value is a Union Parser */
export declare function IsUnion(value: unknown): value is IUnion;
/** Returns true if the value is a Const Parser */
export declare function IsConst(value: unknown): value is IConst;
/** Returns true if the value is a Ident Parser */
export declare function IsIdent(value: unknown): value is IIdent;
/** Returns true if the value is a Number Parser */
export declare function IsNumber(value: unknown): value is INumber;
/** Returns true if the value is a Ref Parser */
export declare function IsRef(value: unknown): value is IRef;
/** Returns true if the value is a String Parser */
export declare function IsString(value: unknown): value is IString;
/** Returns true if the value is a Parser */
export declare function IsParser(value: unknown): value is IUnion<unknown> | ITuple<unknown> | IConst<unknown> | IIdent<unknown> | INumber<unknown> | IRef<unknown> | IString<unknown>;
