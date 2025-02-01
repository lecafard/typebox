"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = exports.Set = exports.Has = exports.Delete = exports.Clear = exports.Entries = void 0;

const base_1 = require("./base");
const ConvertRegistry = new base_1.BaseRegistry();
exports.Entries = ConvertRegistry.Entries;
exports.Clear = ConvertRegistry.Clear;
exports.Delete = ConvertRegistry.Delete;
exports.Has = ConvertRegistry.Has;
exports.Set = ConvertRegistry.Set;
exports.Get = ConvertRegistry.Get;
