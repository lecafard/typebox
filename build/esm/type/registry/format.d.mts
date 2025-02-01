export type FormatRegistryValidationFunction = (value: string) => boolean;
export declare const Entries: () => Map<string, FormatRegistryValidationFunction>;
export declare const Clear: () => void;
export declare const Delete: (format: string) => boolean;
export declare const Has: (format: string) => boolean;
export declare const Set: (format: string, func: FormatRegistryValidationFunction) => void;
export declare const Get: (format: string) => FormatRegistryValidationFunction | undefined;
