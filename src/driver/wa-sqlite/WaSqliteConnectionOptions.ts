import { BaseDataSourceOptions } from "../../data-source/BaseDataSourceOptions"

/**
 * wa-sqlite-specific connection options.
 */
export interface WaSqliteConnectionOptions extends BaseDataSourceOptions {
    /**
     * Database type.
     */
    readonly type: "wa-sqlite"

    /**
     * wa-sqlite module
     */
    readonly module?: SQLiteModule;

    /**
     * Specify whether you want to use the async wa-sqlite module
     * rather than the sync one. If `module` is set, this is ignored.
     */
    readonly isAsync?: boolean;

    /**
     * Database name
     */
    readonly database: string;
}
