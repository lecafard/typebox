"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.Set = exports.Has = exports.Delete = exports.Clear = exports.Entries = void 0;

const base_1 = require("./base");
const FormatRegistry = new base_1.BaseRegistry();
exports.Entries = FormatRegistry.Entries;
exports.Clear = FormatRegistry.Clear;
exports.Delete = FormatRegistry.Delete;
exports.Has = FormatRegistry.Has;
exports.Set = FormatRegistry.Set;
exports.Get = FormatRegistry.Get;
