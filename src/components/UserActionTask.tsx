import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

export default function UserActionTask({ user }: { user: any }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${user.id}/tasks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((t: any) => t.id === id);
          setTask(found);
        } else {
          console.error("Expected array of tasks, got:", data);
          setTask(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, user.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      // Simulate file upload to storage
      const storageRef = `evidence/${id}/${file.name}`;
      
      await fetch(`/api/action_plans/${id}/evidence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: file.type,
          metadata: file.name,
          storage_ref: storageRef,
          uploaded_by: user.id,
          comentarios
        })
      });
      
      // Refresh task
      navigate('/user');
    } catch (error) {
      console.error('Error uploading evidence:', error);
    } finally {
      setUploading(false);
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

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando tarea...</div>;
  if (!task) return <div className="p-8 text-center text-red-500">Tarea no encontrada.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/user')}
        className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver al Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{task.descripcion}</h1>
            <p className="text-sm text-slate-500 mt-1">Evento: {task.tipo_evento}</p>
          </div>
          <div>
            {getStatusBadge(task.estado)}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Fecha Compromiso</h3>
            <p className="text-base text-slate-900 font-medium">
              {new Date(task.fecha_compromiso).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Severidad del Evento</h3>
            <p className="text-base text-slate-900 font-medium">{task.severidad_confirmada_admin}</p>
          </div>
        </div>

        {task.estado === 'pendiente' || task.estado === 'rechazada' ? (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Subir Evidencia</h3>
            
            {task.estado === 'rechazada' && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Evidencia rechazada por el administrador</p>
                  <p className="text-xs mt-1">Por favor, revisa los comentarios y vuelve a subir la evidencia correcta.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Archivo de Evidencia</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-indigo-500 transition-colors bg-white">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <span>Seleccionar archivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                      </label>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, PDF hasta 10MB</p>
                    {file && <p className="text-sm font-medium text-indigo-600 mt-2">{file.name}</p>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comentarios Adicionales</label>
                <textarea 
                  rows={3}
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe la evidencia adjunta..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={!file || uploading}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : 'Enviar Evidencia'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-6 border-t border-slate-200 bg-slate-50 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Evidencia Enviada</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
              {task.estado === 'en_revision' 
                ? 'Tu evidencia está siendo revisada por el administrador. Te notificaremos cuando sea aprobada.' 
                : 'La evidencia ha sido aprobada y la tarea está completada.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
