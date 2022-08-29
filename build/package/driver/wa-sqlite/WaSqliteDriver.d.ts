import type * as SQLite from 'wa-sqlite';
import { DataSource } from "../../data-source/DataSource";
import { QueryRunner } from "../../query-runner/QueryRunner";
import { AbstractSqliteDriver } from "../sqlite-abstract/AbstractSqliteDriver";
import { ColumnType } from "../types/ColumnTypes";
import { ReplicationMode } from "../types/ReplicationMode";
import { WaSqliteConnectionOptions } from "./WaSqliteConnectionOptions";
export declare class WaSqliteDriver extends AbstractSqliteDriver {
    options: WaSqliteConnectionOptions;
    SQLite: typeof SQLite | undefined;
    private readyPromise;
    sqlite3Promise: Promise<SQLiteAPI>;
    constructor(connection: DataSource);
    /**
     * Performs connection to the database.
     */
    connect(): Promise<void>;
    /**
     * Closes connection with database.
     */
    disconnect(): Promise<void>;
    /**
     * Creates a query runner used to execute database queries.
     */
    createQueryRunner(mode: ReplicationMode): QueryRunner;
    normalizeType(column: {
        type?: ColumnType;
        length?: number | string;
        precision?: number | null;
        scale?: number;
    }): string;
    /**
     * Creates connection with the database.
     * If the location option is set, the database is loaded first.
     */
    protected createDatabaseConnection(): Promise<any>;
    /**
     * Load wa-sqlite package
     */
    protected loadDependencies(): void;
}
