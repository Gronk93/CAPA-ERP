import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Shield, Key, UserX, CheckCircle, XCircle } from 'lucide-react';

// Extended User type for this view
export type UserExtended = {
  id: string;
  company_id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'user';
  estado: 'activo' | 'inactivo';
  created_at: string;
  last_login: string | null;
};

// Mock data
const mockUsers: UserExtended[] = [
  {
    id: 'u1',
    company_id: 'c1',
    email: 'admin@demo.com',
    nombre: 'Admin Principal',
    rol: 'admin',
    estado: 'activo',
    created_at: '2023-01-15T10:00:00Z',
    last_login: '2023-10-25T08:30:00Z'
  },
  {
    id: 'u2',
    company_id: 'c1',
    email: 'user@demo.com',
    nombre: 'Usuario Operador',
    rol: 'user',
    estado: 'activo',
    created_at: '2023-02-20T14:15:00Z',
    last_login: '2023-10-24T16:45:00Z'
  },
  {
    id: 'u3',
    company_id: 'c1',
    email: 'inactivo@demo.com',
    nombre: 'Usuario Antiguo',
    rol: 'user',
    estado: 'inactivo',
    created_at: '2022-11-05T09:20:00Z',
    last_login: '2023-05-12T11:10:00Z'
  }
];

export default function UsersList() {
  const [users, setUsers] = useState<UserExtended[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentUser, setCurrentUser] = useState<Partial<UserExtended>>({});
  
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<UserExtended | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.rol === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.estado === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to create user
    const newUser: UserExtended = {
      id: `u${Date.now()}`,
      company_id: 'c1',
      email: currentUser.email || '',
      nombre: currentUser.nombre || '',
      rol: currentUser.rol as 'admin' | 'user' || 'user',
      estado: 'activo',
      created_at: new Date().toISOString(),
      last_login: null
    };
    setUsers([...users, newUser]);
    setIsModalOpen(false);
    setCurrentUser({});
  };

  const handleToggleStatus = (userId: string) => {
    // Check if trying to deactivate last admin
    const userToToggle = users.find(u => u.id === userId);
    if (userToToggle?.rol === 'admin' && userToToggle.estado === 'activo') {
      const activeAdmins = users.filter(u => u.rol === 'admin' && u.estado === 'activo');
      if (activeAdmins.length <= 1) {
        alert('No puedes desactivar al último administrador activo.');
        return;
      }
    }

    setUsers(users.map(u => {
      if (u.id === userId) {
        return { ...u, estado: u.estado === 'activo' ? 'inactivo' : 'activo' };
      }
      return u;
    }));
  };

  const handleChangeRole = (userId: string, newRole: 'admin' | 'user') => {
    const userToChange = users.find(u => u.id === userId);
    if (userToChange?.rol === 'admin' && newRole === 'user') {
      const activeAdmins = users.filter(u => u.rol === 'admin' && u.estado === 'activo');
      if (activeAdmins.length <= 1) {
        alert('No puedes cambiar el rol del último administrador activo.');
        return;
      }
    }

    if (window.confirm(`¿Estás seguro de cambiar el rol a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}?`)) {
      setUsers(users.map(u => u.id === userId ? { ...u, rol: newRole } : u));
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Contraseña reseteada para ${userToReset?.email}`);
    setIsResetModalOpen(false);
    setUserToReset(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
        <button 
          onClick={() => { setModalMode('create'); setCurrentUser({ rol: 'user' }); setIsModalOpen(true); }} 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">Todos los Roles</option>
            <option value="admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
          <select
            className="border border-slate-300 rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los Estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha Creación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Último Acceso</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                    No se encontraron usuarios que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.nombre}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rol === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button 
                        onClick={() => handleChangeRole(user.id, user.rol === 'admin' ? 'user' : 'admin')}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Cambiar Rol"
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { setUserToReset(user); setIsResetModalOpen(true); }}
                        className="text-amber-600 hover:text-amber-900"
                        title="Resetear Contraseña"
                      >
                        <Key className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user.id)}
                        className={`${user.estado === 'activo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      >
                        {user.estado === 'activo' ? <UserX className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">
                {modalMode === 'create' ? 'Agregar Nuevo Usuario' : 'Editar Usuario'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={currentUser.nombre || ''}
                  onChange={(e) => setCurrentUser({...currentUser, nombre: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={currentUser.email || ''}
                  onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol Inicial</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  value={currentUser.rol || 'user'}
                  onChange={(e) => setCurrentUser({...currentUser, rol: e.target.value as 'admin' | 'user'})}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              
              {modalMode === 'create' && (
                <div className="pt-4 border-t border-slate-200">
                  <label className="flex items-center space-x-3">
                    <input type="checkbox" className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" defaultChecked />
                    <span className="text-sm text-slate-700">Generar contraseña automática y enviar por correo</span>
                  </label>
                </div>
              )}

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-900">Resetear Contraseña</h3>
              <button onClick={() => setIsResetModalOpen(false)} className="text-slate-400 hover:text-slate-500">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Estás a punto de resetear la contraseña para <strong>{userToReset?.nombre}</strong> ({userToReset?.email}).
              </p>
              
              <div className="space-y-3 pt-2">
                <label className="flex items-start space-x-3">
                  <input type="radio" name="reset_type" className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" defaultChecked />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Generación Automática</span>
                    <span className="block text-xs text-slate-500">Se generará una contraseña segura y se enviará por correo.</span>
                  </div>
                </label>
                <label className="flex items-start space-x-3">
                  <input type="radio" name="reset_type" className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                  <div>
                    <span className="block text-sm font-medium text-slate-700">Ingreso Manual</span>
                    <span className="block text-xs text-slate-500">Establece una contraseña temporal manualmente.</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700"
                >
                  Confirmar Reseteo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
