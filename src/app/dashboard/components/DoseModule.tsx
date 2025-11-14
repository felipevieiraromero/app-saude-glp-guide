"use client";

import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, Pill, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { DoseLog } from '@/lib/types';

interface DoseModuleProps {
  userId: string;
  onUpdate: () => void;
}

export default function DoseModule({ userId, onUpdate }: DoseModuleProps) {
  const [doses, setDoses] = useState<DoseLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: 'Ozempic',
    dose_amount: '',
    dose_unit: 'mg',
    dose_date: new Date().toISOString().split('T')[0],
    dose_time: new Date().toTimeString().slice(0, 5),
    notes: '',
  });

  useEffect(() => {
    loadDoses();
  }, [userId]);

  const loadDoses = async () => {
    const { data, error } = await supabase
      .from('dose_logs')
      .select('*')
      .eq('user_id', userId)
      .order('dose_date', { ascending: false })
      .order('dose_time', { ascending: false })
      .limit(10);

    if (error) {
      toast.error('Erro ao carregar doses');
      return;
    }

    setDoses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.from('dose_logs').insert({
      user_id: userId,
      ...formData,
      dose_amount: parseFloat(formData.dose_amount),
    });

    if (error) {
      toast.error('Erro ao registrar dose', {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success('Dose registrada com sucesso!');
    setIsOpen(false);
    setFormData({
      medication_name: 'Ozempic',
      dose_amount: '',
      dose_unit: 'mg',
      dose_date: new Date().toISOString().split('T')[0],
      dose_time: new Date().toTimeString().slice(0, 5),
      notes: '',
    });
    loadDoses();
    onUpdate();
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('dose_logs').delete().eq('id', id);

    if (error) {
      toast.error('Erro ao deletar dose');
      return;
    }

    toast.success('Dose deletada');
    loadDoses();
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Registro de Doses</h2>
          <p className="text-gray-400">Acompanhe suas medicações</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nova Dose
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Registrar Nova Dose</DialogTitle>
              <DialogDescription className="text-gray-400">
                Adicione informações sobre sua medicação
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medicamento</Label>
                <Input
                  id="medication"
                  value={formData.medication_name}
                  onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Quantidade</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.dose_amount}
                    onChange={(e) => setFormData({ ...formData, dose_amount: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidade</Label>
                  <Input
                    id="unit"
                    value={formData.dose_unit}
                    onChange={(e) => setFormData({ ...formData, dose_unit: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.dose_date}
                    onChange={(e) => setFormData({ ...formData, dose_date: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.dose_time}
                    onChange={(e) => setFormData({ ...formData, dose_time: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  rows={3}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Salvando...' : 'Salvar Dose'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Doses */}
      <div className="space-y-3">
        {doses.length === 0 ? (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <Pill className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma dose registrada ainda</p>
              <p className="text-sm text-gray-500 mt-2">Clique em "Nova Dose" para começar</p>
            </CardContent>
          </Card>
        ) : (
          doses.map((dose) => (
            <Card key={dose.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <Pill className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-100">{dose.medication_name}</h3>
                      <p className="text-sm text-gray-400">
                        {dose.dose_amount} {dose.dose_unit}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(dose.dose_date).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dose.dose_time}
                        </span>
                      </div>
                      {dose.notes && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{dose.notes}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(dose.id)}
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
