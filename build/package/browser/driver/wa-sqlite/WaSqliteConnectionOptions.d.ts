import { BaseDataSourceOptions } from "../../data-source/BaseDataSourceOptions";
/**
 * wa-sqlite-specific connection options.
 */
export interface WaSqliteConnectionOptions extends BaseDataSourceOptions {
    /**
     * Database type.
     */
    readonly type: "wa-sqlite";
    /**
     * wa-sqlite module
     */
    readonly module?: SQLiteModule;
    /**
     * wa-sqlite driver, fully baked
     */
    readonly driver?: SQLiteAPI;
    /**
     * Specify whether you want to use the async wa-sqlite module
     * rather than the sync one. If `module` or `driver` are set
     * this is ignored.
     */
    readonly async?: boolean;
    /**
     * Specify the virtual filesystem to use as the backend for wa-sqlite
     * valid options are:
     * - memory
     * - memory-async (requires async: true)
     * - idb-minimal (requires async: true)
     * - idb-batch-atomic (requires async: true)
     */
    readonly vfs?: string;
    /**
     * Flags to use when calling sqlite_open_v2
     */
    readonly flags?: number;
    /**
     * Database name
     */
    readonly database: string;
}
