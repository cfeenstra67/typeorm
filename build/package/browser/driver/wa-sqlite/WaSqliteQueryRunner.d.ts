import { AbstractSqliteQueryRunner } from "../sqlite-abstract/AbstractSqliteQueryRunner";
import { WaSqliteDriver } from "./WaSqliteDriver";
/**
 * Runs queries on a single sqlite database connection.
 */
export declare class WaSqliteQueryRunner extends AbstractSqliteQueryRunner {
    /**
     * Database driver used by connection.
     */
    driver: WaSqliteDriver;
    constructor(driver: WaSqliteDriver);
    /**
     * Called before migrations are run.
     */
    beforeMigration(): Promise<void>;
    /**
     * Called after migrations are run.
     */
    afterMigration(): Promise<void>;
    /**
     * Removes all tables from the currently connected database.
     */
    clearDatabase(database?: string): Promise<void>;
    /**
     * Executes a given SQL query.
     */
    query(query: string, parameters?: any[], useStructuredResult?: boolean): Promise<any>;
}
