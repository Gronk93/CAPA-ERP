import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle, Upload, FileText, XCircle } from 'lucide-react';

export default function UserDashboard({ user }: { user: any }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${user.id}/tasks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected array of tasks, got:", data);
          setTasks([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTasks([]);
        setLoading(false);
      });
  }, [user.id]);

  const activeTasks = tasks.filter(t => t.estado === 'pendiente' || t.estado === 'en_revision');
  const upcomingTasks = activeTasks.filter(t => {
    const today = new Date();
    const dueDate = new Date(t.fecha_compromiso);
    const diffTime = Math.abs(dueDate.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 7 && dueDate >= today;
  });
  const delayedTasks = activeTasks.filter(t => new Date(t.fecha_compromiso) < new Date());

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1"/> Pendiente</span>;
      case 'en_revision': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1"/> En Revisión</span>;
      case 'completada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1"/> Completada</span>;
      case 'rechazada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Rechazada</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando tus tareas...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mis Acciones</h1>
        <p className="text-slate-500 mt-2">Gestiona tus tareas asignadas y sube evidencias.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Activas</h3>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-4">{activeTasks.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Próximas a vencer (7 días)</h3>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-4">{upcomingTasks.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">Retrasadas</h3>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-4">{delayedTasks.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Tareas Pendientes</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Evento Relacionado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha Compromiso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {activeTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                  No tienes tareas pendientes. ¡Buen trabajo!
                </td>
              </tr>
            ) : (
              activeTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/user/tasks/${task.id}`)}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs truncate" title={task.descripcion}>
                    {task.descripcion}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={task.tipo_evento}>
                    {task.tipo_evento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <span className={new Date(task.fecha_compromiso) < new Date() ? 'text-red-600 font-medium' : ''}>
                      {new Date(task.fecha_compromiso).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(task.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full">
                      <Upload className="w-4 h-4 mr-1" /> Subir Evidencia
                    </button>
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
