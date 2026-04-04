const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, getPool } = require("../db");

function cleanEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function cleanName(value) {
  const text = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

  return text || null;
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user.Id), email: user.Email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || "15m" },
  );
}

function mapUser(user) {
  return {
    id: Number(user.Id),
    email: cleanEmail(user.Email),
    name: cleanName(user.Name),
  };
}

async function register(req, res) {
  try {
    const email = cleanEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const name = cleanName(req.body?.name);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y password son requeridos" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password mínimo 8 caracteres" });
    }

    const pool = await getPool();

    const exists = await pool
      .request()
      .input("Email", sql.NVarChar(510), email)
      .query("SELECT TOP 1 Id FROM dbo.Users WHERE Email = @Email");

    if (exists.recordset.length) {
      return res.status(409).json({ message: "Email ya registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await pool
      .request()
      .input("Email", sql.NVarChar(510), email)
      .input("PasswordHash", sql.NVarChar(510), passwordHash)
      .input("Name", sql.NVarChar(240), name).query(`
        INSERT INTO dbo.Users (Email, PasswordHash, Name)
        OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.Name
        VALUES (@Email, @PasswordHash, @Name)
      `);

    const user = inserted.recordset[0];
    const accessToken = signAccessToken(user);

    return res.status(201).json({
      user: mapUser(user),
      accessToken,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error en register", detail: e.message });
  }
}

async function login(req, res) {
  try {
    const email = cleanEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email y password son requeridos" });
    }

    const pool = await getPool();

    const r = await pool.request().input("Email", sql.NVarChar(510), email)
      .query(`
        SELECT TOP 1 Id, Email, PasswordHash, Name
        FROM dbo.Users
        WHERE Email = @Email
      `);

    if (!r.recordset.length) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = r.recordset[0];

    if (!user.PasswordHash) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const ok = await bcrypt.compare(password, user.PasswordHash);

    if (!ok) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const accessToken = signAccessToken(user);

    return res.json({
      user: mapUser(user),
      accessToken,
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: "Error en login", detail: e.message });
  }
}

module.exports = { register, login };
