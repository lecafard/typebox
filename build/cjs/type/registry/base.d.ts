/** A base registry class */
export declare class BaseRegistry<Fn extends Function> {
    private readonly map;
    /** Returns the entries in this registry */
    Entries: () => Map<string, Fn>;
    /** Clears all user defined string formats */
    Clear: () => void;
    /** Deletes a registered format */
    Delete: (format: string) => boolean;
    /** Returns true if the user defined string format exists */
    Has: (format: string) => boolean;
    /** Sets a validation function for a user defined string format */
    Set: (format: string, func: Fn) => void;
    /** Gets a validation function for a user defined string format */
    Get: (format: string) => Fn | undefined;
}
