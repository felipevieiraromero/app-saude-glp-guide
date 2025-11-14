"use client";

import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { COMMON_SYMPTOMS, type SymptomLog } from '@/lib/types';

interface SymptomsModuleProps {
  userId: string;
  onUpdate: () => void;
}

export default function SymptomsModule({ userId, onUpdate }: SymptomsModuleProps) {
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSymptoms();
  }, [userId]);

  const loadSymptoms = async () => {
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false })
      .limit(10);

    if (error) {
      toast.error('Erro ao carregar sintomas');
      return;
    }

    setSymptoms(data || []);
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSymptoms.length === 0) {
      toast.error('Selecione pelo menos um sintoma');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('symptom_logs').insert({
      user_id: userId,
      symptoms: selectedSymptoms,
      severity,
      notes: notes || null,
      logged_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('Erro ao registrar sintomas', {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success('Sintomas registrados com sucesso!');
    setIsOpen(false);
    setSelectedSymptoms([]);
    setSeverity('low');
    setNotes('');
    loadSymptoms();
    onUpdate();
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('symptom_logs').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao deletar registro');
      return;
    }

    toast.success('Registro deletado');
    loadSymptoms();
    onUpdate();
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'low':
        return 'text-green-400 bg-green-950/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-950/20';
      case 'high':
        return 'text-red-400 bg-red-950/20';
      default:
        return 'text-gray-400 bg-gray-950/20';
    }
  };

  const getSeverityLabel = (sev: string) => {
    switch (sev) {
      case 'low':
        return 'Leve';
      case 'medium':
        return 'Moderado';
      case 'high':
        return 'Severo';
      default:
        return sev;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Registro de Sintomas</h2>
          <p className="text-gray-400">Monitore efeitos colaterais</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Novo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-gray-100 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Sintomas</DialogTitle>
              <DialogDescription className="text-gray-400">
                Selecione os sintomas que você está sentindo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sintomas Comuns */}
              <div className="space-y-3">
                <Label>Sintomas</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                        className="border-slate-700"
                      />
                      <label
                        htmlFor={symptom}
                        className="text-sm text-gray-300 cursor-pointer"
                      >
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Severidade */}
              <div className="space-y-3">
                <Label>Intensidade</Label>
                <RadioGroup value={severity} onValueChange={(value: any) => setSeverity(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" className="border-slate-700" />
                    <label htmlFor="low" className="text-sm text-gray-300 cursor-pointer">
                      Leve
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" className="border-slate-700" />
                    <label htmlFor="medium" className="text-sm text-gray-300 cursor-pointer">
                      Moderado
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" className="border-slate-700" />
                    <label htmlFor="high" className="text-sm text-gray-300 cursor-pointer">
                      Severo
                    </label>
                  </div>
                </RadioGroup>
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="symptom-notes">Observações (opcional)</Label>
                <Textarea
                  id="symptom-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-slate-800 border-slate-700"
                  rows={3}
                  placeholder="Descreva como você está se sentindo..."
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Sintomas'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Sintomas */}
      <div className="space-y-3">
        {symptoms.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhum sintoma registrado ainda</p>
              <p className="text-sm text-gray-500 mt-2">Clique em "Novo Registro" para começar</p>
            </CardContent>
          </Card>
        ) : (
          symptoms.map((symptom) => (
            <Card key={symptom.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(symptom.severity)}`}>
                          {getSeverityLabel(symptom.severity)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(symptom.logged_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {symptom.symptoms.map((s) => (
                          <span key={s} className="text-sm bg-slate-800 text-gray-300 px-2 py-1 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                      {symptom.notes && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{symptom.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(symptom.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
