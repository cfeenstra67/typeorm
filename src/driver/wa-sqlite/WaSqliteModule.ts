
export interface WaSqliteModule {
  module: SQLiteModule;
  ready: Promise<void>;
}

let syncModule: WaSqliteModule | undefined = undefined;

export const WaSqliteModule: () => WaSqliteModule = () => {
  if (syncModule === undefined) {
    const mod = require(`wa-sqlite/dist/wa-sqlite.js`)
    const ready = new Promise<void>((resolve) => {
      mod.postRun = () => resolve(undefined)
    })
    syncModule = { module: mod, ready }
  }
  return syncModule
}

let asyncModule: WaSqliteModule | undefined = undefined;

export const WaSqliteAsyncModule: () => WaSqliteModule = () => {
  if (asyncModule === undefined) {
    const mod = require('wa-sqlite/dist/wa-sqlite-async.js')
    const ready = new Promise<void>((resolve) => {
      mod.postRun = () => resolve(undefined)
    })
    asyncModule = { module: mod, ready }
  }
  return asyncModule
}
