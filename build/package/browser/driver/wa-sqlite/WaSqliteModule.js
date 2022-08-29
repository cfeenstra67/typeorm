let syncModule = undefined;
export const WaSqliteModule = () => {
    if (syncModule === undefined) {
        const mod = require(`wa-sqlite/dist/wa-sqlite.js`);
        const ready = new Promise((resolve) => {
            mod.postRun = () => resolve(undefined);
        });
        syncModule = { module: mod, ready };
    }
    return syncModule;
};
let asyncModule = undefined;
export const WaSqliteAsyncModule = () => {
    if (asyncModule === undefined) {
        const mod = require('wa-sqlite/dist/wa-sqlite-async.js');
        const ready = new Promise((resolve) => {
            mod.postRun = () => resolve(undefined);
        });
        asyncModule = { module: mod, ready };
    }
    return asyncModule;
};

//# sourceMappingURL=WaSqliteModule.js.map
