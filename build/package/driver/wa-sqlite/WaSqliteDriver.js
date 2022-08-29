"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaSqliteDriver = void 0;
const DriverPackageNotInstalledError_1 = require("../../error/DriverPackageNotInstalledError");
const AbstractSqliteDriver_1 = require("../sqlite-abstract/AbstractSqliteDriver");
const WaSqliteModule_1 = require("./WaSqliteModule");
const WaSqliteQueryRunner_1 = require("./WaSqliteQueryRunner");
class WaSqliteDriver extends AbstractSqliteDriver_1.AbstractSqliteDriver {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor(connection) {
        super(connection);
        this.readyPromise = Promise.resolve();
        this.sqlite3Promise = Promise.reject(new Error('dependencies not loaded'));
        // load sqlite module
        this.loadDependencies();
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     */
    async connect() {
        await this.readyPromise;
        this.databaseConnection = await this.createDatabaseConnection();
    }
    /**
     * Closes connection with database.
     */
    async disconnect() {
        this.queryRunner = undefined;
        const sqlite3 = await this.sqlite3Promise;
        await sqlite3.close(this.databaseConnection);
    }
    /**
     * Creates a query runner used to execute database queries.
     */
    createQueryRunner(mode) {
        if (!this.queryRunner)
            this.queryRunner = new WaSqliteQueryRunner_1.WaSqliteQueryRunner(this);
        return this.queryRunner;
    }
    normalizeType(column) {
        if (column.type === Buffer) {
            return "blob";
        }
        return super.normalizeType(column);
    }
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates connection with the database.
     * If the location option is set, the database is loaded first.
     */
    async createDatabaseConnection() {
        const sqlite3 = await this.sqlite3Promise;
        this.databaseConnection = await sqlite3.open_v2(this.options.database, this.options.flags, this.options.vfs);
        await sqlite3.exec(this.databaseConnection, `PRAGMA foreign_keys = ON`);
        return this.databaseConnection;
    }
    /**
     * Load wa-sqlite package
     */
    loadDependencies() {
        const SQLite = require('wa-sqlite');
        this.SQLite = SQLite;
        if (this.SQLite === undefined) {
            throw new DriverPackageNotInstalledError_1.DriverPackageNotInstalledError('wa-sqlite', 'wa-sqlite');
        }
        // Avoid this being raised as an unhandled rejection later
        this.sqlite3Promise.catch(() => { });
        if (this.options.driver !== undefined) {
            this.sqlite3Promise = Promise.resolve(this.options.driver);
        }
        else {
            let mod = this.options.module;
            if (mod === undefined) {
                const factory = this.options.async ? WaSqliteModule_1.WaSqliteAsyncModule : WaSqliteModule_1.WaSqliteModule;
                const { module: newMod, ready } = factory();
                mod = newMod;
                this.readyPromise = ready;
            }
            this.sqlite3Promise = this.readyPromise.then(() => SQLite.Factory(mod));
        }
    }
}
exports.WaSqliteDriver = WaSqliteDriver;

//# sourceMappingURL=WaSqliteDriver.js.map
