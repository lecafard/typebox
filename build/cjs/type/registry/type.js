"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.Set = exports.Has = exports.Delete = exports.Clear = exports.Entries = void 0;

const base_1 = require("./base");
const TypeRegistry = new base_1.BaseRegistry();
exports.Entries = TypeRegistry.Entries;
exports.Clear = TypeRegistry.Clear;
exports.Delete = TypeRegistry.Delete;
exports.Has = TypeRegistry.Has;
exports.Set = TypeRegistry.Set;
exports.Get = TypeRegistry.Get;
