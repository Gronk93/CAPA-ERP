import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, LogIn, LayoutDashboard, FileText, Settings, LogOut, Plus, AlertTriangle, CheckCircle, Clock, Bell, User as UserIcon, Users, BarChart2, History, ChevronRight, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import ActionAnalysis from './components/ActionAnalysis';
import ActionPlanAdmin from './components/ActionPlanAdmin';
import UserLayout from './components/UserLayout';
import UserDashboard from './components/UserDashboard';
import UserActionTask from './components/UserActionTask';
import UsersList from './components/UsersList';
import AllTasksList from './components/AllTasksList';
import CapaLogo from './components/CapaLogo';

type User = { id: string; company_id: string; email: string; nombre: string; rol: 'admin' | 'user' };
type Company = { id: string; company_code: string; nombre: string };

// --- Auth Context Mock ---
let currentUser: User | null = null;
let currentCompany: Company | null = null;

// --- Components ---

function Login({ onLogin }: { onLogin: (user: User, company: Company) => void }) {
  const [view, setView] = useState<'login' | 'register-admin' | 'register-user'>('login');
  
  // Form states
  const [code, setCode] = useState('DEMO123');
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('123456');
  const [nombre, setNombre] = useState('');
  const [nombreEmpresa, setNombreEmpresa] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let endpoint = '/api/auth/login';
      let payload: any = { email, password };

      if (view === 'login') {
        payload.company_code = code;
      } else if (view === 'register-admin') {
        endpoint = '/api/auth/register-admin';
        payload = { nombre, email, password, nombre_empresa: nombreEmpresa };
      } else if (view === 'register-user') {
        endpoint = '/api/auth/register-user';
        payload = { company_code: code, nombre, email, password };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error en la operación');
      
      onLogin(data.user, data.company);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="text-center">
          <CapaLogo className="mx-auto h-20 w-auto" />
          <p className="mt-2 text-sm text-slate-600">
            {view === 'login' && 'Acceso corporativo seguro'}
            {view === 'register-admin' && 'Registro de nueva empresa'}
            {view === 'register-user' && 'Registro de usuario'}
          </p>
        </div>

        {view === 'login' && (
          <div className="flex space-x-4 mb-6">
            <button onClick={() => setView('register-admin')} className="flex-1 py-2 px-4 border border-indigo-600 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors">
              Registrar Empresa
            </button>
            <button onClick={() => setView('register-user')} className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
              Ingresar como Usuario
            </button>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">{error}</div>}
          
          <div className="space-y-4">
            {(view === 'login' || view === 'register-user') && (
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-slate-700">Código de Empresa</label>
                <input id="code" type="text" required value={code} onChange={e => setCode(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            )}

            {view === 'register-admin' && (
              <div>
                <label htmlFor="nombreEmpresa" className="block text-sm font-medium text-slate-700">Nombre de la Empresa</label>
                <input id="nombreEmpresa" type="text" required value={nombreEmpresa} onChange={e => setNombreEmpresa(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            )}

            {(view === 'register-admin' || view === 'register-user') && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                <input id="nombre" type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
              <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
              <input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
            {loading ? 'Procesando...' : (view === 'login' ? 'Ingresar al Sistema' : 'Registrarse')}
          </button>

          {view !== 'login' && (
            <div className="text-center mt-4">
              <button type="button" onClick={() => setView('login')} className="text-sm text-indigo-600 hover:text-indigo-500">
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Layout({ children, user, onLogout }: { children: React.ReactNode, user: User | null, onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const linkClass = (path: string) => `w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive(path) ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">
        <div className="p-4 flex items-center justify-center border-b border-slate-800">
          <CapaLogo className="h-12 w-auto" variant="sidebar" />
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Principal</p>
          <button onClick={() => navigate('/')} className={linkClass('/')}>
            <LayoutDashboard className="mr-3 h-5 w-5" /> Dashboard General
          </button>
          <button onClick={() => navigate('/actions')} className={linkClass('/actions')}>
            <FileText className="mr-3 h-5 w-5" /> Acciones Correctivas
          </button>
          <button onClick={() => navigate('/all-tasks')} className={linkClass('/all-tasks')}>
            <CheckCircle className="mr-3 h-5 w-5" /> Todas las Tareas
          </button>
          
          {currentUser?.rol === 'admin' && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administración</p>
              </div>
              <button onClick={() => navigate('/settings')} className={linkClass('/settings')}>
                <ShieldAlert className="mr-3 h-5 w-5" /> Mapa Industrial
              </button>
              <button onClick={() => navigate('/users')} className={linkClass('/users')}>
                <Users className="mr-3 h-5 w-5" /> Usuarios
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <BarChart2 className="mr-3 h-5 w-5" /> Reportes
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <History className="mr-3 h-5 w-5" /> Bitácora
              </button>
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="mr-3 h-5 w-5" /> Configuración
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm z-0">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-slate-800">{currentCompany?.nombre}</span>
            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {currentCompany?.company_code}
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-slate-400 hover:text-slate-500 relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-slate-700">{currentUser?.nombre}</span>
                <span className="text-xs text-slate-500 capitalize">{currentUser?.rol}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {currentUser?.nombre.charAt(0)}
              </div>
              <button onClick={onLogout} className="ml-2 text-slate-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// --- Mock Data for Charts ---
const severityData = [
  { name: 'Crítico', value: 3, color: '#ef4444' },
  { name: 'Alto', value: 5, color: '#f97316' },
  { name: 'Medio', value: 8, color: '#eab308' },
  { name: 'Bajo', value: 12, color: '#3b82f6' },
];

const eventTypeData = [
  { name: 'Accidente', count: 4 },
  { name: 'Calidad', count: 10 },
  { name: 'Normativo', count: 3 },
  { name: 'Equipo', count: 6 },
  { name: 'Auditoría', count: 5 },
];

const areaData = [
  { name: 'Producción', count: 12 },
  { name: 'Mantenimiento', count: 8 },
  { name: 'Logística', count: 5 },
  { name: 'Calidad', count: 3 },
];

const responsibleData = [
  { name: 'Juan P.', count: 6 },
  { name: 'Ana M.', count: 5 },
  { name: 'Carlos R.', count: 4 },
  { name: 'Luis T.', count: 3 },
];

function Dashboard() {
  const [actions, setActions] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<'critical' | 'delayed' | 'completed' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/actions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActions(data);
        } else {
          console.error("Expected array of actions, got:", data);
          setActions([]);
        }
      })
      .catch(err => {
        console.error(err);
        setActions([]);
      });
  }, []);

  const filteredActions = actions.filter(action => {
    if (activeFilter === 'critical') return action.severidad_confirmada_admin === 'Crítico';
    if (activeFilter === 'delayed') return action.estado === 'en_ejecucion'; // Simplified for now, real logic would check dates
    if (activeFilter === 'completed') return action.estado === 'cerrada';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'abierta': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Abierta</span>;
      case 'en_ejecucion': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">En Ejecución</span>;
      case 'cerrada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Cerrada</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'Crítico': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{severity}</span>;
      case 'Alto': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{severity}</span>;
      case 'Medio': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{severity}</span>;
      case 'Bajo': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{severity}</span>;
      default: return <span>{severity}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard General</h1>
        <p className="text-sm text-slate-500 mt-1">Resumen de indicadores y estado de acciones correctivas.</p>
      </div>
      
      {/* KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setActiveFilter(activeFilter === 'critical' ? null : 'critical')}
          className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer transition-all ${activeFilter === 'critical' ? 'border-red-500 ring-2 ring-red-200' : 'border-red-100 hover:border-red-300'} relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-50 rounded-full opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Acciones Críticas</h3>
              <p className="mt-2 text-4xl font-bold text-red-600">3</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-red-600 font-medium relative z-10 flex items-center">
            <span>Requieren atención inmediata</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter(activeFilter === 'delayed' ? null : 'delayed')}
          className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer transition-all ${activeFilter === 'delayed' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-amber-100 hover:border-amber-300'} relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-50 rounded-full opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Retrasadas</h3>
              <p className="mt-2 text-4xl font-bold text-amber-500">5</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-amber-600 font-medium relative z-10 flex items-center">
            <span>Fuera de tiempo de compromiso</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveFilter(activeFilter === 'completed' ? null : 'completed')}
          className={`bg-white p-6 rounded-xl shadow-sm border cursor-pointer transition-all ${activeFilter === 'completed' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-emerald-100 hover:border-emerald-300'} relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cumplidas (Mes)</h3>
              <p className="mt-2 text-4xl font-bold text-emerald-600">28</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-emerald-600 font-medium relative z-10 flex items-center">
            <span>+12% respecto al mes anterior</span>
          </div>
        </div>
      </div>

      {activeFilter ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-lg font-medium text-slate-900">
              {activeFilter === 'critical' && 'Acciones Críticas'}
              {activeFilter === 'delayed' && 'Acciones Retrasadas'}
              {activeFilter === 'completed' && 'Acciones Cumplidas (Mes)'}
            </h3>
            <button 
              onClick={() => setActiveFilter(null)}
              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              Volver al resumen
            </button>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Evento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No se encontraron acciones para este filtro.
                  </td>
                </tr>
              ) : (
                filteredActions.map((action) => (
                  <tr key={action.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{action.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{action.tipo_evento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getSeverityBadge(action.severidad_confirmada_admin)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getStatusBadge(action.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(action.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {action.estado === 'abierta' && (
                        <button onClick={() => navigate(`/actions/${action.id}/analysis`)} className="text-indigo-600 hover:text-indigo-900">
                          Analizar
                        </button>
                      )}
                      {action.estado === 'en_ejecucion' && (
                        <>
                          <button onClick={() => navigate(`/actions/${action.id}/analysis`)} className="text-slate-600 hover:text-slate-900">
                            Análisis
                          </button>
                          <button onClick={() => navigate(`/actions/${action.id}/plan`)} className="text-amber-600 hover:text-amber-900">
                            Plan de Acción
                          </button>
                        </>
                      )}
                      {action.estado === 'cerrada' && (
                        <button onClick={() => navigate(`/actions/${action.id}/plan`)} className="text-emerald-600 hover:text-emerald-900">
                          Ver Plan
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Charts Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severidad */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Distribución por Severidad</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`${value} Acciones`, 'Cantidad']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {severityData.map(item => (
              <div key={item.name} className="flex items-center text-xs text-slate-600">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>

        {/* Tipo de Evento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Acciones por Tipo de Evento</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking Área */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Top Áreas con más Acciones</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={90} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ranking Responsable */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-6">Top Responsables</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={responsibleData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={70} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

function ActionsList() {
  const navigate = useNavigate();
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/actions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setActions(data);
        } else {
          console.error("Expected array of actions, got:", data);
          setActions([]);
        }
      })
      .catch(err => {
        console.error(err);
        setActions([]);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'abierta': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Abierta</span>;
      case 'en_ejecucion': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">En Ejecución</span>;
      case 'cerrada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Cerrada</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'Crítico': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{severity}</span>;
      case 'Alto': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">{severity}</span>;
      case 'Medio': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">{severity}</span>;
      case 'Bajo': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{severity}</span>;
      default: return <span>{severity}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Acciones Correctivas</h1>
        <button onClick={() => navigate('/actions/new')} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium">
          <Plus className="h-4 w-4 mr-2" /> Nueva Acción
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Evento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {actions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No se encontraron acciones correctivas. Crea una nueva para comenzar.
                </td>
              </tr>
            ) : (
              actions.map((action) => (
                <tr key={action.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{action.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{action.tipo_evento}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getSeverityBadge(action.severidad_confirmada_admin)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getStatusBadge(action.estado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(action.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    {action.estado === 'abierta' && (
                      <button onClick={() => navigate(`/actions/${action.id}/analysis`)} className="text-indigo-600 hover:text-indigo-900">
                        Analizar
                      </button>
                    )}
                    {action.estado === 'en_ejecucion' && (
                      <>
                        <button onClick={() => navigate(`/actions/${action.id}/analysis`)} className="text-slate-600 hover:text-slate-900">
                          Análisis
                        </button>
                        <button onClick={() => navigate(`/actions/${action.id}/plan`)} className="text-amber-600 hover:text-amber-900">
                          Plan de Acción
                        </button>
                      </>
                    )}
                    {action.estado === 'cerrada' && (
                      <button onClick={() => navigate(`/actions/${action.id}/plan`)} className="text-emerald-600 hover:text-emerald-900">
                        Ver Plan
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionWizard() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Form State
  const [tipoEvento, setTipoEvento] = useState('');
  const [area, setArea] = useState('');
  const [fechaDeteccion, setFechaDeteccion] = useState('');
  const [descripcion, setDescripcion] = useState('');
  
  // IA & Severity State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [severidadIA, setSeveridadIA] = useState('');
  const [severidadConfirmada, setSeveridadConfirmada] = useState('');
  const [justificacion, setJustificacion] = useState('');
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdActionId, setCreatedActionId] = useState('');

  const eventTypes = [
    'Accidente Laboral', 'Desviación de Calidad', 'Incumplimiento Normativo',
    'Falla de Equipo Crítico', 'Reclamo de Cliente', 'Hallazgo de Auditoría',
    'Incidente Ambiental', 'Otro'
  ];

  const handleNext = () => {
    if (step === 2) {
      // Simulate IA Analysis
      setIsAnalyzing(true);
      setStep(3);
      setTimeout(() => {
        setSeveridadIA('Alto');
        setSeveridadConfirmada('Alto');
        setIsAnalyzing(false);
      }, 2000);
    } else if (step === 3) {
      submitAction();
    } else {
      setStep(s => s + 1);
    }
  };

  const submitAction = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: currentCompany?.id,
          tipo_evento: tipoEvento,
          area,
          fecha_deteccion: fechaDeteccion,
          descripcion_evento: descripcion,
          severidad_propuesta_ia: severidadIA,
          severidad_confirmada_admin: severidadConfirmada,
          justificacion_admin: justificacion,
          created_by: currentUser?.id
        })
      });
      const data = await res.json();
      if (data.success) {
        setCreatedActionId(data.actionId);
        setStep(4);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = tipoEvento !== '';
  const isStep2Valid = area !== '' && fechaDeteccion !== '' && descripcion !== '';
  const isStep3Valid = severidadConfirmada !== '' && (severidadConfirmada === severidadIA || justificacion !== '');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Apertura de Acción Correctiva</h1>
        {step < 4 && (
          <button onClick={() => navigate('/actions')} className="text-sm text-slate-500 hover:text-slate-700">
            Cancelar
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
          <div style={{ width: `${(step / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"></div>
        </div>
        <div className="flex justify-between text-xs font-medium text-slate-500">
          <span className={step >= 1 ? 'text-indigo-600' : ''}>1. Tipo de Evento</span>
          <span className={step >= 2 ? 'text-indigo-600' : ''}>2. Datos Básicos</span>
          <span className={step >= 3 ? 'text-indigo-600' : ''}>3. Severidad (IA)</span>
          <span className={step >= 4 ? 'text-indigo-600' : ''}>4. Generación</span>
        </div>
      </div>

      {/* Wizard Content */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
        {step === 1 && (
          <div className="flex-1 space-y-6">
            <h2 className="text-lg font-medium text-slate-900 border-b pb-2">Seleccionar Tipo de Evento</h2>
            <p className="text-sm text-slate-500">Seleccione la categoría que mejor describa el evento ocurrido.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTipoEvento(type)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    tipoEvento === type 
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${tipoEvento === type ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {type}
                    </span>
                    {tipoEvento === type && <CheckCircle className="h-5 w-5 text-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 space-y-6">
            <h2 className="text-lg font-medium text-slate-900 border-b pb-2">Datos Básicos del Evento</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Área / Proceso</label>
                <input 
                  type="text" 
                  value={area}
                  onChange={e => setArea(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  placeholder="Ej. Línea de Producción 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Fecha de Detección</label>
                <input 
                  type="date" 
                  value={fechaDeteccion}
                  onChange={e => setFechaDeteccion(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700">Descripción Inicial</label>
                <textarea 
                  rows={5} 
                  value={descripcion}
                  onChange={e => setDescripcion(e.target.value)}
                  className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  placeholder="Describa detalladamente qué sucedió, cómo se detectó y cualquier acción inmediata tomada..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 space-y-6">
            <h2 className="text-lg font-medium text-slate-900 border-b pb-2">Evaluación de Severidad</h2>
            
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-indigo-600 font-medium">La IA está analizando el evento y el contexto de la empresa...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <ShieldAlert className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-indigo-900">Propuesta de la IA</h3>
                      <p className="mt-1 text-sm text-indigo-700">
                        Basado en el tipo de evento ({tipoEvento}) y la descripción proporcionada, cruzado con el perfil industrial de la empresa, la IA sugiere una severidad:
                      </p>
                      <div className="mt-4 inline-flex items-center px-4 py-2 rounded-md bg-white border border-indigo-200 shadow-sm">
                        <span className="text-lg font-bold text-indigo-700 uppercase tracking-wider">{severidadIA}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <h3 className="text-base font-medium text-slate-900">Confirmación del Administrador</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Severidad Final</label>
                    <select 
                      value={severidadConfirmada}
                      onChange={e => setSeveridadConfirmada(e.target.value)}
                      className="mt-1 block w-full md:w-1/2 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
                    >
                      <option value="Bajo">Bajo</option>
                      <option value="Medio">Medio</option>
                      <option value="Alto">Alto</option>
                      <option value="Crítico">Crítico</option>
                    </select>
                  </div>
                  
                  {severidadConfirmada !== severidadIA && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-medium text-slate-700">Justificación del Cambio <span className="text-red-500">*</span></label>
                      <textarea 
                        rows={3} 
                        value={justificacion}
                        onChange={e => setJustificacion(e.target.value)}
                        className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                        placeholder="Explique por qué se modifica la severidad propuesta por la IA..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-6">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">¡Acción Generada Exitosamente!</h2>
              <p className="mt-2 text-slate-500">
                Se ha creado el registro <span className="font-mono font-medium text-slate-700">{createdActionId}</span> en estado <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Abierta</span>.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                El Snapshot Contextual inmutable ha sido guardado para garantizar la trazabilidad.
              </p>
            </div>
            <div className="pt-6">
              <button 
                onClick={() => navigate(`/actions/${createdActionId}/analysis`)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Iniciar Análisis Estructurado <ChevronRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        {step < 4 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || isAnalyzing || isSubmitting}
              className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button 
              onClick={handleNext}
              disabled={
                (step === 1 && !isStep1Valid) || 
                (step === 2 && !isStep2Valid) || 
                (step === 3 && !isStep3Valid) ||
                isAnalyzing || isSubmitting
              }
              className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? 'Generando...' : step === 3 ? 'Generar Acción Correctiva' : 'Siguiente'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">Configuración de Contexto (Paso 0)</h1>
      <p className="text-slate-500">Sube documentos de tu empresa para que la IA genere un perfil contextual. Este perfil se usará para analizar las Acciones Correctivas.</p>
      
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <span className="mt-2 block text-sm font-medium text-slate-900">
            Arrastra documentos aquí o haz clic para seleccionar
          </span>
          <span className="mt-1 block text-xs text-slate-500">
            PDF, Word, Excel, TXT hasta 10MB
          </span>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-slate-900 border-b pb-2 mb-4">Perfil Contextual Actual</h3>
          <div className="bg-slate-50 rounded-md p-4 text-sm text-slate-500 text-center">
            Aún no se ha generado un perfil contextual. Sube documentos para comenzar.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (user: User, company: Company) => {
    currentUser = user;
    currentCompany = company;
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    currentUser = null;
    currentCompany = null;
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      {currentUser?.rol === 'user' ? (
        <UserLayout user={currentUser} onLogout={handleLogout}>
          <Routes>
            <Route path="/user" element={<UserDashboard user={currentUser} />} />
            <Route path="/user/tasks/:id" element={<UserActionTask user={currentUser} />} />
            <Route path="*" element={<Navigate to="/user" replace />} />
          </Routes>
        </UserLayout>
      ) : (
        <Layout user={currentUser} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/actions" element={<ActionsList />} />
            <Route path="/all-tasks" element={<AllTasksList />} />
            <Route path="/actions/new" element={<ActionWizard />} />
            <Route path="/actions/:id/analysis" element={<ActionAnalysis />} />
            <Route path="/actions/:id/plan" element={<ActionPlanAdmin user={currentUser} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/users" element={<UsersList />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </BrowserRouter>
  );
}
