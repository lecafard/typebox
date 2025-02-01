export type ConvertRegistryFunction<TSchema> = (schema: TSchema, value: unknown, data?: any) => unknown;
export declare const Entries: () => Map<string, ConvertRegistryFunction<any>>;
export declare const Clear: () => void;
export declare const Delete: (format: string) => boolean;
export declare const Has: (format: string) => boolean;
export declare const Set: (format: string, func: ConvertRegistryFunction<any>) => void;
export declare const Get: (format: string) => ConvertRegistryFunction<any> | undefined;
