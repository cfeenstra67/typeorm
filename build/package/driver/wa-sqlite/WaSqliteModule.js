"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaSqliteAsyncModule = exports.WaSqliteModule = void 0;
let syncModule = undefined;
const WaSqliteModule = () => {
    if (syncModule === undefined) {
        const mod = require(`wa-sqlite/dist/wa-sqlite.js`);
        const ready = new Promise((resolve) => {
            mod.postRun = () => resolve(undefined);
        });
        syncModule = { module: mod, ready };
    }
    return syncModule;
};
exports.WaSqliteModule = WaSqliteModule;
let asyncModule = undefined;
const WaSqliteAsyncModule = () => {
    if (asyncModule === undefined) {
        const mod = require('wa-sqlite/dist/wa-sqlite-async.js');
        const ready = new Promise((resolve) => {
            mod.postRun = () => resolve(undefined);
        });
        asyncModule = { module: mod, ready };
    }
    return asyncModule;
};
exports.WaSqliteAsyncModule = WaSqliteAsyncModule;

//# sourceMappingURL=WaSqliteModule.js.map
