import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, Save, BrainCircuit, AlertTriangle, ArrowRight, Check, Trash2, Plus } from 'lucide-react';

export default function ActionAnalysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stage 1: 5W2H
  const [w5h2, setW5h2] = useState({
    what: '', why: '', where: '', when: '', who: '', how: '', howMuch: ''
  });

  // Stage 2: Brainstorming
  const [ideas, setIdeas] = useState<{id: string, text: string, category: string}[]>([]);
  const [newIdea, setNewIdea] = useState('');

  // Stage 3: 6M
  const m6Categories = ['Mano de Obra', 'Método', 'Maquinaria', 'Material', 'Medición', 'Medio Ambiente'];

  // Stage 4: Root Cause and Non-Detection
  const [rootCause, setRootCause] = useState('');
  const [nonDetection, setNonDetection] = useState('');

  // Stage 5: 5 Whys
  const [whys, setWhys] = useState(['', '', '', '', '']);
  const [whysNonDetection, setWhysNonDetection] = useState(['', '', '', '', '']);

  useEffect(() => {
    // Load existing analysis blocks
    const loadAnalysis = async () => {
      try {
        const res = await fetch(`/api/actions/${id}/analysis`);
        const blocks = await res.json();
        
        if (Array.isArray(blocks)) {
          blocks.forEach((b: any) => {
            const content = JSON.parse(b.contenido_json);
            switch(b.tipo) {
              case '5w2h': setW5h2(content); break;
              case 'brainstorming': setIdeas(content); break;
              case 'root_cause': setRootCause(content.text); break;
              case 'non_detection': setNonDetection(content.text); break;
              case '5whys': setWhys(content); break;
              case '5whys_non_detection': setWhysNonDetection(content); break;
            }
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadAnalysis();
  }, [id]);

  const saveBlock = async (tipo: string, contenido: any, generado_por: 'humano' | 'ia' = 'humano') => {
    setIsSaving(true);
    try {
      await fetch(`/api/actions/${id}/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, contenido_json: contenido, generado_por })
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStage === 1) {
      await saveBlock('5w2h', w5h2);
    } else if (currentStage === 2) {
      await saveBlock('brainstorming', ideas);
    } else if (currentStage === 3) {
      await saveBlock('brainstorming', ideas); // Save categorized ideas
    } else if (currentStage === 4) {
      await saveBlock('root_cause', { text: rootCause });
      await saveBlock('non_detection', { text: nonDetection });
    } else if (currentStage === 5) {
      await saveBlock('5whys', whys);
      await saveBlock('5whys_non_detection', whysNonDetection);
    }
    setCurrentStage(s => Math.min(5, s + 1));
  };

  const finalizeAnalysis = async () => {
    await saveBlock('5whys', whys);
    await saveBlock('5whys_non_detection', whysNonDetection);
    try {
      await fetch(`/api/actions/${id}/finalize-analysis`, { method: 'POST' });
      navigate(`/actions/${id}/plan`);
    } catch (e) {
      console.error(e);
    }
  };

  const addIdea = () => {
    if (newIdea.trim()) {
      setIdeas([...ideas, { id: `idea_${Date.now()}`, text: newIdea.trim(), category: 'Sin Clasificar' }]);
      setNewIdea('');
    }
  };

  const removeIdea = (ideaId: string) => {
    setIdeas(ideas.filter(i => i.id !== ideaId));
  };

  const analyzeIdeasWithAI = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Simulate AI categorization
      const categorized = ideas.map(idea => {
        const randomCategory = m6Categories[Math.floor(Math.random() * m6Categories.length)];
        return { ...idea, category: idea.category === 'Sin Clasificar' ? randomCategory : idea.category };
      });
      setIdeas(categorized);
      setIsAnalyzing(false);
      setCurrentStage(3);
    }, 2000);
  };

  const updateIdeaCategory = (ideaId: string, category: string) => {
    setIdeas(ideas.map(i => i.id === ideaId ? { ...i, category } : i));
  };

  const updateWhy = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    setWhys(newWhys);
  };

  const updateWhyNonDetection = (index: number, value: string) => {
    const newWhys = [...whysNonDetection];
    newWhys[index] = value;
    setWhysNonDetection(newWhys);
  };

  const is5WhysValid = whys[0].trim() !== '' && whys[1].trim() !== '' && whys[2].trim() !== '' &&
                       whysNonDetection[0].trim() !== '' && whysNonDetection[1].trim() !== '' && whysNonDetection[2].trim() !== '';

  const stages = [
    { num: 1, title: '5W2H', desc: 'Definición del problema' },
    { num: 2, title: 'Lluvia de Ideas', desc: 'Posibles causas' },
    { num: 3, title: 'Clasificación 6M', desc: 'Agrupación de causas' },
    { num: 4, title: 'Causa Raíz y No Detección', desc: 'Análisis de escape' },
    { num: 5, title: '5 Porqués', desc: 'Causa raíz y escape' }
  ];

  return (
    <div className="max-w-6xl mx-auto flex gap-8">
      {/* Sidebar Wizard */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6 px-2">Análisis Estructurado</h2>
          <div className="space-y-2">
            {stages.map(stage => (
              <button
                key={stage.num}
                onClick={() => setCurrentStage(stage.num)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-start ${
                  currentStage === stage.num 
                    ? 'bg-indigo-50 border border-indigo-100' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 ${
                  currentStage === stage.num ? 'bg-indigo-600 text-white' : 
                  currentStage > stage.num ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {currentStage > stage.num ? <Check className="h-4 w-4" /> : stage.num}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${currentStage === stage.num ? 'text-indigo-900' : 'text-slate-700'}`}>
                    {stage.title}
                  </p>
                  <p className={`text-xs ${currentStage === stage.num ? 'text-indigo-700' : 'text-slate-500'}`}>
                    {stage.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col">
          
          {/* Stage 1: 5W2H */}
          {currentStage === 1 && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900">Metodología 5W2H</h2>
                <p className="text-sm text-slate-500 mt-1">Estructure la definición del problema respondiendo a estas 7 preguntas clave.</p>
              </div>
              <div className="grid grid-cols-2 gap-6 flex-1">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700">What? (¿Qué ocurrió?)</label>
                  <textarea value={w5h2.what} onChange={e => setW5h2({...w5h2, what: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Why? (¿Por qué es un problema?)</label>
                  <textarea value={w5h2.why} onChange={e => setW5h2({...w5h2, why: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Where? (¿Dónde ocurrió?)</label>
                  <textarea value={w5h2.where} onChange={e => setW5h2({...w5h2, where: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">When? (¿Cuándo ocurrió?)</label>
                  <textarea value={w5h2.when} onChange={e => setW5h2({...w5h2, when: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Who? (¿Quién lo detectó/está involucrado?)</label>
                  <textarea value={w5h2.who} onChange={e => setW5h2({...w5h2, who: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">How? (¿Cómo ocurrió/se detectó?)</label>
                  <textarea value={w5h2.how} onChange={e => setW5h2({...w5h2, how: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">How Much? (¿Cuánto costó/afectó?)</label>
                  <textarea value={w5h2.howMuch} onChange={e => setW5h2({...w5h2, howMuch: e.target.value})} rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: Brainstorming */}
          {currentStage === 2 && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 border-b pb-4 flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Lluvia de Ideas</h2>
                  <p className="text-sm text-slate-500 mt-1">Liste todas las posibles causas sin filtrarlas aún.</p>
                </div>
                <button 
                  onClick={analyzeIdeasWithAI}
                  disabled={ideas.length === 0 || isAnalyzing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Analizando...</>
                  ) : (
                    <><BrainCircuit className="h-4 w-4 mr-2" /> Analizar con IA</>
                  )}
                </button>
              </div>
              
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newIdea}
                  onChange={e => setNewIdea(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIdea()}
                  placeholder="Escriba una posible causa y presione Enter..."
                  className="flex-1 border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button onClick={addIdea} className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700">
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {ideas.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                    No hay ideas registradas aún. Escriba arriba para comenzar.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {ideas.map((idea, index) => (
                      <li key={idea.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-medium mr-3">
                            {index + 1}
                          </span>
                          <span className="text-slate-800">{idea.text}</span>
                        </div>
                        <button onClick={() => removeIdea(idea.id)} className="text-slate-400 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Stage 3: 6M */}
          {currentStage === 3 && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900">Clasificación 6M (Diagrama de Ishikawa)</h2>
                <p className="text-sm text-slate-500 mt-1">Revise y ajuste la clasificación de las ideas en las 6 categorías.</p>
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-4 overflow-y-auto pb-4">
                {m6Categories.map(category => (
                  <div key={category} className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col">
                    <h3 className="font-semibold text-slate-800 mb-3 pb-2 border-b border-slate-200">{category}</h3>
                    <div className="flex-1 space-y-2">
                      {ideas.filter(i => i.category === category).map(idea => (
                        <div key={idea.id} className="bg-white p-3 rounded border border-slate-200 shadow-sm text-sm group relative">
                          <p className="text-slate-700 pr-6">{idea.text}</p>
                          <select 
                            value={idea.category}
                            onChange={(e) => updateIdeaCategory(idea.id, e.target.value)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-5 h-5 cursor-pointer"
                            title="Cambiar categoría"
                          >
                            {m6Categories.map(c => <option key={c} value={c}>{c}</option>)}
                            <option value="Sin Clasificar">Sin Clasificar</option>
                          </select>
                        </div>
                      ))}
                      {ideas.filter(i => i.category === category).length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-4">Sin causas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {ideas.filter(i => i.category === 'Sin Clasificar').length > 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">Ideas sin clasificar:</h3>
                  <div className="flex flex-wrap gap-2">
                    {ideas.filter(i => i.category === 'Sin Clasificar').map(idea => (
                      <div key={idea.id} className="bg-white px-3 py-1 rounded-full border border-amber-300 text-sm flex items-center gap-2">
                        <span>{idea.text}</span>
                        <select 
                          value={idea.category}
                          onChange={(e) => updateIdeaCategory(idea.id, e.target.value)}
                          className="text-xs border-none bg-transparent focus:ring-0 py-0 pl-1 pr-6 text-amber-700 font-medium"
                        >
                          <option value="Sin Clasificar">Asignar...</option>
                          {m6Categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 4: Root Cause and Non-Detection */}
          {currentStage === 4 && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900">Análisis de Causa Raíz y No Detección</h2>
                <p className="text-sm text-slate-500 mt-1">Describa la causa raíz del problema y por qué no fue detectado antes de llegar al cliente o siguiente proceso.</p>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Conclusión de Causa Raíz</label>
                  <textarea 
                    value={rootCause}
                    onChange={e => setRootCause(e.target.value)}
                    rows={12} 
                    className="flex-1 block w-full border border-slate-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describa la causa raíz del problema..."
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Conclusión de No Detección</label>
                  <textarea 
                    value={nonDetection}
                    onChange={e => setNonDetection(e.target.value)}
                    rows={12} 
                    className="flex-1 block w-full border border-slate-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describa la falla en los controles actuales..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stage 5: 5 Whys */}
          {currentStage === 5 && (
            <div className="p-8 flex-1 flex flex-col">
              <div className="mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-slate-900">5 Porqués</h2>
                <p className="text-sm text-slate-500 mt-1">Profundice hasta encontrar la causa raíz y la falla de detección. Se requieren al menos 3 niveles para cada uno.</p>
              </div>
              
              <div className="flex-1 grid grid-cols-2 gap-8 overflow-y-auto pb-4">
                {/* 5 Whys - Root Cause */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4 text-center">Causa Raíz</h3>
                  <div className="space-y-4">
                    {whys.map((why, index) => (
                      <div key={`rc-${index}`} className="p-4 rounded border border-slate-200 bg-slate-50 shadow-sm relative">
                        <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-700 text-sm">¿Por qué?</span>
                            {index < 3 && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">Obligatorio</span>}
                          </div>
                          <textarea 
                            value={why}
                            onChange={e => updateWhy(index, e.target.value)}
                            rows={2}
                            className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder={`¿Por qué ocurrió ${index === 0 ? 'el problema' : 'lo anterior'}?`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5 Whys - Non-Detection */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4 text-center">No Detección</h3>
                  <div className="space-y-4">
                    {whysNonDetection.map((why, index) => (
                      <div key={`nd-${index}`} className="p-4 rounded border border-slate-200 bg-slate-50 shadow-sm relative">
                        <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                          {index + 1}
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-slate-700 text-sm">¿Por qué?</span>
                            {index < 3 && <span className="text-[10px] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">Obligatorio</span>}
                          </div>
                          <textarea 
                            value={why}
                            onChange={e => updateWhyNonDetection(index, e.target.value)}
                            rows={2}
                            className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            placeholder={`¿Por qué no se detectó ${index === 0 ? 'el problema' : 'lo anterior'}?`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
            <button 
              onClick={() => setCurrentStage(s => Math.max(1, s - 1))}
              disabled={currentStage === 1}
              className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              Anterior
            </button>
            
            {currentStage < 5 ? (
              <button 
                onClick={handleNext}
                disabled={isSaving}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Guardar y Continuar'} <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={finalizeAnalysis}
                disabled={!is5WhysValid || isSaving}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? 'Finalizando...' : 'Finalizar Análisis'} <CheckCircle className="ml-2 h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
