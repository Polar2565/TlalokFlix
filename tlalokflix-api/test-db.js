const { sql, getPool } = require("./src/db");

(async () => {
  try {
    const pool = await getPool();
    const r = await pool.request().query("SELECT 1 AS ok");
    console.log("SQL OK:", r.recordset[0].ok);
  } catch (e) {
    console.log("SQL FAIL:", e.message);
  } finally {
    try {
      await sql.close();
    } catch {}
    process.exit(0);
  }
})();
