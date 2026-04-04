require("dotenv").config();
const sql = require("mssql/msnodesqlv8");

// Windows Auth por ODBC usando connectionString
const config = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};" +
    "Server=JAVIER;" +
    "Database=TlalokFlix;" +
    "Trusted_Connection=Yes;" +
    "TrustServerCertificate=Yes;",
};

let poolPromise = null;

async function getPool() {
  if (!poolPromise) poolPromise = sql.connect(config);
  return poolPromise;
}

module.exports = { sql, getPool };
