import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Clock, Upload, FileText, AlertCircle } from 'lucide-react';

export default function ActionPlanAdmin({ user }: { user: any }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New task form state
  const [showForm, setShowForm] = useState(false);
  const [descripcion, setDescripcion] = useState('');
  const [responsableId, setResponsableId] = useState('');
  const [fechaCompromiso, setFechaCompromiso] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, usersRes] = await Promise.all([
        fetch(`/api/actions/${id}/plans`),
        fetch('/api/users', { headers: { 'x-company-id': user.company_id } })
      ]);
      
      const plansData = await plansRes.json();
      const usersData = await usersRes.json();
      
      setPlans(Array.isArray(plansData) ? plansData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcion || !responsableId || !fechaCompromiso) return;

    try {
      await fetch(`/api/actions/${id}/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          responsable_user_id: responsableId,
          fecha_compromiso: fechaCompromiso
        })
      });
      
      setShowForm(false);
      setDescripcion('');
      setResponsableId('');
      setFechaCompromiso('');
      fetchData();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleValidateEvidence = async (evidenceId: string, estado: 'aprobada' | 'rechazada') => {
    // In a real app, we might want to prompt for a comment
    const comentario = estado === 'rechazada' ? 'Evidencia insuficiente o incorrecta.' : 'Evidencia validada correctamente.';
    
    try {
      await fetch(`/api/evidences/${evidenceId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado, comentario, admin_id: user.id })
      });
      fetchData();
    } catch (error) {
      console.error('Error validating evidence:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pendiente': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800"><Clock className="w-3 h-3 mr-1"/> Pendiente</span>;
      case 'en_revision': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><AlertCircle className="w-3 h-3 mr-1"/> En Revisión</span>;
      case 'completada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1"/> Completada</span>;
      case 'rechazada': return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1"/> Rechazada</span>;
      default: return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando planes de acción...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Plan de Acción</h1>
          <p className="text-sm text-slate-500 mt-1">Acción Correctiva #{id}</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar Tarea
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Nueva Tarea</h3>
          <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción de la Acción</label>
              <input 
                type="text" 
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Responsable</label>
              <select 
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Seleccionar responsable...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Compromiso</label>
              <input 
                type="date" 
                value={fechaCompromiso}
                onChange={(e) => setFechaCompromiso(e.target.value)}
                className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 text-sm font-medium">
                Guardar Tarea
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Responsable</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha Compromiso</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Evidencia</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Validación</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {plans.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                  No hay tareas definidas en el plan de acción.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate" title={plan.descripcion}>
                    {plan.descripcion}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {plan.responsable_nombre || 'Sin asignar'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(plan.fecha_compromiso).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(plan.estado)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {plan.evidences && plan.evidences.length > 0 ? (
                      <div className="flex flex-col space-y-2">
                        {plan.evidences.map((ev: any) => (
                          <div key={ev.id} className="flex items-center text-xs">
                            <FileText className="w-3 h-3 mr-1 text-indigo-500" />
                            <span className="truncate w-24" title={ev.metadata}>{ev.metadata || 'Evidencia'}</span>
                            {ev.validacion_admin_estado === 'pendiente' && (
                              <span className="ml-2 w-2 h-2 bg-amber-400 rounded-full" title="Pendiente de revisión"></span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Sin evidencia</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {plan.estado === 'en_revision' && plan.evidences && plan.evidences.length > 0 && (
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleValidateEvidence(plan.evidences[0].id, 'aprobada')}
                          className="text-emerald-600 hover:text-emerald-900"
                          title="Aprobar"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleValidateEvidence(plan.evidences[0].id, 'rechazada')}
                          className="text-red-600 hover:text-red-900"
                          title="Rechazar"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {plan.estado === 'completada' && (
                      <span className="text-emerald-600 text-xs font-medium">Validada</span>
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
