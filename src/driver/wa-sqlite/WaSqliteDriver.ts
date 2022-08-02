import type * as SQLite from 'wa-sqlite';

import { DataSource } from "../../data-source/DataSource"
import { DriverPackageNotInstalledError } from "../../error/DriverPackageNotInstalledError"
import { QueryRunner } from "../../query-runner/QueryRunner"
import { AbstractSqliteDriver } from "../sqlite-abstract/AbstractSqliteDriver"
import { ColumnType } from "../types/ColumnTypes"
import { ReplicationMode } from "../types/ReplicationMode"
import { WaSqliteConnectionOptions } from "./WaSqliteConnectionOptions"
import { WaSqliteModule, WaSqliteAsyncModule } from "./WaSqliteModule"
import { WaSqliteQueryRunner } from "./WaSqliteQueryRunner"

export class WaSqliteDriver extends AbstractSqliteDriver {
    // The driver specific options.
    options: WaSqliteConnectionOptions


    SQLite: typeof SQLite | undefined;

    private readyPromise: Promise<void>
    sqlite3Promise: Promise<SQLiteAPI>;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(connection: DataSource) {
        super(connection)

        this.readyPromise = Promise.resolve()
        this.sqlite3Promise = Promise.reject(new Error('dependencies not loaded'))
        // load sqlite module
        this.loadDependencies()
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    /**
     * Performs connection to the database.
     */
    async connect(): Promise<void> {
        await this.readyPromise
        this.databaseConnection = await this.createDatabaseConnection()
    }

    /**
     * Closes connection with database.
     */
    async disconnect(): Promise<void> {
        this.queryRunner = undefined
        const sqlite3 = await this.sqlite3Promise
        await sqlite3.close(this.databaseConnection);
    }

    /**
     * Creates a query runner used to execute database queries.
     */
    createQueryRunner(mode: ReplicationMode): QueryRunner {
        if (!this.queryRunner) this.queryRunner = new WaSqliteQueryRunner(this)

        return this.queryRunner
    }


    normalizeType(column: {
        type?: ColumnType
        length?: number | string
        precision?: number | null
        scale?: number
    }): string {
        if ((column.type as any) === Buffer) {
            return "blob"
        }

        return super.normalizeType(column)
    }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Creates connection with the database.
     * If the location option is set, the database is loaded first.
     */
    protected async createDatabaseConnection(): Promise<any> {
        const sqlite3 = await this.sqlite3Promise
        this.databaseConnection = await sqlite3.open_v2(this.options.database);
        await sqlite3.exec(this.databaseConnection, `PRAGMA foreign_keys = ON`)
        return this.databaseConnection;
    }

    /**
     * Load wa-sqlite package
     */
    protected loadDependencies(): void {
        const SQLite = require('wa-sqlite')
        this.SQLite = SQLite
        if (this.SQLite === undefined) {
            throw new DriverPackageNotInstalledError('wa-sqlite', 'wa-sqlite');
        }
        let mod = this.options.module;
        if (mod === undefined) {
            const factory = this.options.isAsync ? WaSqliteAsyncModule : WaSqliteModule
            const { module: newMod, ready } = factory()
            mod = newMod
            this.readyPromise = ready
        }
        // Avoid this being raised as an unhandled rejection later
        this.sqlite3Promise.catch(() => {})
        this.sqlite3Promise = this.readyPromise.then(() => SQLite.Factory(mod))
    }
}
