import { Router } from "express";
import { db } from "./db.js";

const router = Router();

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mock Auth endpoint (since we don't have real auth yet)
router.post("/auth/login", (req, res) => {
  const { company_code, email, password } = req.body;
  
  const company = db.prepare('SELECT * FROM companies WHERE company_code = ?').get(company_code) as any;
  if (!company) {
    return res.status(401).json({ error: "Código de empresa inválido" });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ? AND company_id = ? AND password = ?').get(email, company.id, password) as any;
  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  // Update last login
  db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

  // Don't send password back
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, company });
});

// Register Admin
router.post("/auth/register-admin", (req, res) => {
  const { nombre, email, password, nombre_empresa } = req.body;

  try {
    // Basic validation
    if (!nombre || !email || !password || !nombre_empresa) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    // Check if email exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    // Generate unique IDs and company code
    const companyId = `comp_${Date.now()}`;
    const userId = `usr_${Date.now()}`;
    const companyCode = `CAPA${Math.floor(1000 + Math.random() * 9000)}`;

    // Use transaction
    const insertAdmin = db.transaction(() => {
      db.prepare('INSERT INTO companies (id, company_code, nombre) VALUES (?, ?, ?)').run(companyId, companyCode, nombre_empresa);
      db.prepare('INSERT INTO users (id, company_id, email, nombre, password, rol) VALUES (?, ?, ?, ?, ?, ?)').run(userId, companyId, email, nombre, password, 'admin');
      // Create empty context profile
      db.prepare('INSERT INTO context_profiles (id, company_id) VALUES (?, ?)').run(`ctx_${Date.now()}`, companyId);
    });

    insertAdmin();

    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId);
    const user = db.prepare('SELECT id, company_id, email, nombre, rol, estado FROM users WHERE id = ?').get(userId);

    res.json({ user, company });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register User
router.post("/auth/register-user", (req, res) => {
  const { company_code, nombre, email, password } = req.body;

  try {
    if (!company_code || !nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const company = db.prepare('SELECT id FROM companies WHERE company_code = ?').get(company_code) as any;
    if (!company) {
      return res.status(400).json({ error: "Código de empresa inválido" });
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const userId = `usr_${Date.now()}`;
    db.prepare('INSERT INTO users (id, company_id, email, nombre, password, rol) VALUES (?, ?, ?, ?, ?, ?)').run(userId, company.id, email, nombre, password, 'user');

    const fullCompany = db.prepare('SELECT * FROM companies WHERE id = ?').get(company.id);
    const user = db.prepare('SELECT id, company_id, email, nombre, rol, estado FROM users WHERE id = ?').get(userId);

    res.json({ user, company: fullCompany });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Actions
router.get("/actions", (req, res) => {
  try {
    const actions = db.prepare('SELECT * FROM corrective_actions ORDER BY created_at DESC').all();
    res.json(actions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Tasks
router.get("/all-tasks", (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT ap.*, ca.tipo_evento, ca.severidad_confirmada_admin, u.nombre as responsable
      FROM action_plans ap
      JOIN corrective_actions ca ON ap.corrective_action_id = ca.id
      LEFT JOIN users u ON ap.responsable_user_id = u.id
      ORDER BY ap.fecha_compromiso ASC
    `).all();
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create Corrective Action
router.post("/actions", (req, res) => {
  const { company_id, tipo_evento, area, fecha_deteccion, descripcion_evento, severidad_propuesta_ia, severidad_confirmada_admin, justificacion_admin, created_by } = req.body;

  try {
    const actionId = `ac_${Date.now()}`;
    const snapshotId = `snap_${Date.now()}`;

    const insertAction = db.transaction(() => {
      db.prepare(`
        INSERT INTO corrective_actions 
        (id, company_id, tipo_evento, area, fecha_deteccion, descripcion_evento, severidad_propuesta_ia, severidad_confirmada_admin, justificacion_admin, estado, created_by) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'abierta', ?)
      `).run(actionId, company_id, tipo_evento, area, fecha_deteccion, descripcion_evento, severidad_propuesta_ia, severidad_confirmada_admin, justificacion_admin, created_by);

      // Create snapshot (copy of current context profile)
      const contextProfile = db.prepare('SELECT * FROM context_profiles WHERE company_id = ?').get(company_id) || {};
      db.prepare(`
        INSERT INTO action_context_snapshots (id, corrective_action_id, company_id, snapshot_json)
        VALUES (?, ?, ?, ?)
      `).run(snapshotId, actionId, company_id, JSON.stringify(contextProfile));
    });

    insertAction();
    res.json({ success: true, actionId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Analysis Blocks
router.get("/actions/:id/analysis", (req, res) => {
  const { id } = req.params;
  try {
    const blocks = db.prepare('SELECT * FROM analysis_blocks WHERE corrective_action_id = ?').all(id);
    res.json(blocks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Save Analysis Block
router.post("/actions/:id/analysis", (req, res) => {
  const { id } = req.params;
  const { tipo, contenido_json, generado_por } = req.body;
  
  try {
    const existing = db.prepare('SELECT id FROM analysis_blocks WHERE corrective_action_id = ? AND tipo = ?').get(id, tipo) as any;
    
    if (existing) {
      db.prepare(`
        UPDATE analysis_blocks 
        SET contenido_json = ?, generado_por = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(JSON.stringify(contenido_json), generado_por, existing.id);
    } else {
      db.prepare(`
        INSERT INTO analysis_blocks (id, corrective_action_id, tipo, contenido_json, generado_por)
        VALUES (?, ?, ?, ?, ?)
      `).run(`blk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, id, tipo, JSON.stringify(contenido_json), generado_por);
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Finalize Analysis
router.post("/actions/:id/finalize-analysis", (req, res) => {
  const { id } = req.params;
  try {
    db.prepare(`UPDATE corrective_actions SET estado = 'en_ejecucion' WHERE id = ?`).run(id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Users for a company
router.get("/users", (req, res) => {
  const company_id = req.headers['x-company-id'];
  try {
    const users = db.prepare('SELECT id, nombre, email, rol FROM users WHERE company_id = ?').all(company_id);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get action plans for a corrective action
router.get("/actions/:id/plans", (req, res) => {
  try {
    const plans = db.prepare(`
      SELECT ap.*, u.nombre as responsable_nombre 
      FROM action_plans ap
      LEFT JOIN users u ON ap.responsable_user_id = u.id
      WHERE ap.corrective_action_id = ?
    `).all(req.params.id);
    
    // Fetch evidences for each plan
    const plansWithEvidences = plans.map((plan: any) => {
      const evidences = db.prepare('SELECT * FROM evidences WHERE action_plan_id = ? ORDER BY uploaded_at DESC').all(plan.id);
      return { ...plan, evidences };
    });

    res.json(plansWithEvidences);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create action plan
router.post("/actions/:id/plans", (req, res) => {
  const { descripcion, responsable_user_id, fecha_compromiso } = req.body;
  try {
    const id = 'ap_' + Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO action_plans (id, corrective_action_id, descripcion, responsable_user_id, fecha_compromiso)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, req.params.id, descripcion, responsable_user_id, fecha_compromiso);
    res.json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload evidence (User)
router.post("/action_plans/:id/evidence", (req, res) => {
  const { tipo, metadata, storage_ref, uploaded_by, comentarios } = req.body;
  try {
    const id = 'ev_' + Math.random().toString(36).substr(2, 9);
    db.prepare(`
      INSERT INTO evidences (id, action_plan_id, tipo, metadata, storage_ref, uploaded_by, comentario_admin)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, tipo, metadata, storage_ref, uploaded_by, comentarios || null);
    
    // Update action plan status to 'en_revision'
    db.prepare(`UPDATE action_plans SET estado = 'en_revision' WHERE id = ?`).run(req.params.id);
    
    res.json({ id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Validate evidence (Admin)
router.post("/evidences/:id/validate", (req, res) => {
  const { estado, comentario, admin_id } = req.body; // estado: 'aprobada' | 'rechazada'
  try {
    db.prepare(`
      UPDATE evidences 
      SET validacion_admin_estado = ?, comentario_admin = ? 
      WHERE id = ?
    `).run(estado, comentario, req.params.id);

    const evidence = db.prepare('SELECT action_plan_id FROM evidences WHERE id = ?').get(req.params.id) as any;
    
    if (estado === 'aprobada') {
      db.prepare(`UPDATE action_plans SET estado = 'completada' WHERE id = ?`).run(evidence.action_plan_id);
    } else {
      db.prepare(`UPDATE action_plans SET estado = 'rechazada' WHERE id = ?`).run(evidence.action_plan_id);
    }

    // Check if all action plans for the corrective action are completed
    const plan = db.prepare('SELECT corrective_action_id FROM action_plans WHERE id = ?').get(evidence.action_plan_id) as any;
    const allPlans = db.prepare('SELECT estado FROM action_plans WHERE corrective_action_id = ?').all(plan.corrective_action_id) as any[];
    
    const allCompleted = allPlans.length > 0 && allPlans.every(p => p.estado === 'completada');
    if (allCompleted) {
       db.prepare(`UPDATE corrective_actions SET estado = 'cerrada' WHERE id = ?`).run(plan.corrective_action_id);
       
       // Add to audit log
       const auditId = 'al_' + Math.random().toString(36).substr(2, 9);
       const action = db.prepare('SELECT company_id FROM corrective_actions WHERE id = ?').get(plan.corrective_action_id) as any;
       db.prepare(`
         INSERT INTO audit_log (id, company_id, entidad, entidad_id, accion, actor_user_id)
         VALUES (?, ?, 'corrective_action', ?, 'cierre_automatico', ?)
       `).run(auditId, action.company_id, plan.corrective_action_id, admin_id || 'system');
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks for a specific user
router.get("/users/:id/tasks", (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT ap.*, ca.tipo_evento, ca.descripcion_evento, ca.severidad_confirmada_admin
      FROM action_plans ap
      JOIN corrective_actions ca ON ap.corrective_action_id = ca.id
      WHERE ap.responsable_user_id = ?
      ORDER BY ap.fecha_compromiso ASC
    `).all(req.params.id);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
