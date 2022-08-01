import type * as SQLite from 'wa-sqlite';

import { AbstractSqliteDriver } from "../sqlite-abstract/AbstractSqliteDriver"
import { WaSqliteConnectionOptions } from "./WaSqliteConnectionOptions"
import { WaSqliteQueryRunner } from "./WaSqliteQueryRunner"
import { QueryRunner } from "../../query-runner/QueryRunner"
import { DataSource } from "../../data-source/DataSource"
import { DriverPackageNotInstalledError } from "../../error/DriverPackageNotInstalledError"
import { ReplicationMode } from "../types/ReplicationMode"

export class WaSqliteDriver extends AbstractSqliteDriver {
    // The driver specific options.
    options: WaSqliteConnectionOptions

    sqlite3: SQLiteAPI | undefined;

    SQLite: typeof SQLite | undefined;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(connection: DataSource) {
        super(connection)

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
        this.databaseConnection = await this.createDatabaseConnection()
    }

    /**
     * Closes connection with database.
     */
    async disconnect(): Promise<void> {
        this.queryRunner = undefined
        await this.sqlite3?.close(this.databaseConnection);
    }

    /**
     * Creates a query runner used to execute database queries.
     */
    createQueryRunner(mode: ReplicationMode): QueryRunner {
        if (!this.queryRunner) this.queryRunner = new WaSqliteQueryRunner(this)

        return this.queryRunner
    }

    // /**
    //  * Creates generated map of values generated or returned by database after INSERT query.
    //  */
    // createGeneratedMap(metadata: EntityMetadata, insertResult: any) {
    //     const generatedMap = metadata.generatedColumns.reduce(
    //         (map, generatedColumn) => {
    //             // seems to be the only way to get the inserted id, see https://github.com/kripken/sql.js/issues/77
    //             if (
    //                 generatedColumn.isPrimary &&
    //                 generatedColumn.generationStrategy === "increment"
    //             ) {
    //                 const query = "SELECT last_insert_rowid()"
    //                 try {
    //                     let result = this.databaseConnection.exec(query)
    //                     this.connection.logger.logQuery(query)
    //                     return OrmUtils.mergeDeep(
    //                         map,
    //                         generatedColumn.createValueMap(
    //                             result[0].values[0][0],
    //                         ),
    //                     )
    //                 } catch (e) {
    //                     this.connection.logger.logQueryError(e, query, [])
    //                 }
    //             }

    //             return map
    //         },
    //         {} as ObjectLiteral,
    //     )

    //     return Object.keys(generatedMap).length > 0 ? generatedMap : undefined
    // }

    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------

    /**
     * Creates connection with the database.
     * If the location option is set, the database is loaded first.
     */
    protected async createDatabaseConnection(): Promise<any> {
        if (this.sqlite3 === undefined) {
            throw new DriverPackageNotInstalledError('wa-sqlite', 'wa-sqlite');
        }
        this.databaseConnection = await this.sqlite3.open_v2(this.options.name);
        await this.sqlite3.exec(this.databaseConnection, `PRAGMA foreign_keys = ON`)
        return this.databaseConnection;
    }

    /**
     * Currently the driver is a required argument, so this is a no-op. It's being
     * kept as it will be implemented in the future
     */
    protected loadDependencies(): void {
        this.SQLite = require('wa-sqlite');
        if (this.SQLite === undefined) {
            throw new DriverPackageNotInstalledError('wa-sqlite', 'wa-sqlite');
        }
        this.sqlite3 = this.SQLite.Factory(this.options.module);
    }
}
