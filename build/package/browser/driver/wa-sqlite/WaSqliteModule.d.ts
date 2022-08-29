export interface WaSqliteModule {
    module: SQLiteModule;
    ready: Promise<void>;
}
export declare const WaSqliteModule: () => WaSqliteModule;
export declare const WaSqliteAsyncModule: () => WaSqliteModule;
