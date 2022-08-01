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
     * wa-sqlite driver
     */
    readonly module: SQLiteModule;

    /**
     * Database name
     */
    readonly name: string;
}
