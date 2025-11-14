"use client";

import { useState, useEffect } from 'react';
import { Calendar, Activity, Pill, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { DoseLog, SymptomLog } from '@/lib/types';

interface ReportsModuleProps {
  userId: string;
}

interface TimelineEvent {
  id: string;
  type: 'dose' | 'symptom';
  date: string;
  time?: string;
  data: DoseLog | SymptomLog;
}

export default function ReportsModule({ userId }: ReportsModuleProps) {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [userId]);

  const loadTimeline = async () => {
    setIsLoading(true);

    const [dosesResult, symptomsResult] = await Promise.all([
      supabase
        .from('dose_logs')
        .select('*')
        .eq('user_id', userId)
        .order('dose_date', { ascending: false })
        .order('dose_time', { ascending: false })
        .limit(20),
      supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(20),
    ]);

    if (dosesResult.error || symptomsResult.error) {
      toast.error('Erro ao carregar relatórios');
      setIsLoading(false);
      return;
    }

    // Combinar e ordenar eventos
    const events: TimelineEvent[] = [
      ...(dosesResult.data || []).map((dose) => ({
        id: dose.id,
        type: 'dose' as const,
        date: dose.dose_date,
        time: dose.dose_time,
        data: dose,
      })),
      ...(symptomsResult.data || []).map((symptom) => ({
        id: symptom.id,
        type: 'symptom' as const,
        date: new Date(symptom.logged_at).toISOString().split('T')[0],
        time: new Date(symptom.logged_at).toTimeString().slice(0, 5),
        data: symptom,
      })),
    ];

    // Ordenar por data e hora
    events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
      return dateB.getTime() - dateA.getTime();
    });

    setTimeline(events);
    setIsLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'Leve';
      case 'medium':
        return 'Moderado';
      case 'high':
        return 'Severo';
      default:
        return severity;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="py-12 text-center">
          <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-400">Carregando relatórios...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-100">Linha do Tempo</h2>
        <p className="text-gray-400">Histórico completo de doses e sintomas</p>
      </div>

      {timeline.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum registro ainda</p>
            <p className="text-sm text-gray-500 mt-2">
              Comece registrando suas doses e sintomas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800" />

          {/* Eventos */}
          <div className="space-y-6">
            {timeline.map((event, index) => {
              const isLastItem = index === timeline.length - 1;

              return (
                <div key={event.id} className="relative pl-14">
                  {/* Ícone na linha do tempo */}
                  <div
                    className={`absolute left-0 h-12 w-12 rounded-xl flex items-center justify-center ${
                      event.type === 'dose'
                        ? 'bg-gradient-to-br from-emerald-500 to-blue-600'
                        : 'bg-gradient-to-br from-orange-500 to-red-600'
                    }`}
                  >
                    {event.type === 'dose' ? (
                      <Pill className="h-6 w-6 text-white" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-white" />
                    )}
                  </div>

                  {/* Card do evento */}
                  <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {event.type === 'dose' ? 'Dose Registrada' : 'Sintomas Registrados'}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('pt-BR')}
                          {event.time && (
                            <>
                              <span>•</span>
                              {event.time}
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {event.type === 'dose' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Medicamento:</span>
                            <span className="text-gray-100 font-medium">
                              {(event.data as DoseLog).medication_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Dosagem:</span>
                            <span className="text-gray-100 font-medium">
                              {(event.data as DoseLog).dose_amount} {(event.data as DoseLog).dose_unit}
                            </span>
                          </div>
                          {(event.data as DoseLog).notes && (
                            <p className="text-sm text-gray-400 mt-2">
                              {(event.data as DoseLog).notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Intensidade:</span>
                            <span className={`font-medium ${getSeverityColor((event.data as SymptomLog).severity)}`}>
                              {getSeverityLabel((event.data as SymptomLog).severity)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400 block mb-2">Sintomas:</span>
                            <div className="flex flex-wrap gap-2">
                              {(event.data as SymptomLog).symptoms.map((symptom) => (
                                <span
                                  key={symptom}
                                  className="text-sm bg-slate-800 text-gray-300 px-2 py-1 rounded"
                                >
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                          {(event.data as SymptomLog).notes && (
                            <p className="text-sm text-gray-400 mt-2">
                              {(event.data as SymptomLog).notes}
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
