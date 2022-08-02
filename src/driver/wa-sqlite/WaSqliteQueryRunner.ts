import { QueryRunnerAlreadyReleasedError } from "../../error/QueryRunnerAlreadyReleasedError"
import { AbstractSqliteQueryRunner } from "../sqlite-abstract/AbstractSqliteQueryRunner"
import { WaSqliteDriver } from "./WaSqliteDriver"
import { Broadcaster } from "../../subscriber/Broadcaster"
import { DriverPackageNotInstalledError } from "../../error/DriverPackageNotInstalledError"
import { QueryFailedError } from "../../error/QueryFailedError"
import { QueryResult } from "../../query-runner/QueryResult"

/**
 * Runs queries on a single sqlite database connection.
 */
export class WaSqliteQueryRunner extends AbstractSqliteQueryRunner {
    /**
     * Database driver used by connection.
     */
    driver: WaSqliteDriver

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(driver: WaSqliteDriver) {
        super()
        this.driver = driver
        this.connection = driver.connection
        this.broadcaster = new Broadcaster(this)
    }

    // -------------------------------------------------------------------------
    // Public methods
    // -------------------------------------------------------------------------

    /**
     * Called before migrations are run.
     */
    async beforeMigration(): Promise<void> {
        await this.query(`PRAGMA foreign_keys = OFF`)
    }

    /**
     * Called after migrations are run.
     */
    async afterMigration(): Promise<void> {
        await this.query(`PRAGMA foreign_keys = ON`)
    }

    /**
     * Executes a given SQL query.
     */
    async query(
        query: string,
        parameters: any[] = [],
        useStructuredResult = false,
    ): Promise<any> {
        if (this.isReleased) throw new QueryRunnerAlreadyReleasedError()

        const databaseConnection = this.driver.databaseConnection
        const sqlite3 = await this.driver.sqlite3Promise
        const SQLite = this.driver.SQLite;
        if (SQLite === undefined) {
            throw new DriverPackageNotInstalledError('wa-sqlite', 'wa-sqlite');
        }

        this.driver.connection.logger.logQuery(query, parameters, this)
        const queryStartTime = +new Date()
        let statement: any

        try {
            const isInsert = query.startsWith('INSERT ')

            const queryStr = sqlite3.str_value(sqlite3.str_new(databaseConnection, query));
            statement = (await sqlite3.prepare_v2(
                databaseConnection,
                queryStr,
            ))?.stmt
            if (parameters) {
                parameters = parameters.map((p) =>
                    typeof p !== "undefined" ? p : null,
                )

                sqlite3.bind_collection(statement, parameters)
            }

            // log slow queries if maxQueryExecution time is set
            const maxQueryExecutionTime =
                this.driver.options.maxQueryExecutionTime
            const queryEndTime = +new Date()
            const queryExecutionTime = queryEndTime - queryStartTime
            if (
                maxQueryExecutionTime &&
                queryExecutionTime > maxQueryExecutionTime
            )
                this.driver.connection.logger.logQuerySlow(
                    queryExecutionTime,
                    query,
                    parameters,
                    this,
                )

            const records: any[] = []

            const columnNames = sqlite3.column_names(statement);

            while (await sqlite3.step(statement) === SQLite.SQLITE_ROW) {
                const obj: any = {};
                const row = sqlite3.row(statement)
                for (let i = 0; i < columnNames.length; i++) {
                    obj[columnNames[i]] = row[i]
                }
                records.push(obj)
            }

            const changes = sqlite3.changes(databaseConnection)

            await sqlite3.finalize(statement)
            statement = undefined

            if (isInsert) {
                await sqlite3.exec(databaseConnection, `SELECT last_insert_rowid()`, (row, columns) => {
                    records.push(row[0])
                });
            }

            const result = new QueryResult()

            result.affected = changes;
            result.records = records
            result.raw = records

            if (useStructuredResult) {
                return result
            } else {
                return result.raw
            }
        } catch (e) {
            if (statement) {
                await sqlite3.finalize(statement)
            }

            this.driver.connection.logger.logQueryError(
                e,
                query,
                parameters,
                this,
            )
            throw new QueryFailedError(query, parameters, e)
        }
    }
}
