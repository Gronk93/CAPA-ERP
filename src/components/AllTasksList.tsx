import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertTriangle, FileText, Search } from 'lucide-react';

export default function AllTasksList() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/all-tasks')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected array of tasks, got:", data);
          setTasks([]);
        }
      })
      .catch(err => {
        console.error(err);
        setTasks([]);
      });
  }, []);

  const filteredTasks = tasks.filter(task => 
    (task.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.responsable || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">Pendiente</span>;
      case 'en_proceso': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">En Proceso</span>;
      case 'completada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Completada</span>;
      case 'retrasada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Retrasada</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Todas las Acciones (Tareas)</h1>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por descripción o responsable..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ID Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha Compromiso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Ver Plan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No se encontraron tareas.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">{task.action_id}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{task.descripcion}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{task.responsable}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(task.fecha_compromiso).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getStatusBadge(task.estado)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/actions/${task.action_id}/plan`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Ver Plan
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
