export type TypeRegistryValidationFunction<TSchema> = (schema: TSchema, value: unknown) => boolean;
export declare const Entries: () => Map<string, TypeRegistryValidationFunction<any>>;
export declare const Clear: () => void;
export declare const Delete: (format: string) => boolean;
export declare const Has: (format: string) => boolean;
export declare const Set: (format: string, func: TypeRegistryValidationFunction<any>) => void;
export declare const Get: (format: string) => TypeRegistryValidationFunction<any> | undefined;
