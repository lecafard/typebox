"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRegistry = void 0;
/** A base registry class */
class BaseRegistry {
    constructor() {
        this.map = new Map;
        /** Returns the entries in this registry */
        this.Entries = () => {
            return new Map(this.map);
        };
        /** Clears all user defined string formats */
        this.Clear = () => {
            return this.map.clear();
        };
        /** Deletes a registered format */
        this.Delete = (format) => {
            return this.map.delete(format);
        };
        /** Returns true if the user defined string format exists */
        this.Has = (format) => {
            return this.map.has(format);
        };
        /** Sets a validation function for a user defined string format */
        this.Set = (format, func) => {
            this.map.set(format, func);
        };
        /** Gets a validation function for a user defined string format */
        this.Get = (format) => {
            return this.map.get(format);
        };
    }
}
exports.BaseRegistry = BaseRegistry;
