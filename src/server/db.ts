import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'database.sqlite');

export const db = new Database(dbPath);

export function initDb() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables based on the architecture
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      company_code TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      estado TEXT DEFAULT 'activo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      nombre TEXT NOT NULL,
      password TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('admin', 'user')),
      estado TEXT DEFAULT 'activo',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS context_profiles (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      industria TEXT,
      subsector TEXT,
      procesos_clave TEXT,
      riesgos TEXT,
      normativas TEXT,
      diccionario_tecnico TEXT,
      madurez TEXT,
      version INTEGER DEFAULT 1,
      updated_by TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS context_sources (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      tipo_archivo TEXT,
      nombre_original TEXT,
      fecha_carga DATETIME DEFAULT CURRENT_TIMESTAMP,
      texto_extraido TEXT,
      resumen_ia TEXT,
      estado_procesamiento TEXT,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS corrective_actions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      tipo_evento TEXT NOT NULL,
      descripcion_evento TEXT NOT NULL,
      area TEXT,
      fecha_deteccion DATETIME,
      responsable_user_id TEXT,
      severidad_propuesta_ia TEXT,
      severidad_confirmada_admin TEXT,
      justificacion_admin TEXT,
      estado TEXT DEFAULT 'abierta',
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (responsable_user_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS action_context_snapshots (
      id TEXT PRIMARY KEY,
      corrective_action_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (corrective_action_id) REFERENCES corrective_actions(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS analysis_blocks (
      id TEXT PRIMARY KEY,
      corrective_action_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      contenido_json TEXT NOT NULL,
      generado_por TEXT NOT NULL CHECK(generado_por IN ('ia', 'humano')),
      created_by TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (corrective_action_id) REFERENCES corrective_actions(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS action_plans (
      id TEXT PRIMARY KEY,
      corrective_action_id TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      responsable_email TEXT,
      responsable_user_id TEXT,
      fecha_compromiso DATETIME,
      evidencia_requerida TEXT,
      estado TEXT DEFAULT 'pendiente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (corrective_action_id) REFERENCES corrective_actions(id),
      FOREIGN KEY (responsable_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS evidences (
      id TEXT PRIMARY KEY,
      action_plan_id TEXT NOT NULL,
      tipo TEXT NOT NULL,
      metadata TEXT,
      storage_ref TEXT,
      uploaded_by TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      validacion_admin_estado TEXT DEFAULT 'pendiente',
      comentario_admin TEXT,
      FOREIGN KEY (action_plan_id) REFERENCES action_plans(id),
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      entidad TEXT NOT NULL,
      entidad_id TEXT NOT NULL,
      accion TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      actor_user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (actor_user_id) REFERENCES users(id)
    );
  `);

  // Seed initial admin and company if not exists
  const companyCount = db.prepare('SELECT COUNT(*) as count FROM companies').get() as { count: number };
  if (companyCount.count === 0) {
    db.exec(`
      INSERT INTO companies (id, company_code, nombre) VALUES ('comp_1', 'DEMO123', 'Empresa Demo S.A.');
      INSERT INTO users (id, company_id, email, nombre, password, rol) VALUES ('usr_admin1', 'comp_1', 'admin@demo.com', 'Admin Demo', '123456', 'admin');
    `);
  }
  
  // Ensure the invited user exists
  const invitedUserCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE email = 'lebasifz11@gmail.com'").get() as { count: number };
  if (invitedUserCount.count === 0) {
    db.exec(`
      INSERT INTO users (id, company_id, email, nombre, password, rol) VALUES ('usr_admin2', 'comp_1', 'lebasifz11@gmail.com', 'Usuario Invitado', '123456', 'admin');
    `);
  }

  // Add fecha_deteccion column if it doesn't exist (migration)
  try {
    db.exec("ALTER TABLE corrective_actions ADD COLUMN fecha_deteccion DATETIME;");
  } catch (e) {
    // Column already exists
  }
}
