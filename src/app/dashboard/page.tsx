"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Activity, 
  Pill, 
  FileText, 
  BarChart3, 
  LogOut, 
  Plus,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import DoseModule from './components/DoseModule';
import SymptomsModule from './components/SymptomsModule';
import ReportsModule from './components/ReportsModule';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDoses: 0,
    lastDose: null as string | null,
    symptomsLogged: 0,
    reportsCreated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const currentUser = await auth.getUser();
    
    if (!currentUser) {
      router.push('/');
      return;
    }

    setUser(currentUser);

    // Carregar estatísticas
    const [dosesResult, symptomsResult, reportsResult] = await Promise.all([
      supabase
        .from('dose_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id)
        .order('dose_date', { ascending: false })
        .limit(1),
      supabase
        .from('symptom_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id),
      supabase
        .from('progress_reports')
        .select('*', { count: 'exact' })
        .eq('user_id', currentUser.id),
    ]);

    setStats({
      totalDoses: dosesResult.count || 0,
      lastDose: dosesResult.data?.[0]?.dose_date || null,
      symptomsLogged: symptomsResult.count || 0,
      reportsCreated: reportsResult.count || 0,
    });

    setIsLoading(false);
  };

  const handleLogout = async () => {
    await auth.signOut();
    toast.success('Logout realizado com sucesso');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mx-auto animate-pulse">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">GLP-Guide</h1>
                <p className="text-sm text-gray-400">Olá, {user?.user_metadata?.full_name || 'Usuário'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-400 hover:text-gray-300"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Total de Doses</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{stats.totalDoses}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <Pill className="h-4 w-4" />
                <span>Registradas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Última Dose</CardDescription>
              <CardTitle className="text-3xl text-gray-100">
                {stats.lastDose ? new Date(stats.lastDose).toLocaleDateString('pt-BR') : '-'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Calendar className="h-4 w-4" />
                <span>Data</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Sintomas</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{stats.symptomsLogged}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-orange-400">
                <AlertCircle className="h-4 w-4" />
                <span>Registrados</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-400">Relatórios</CardDescription>
              <CardTitle className="text-3xl text-gray-100">{stats.reportsCreated}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-purple-400">
                <TrendingUp className="h-4 w-4" />
                <span>Criados</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules Tabs */}
        <Tabs defaultValue="doses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger 
              value="doses" 
              className="data-[state=active]:bg-slate-800 text-gray-300 flex items-center gap-2"
            >
              <Pill className="h-4 w-4" />
              <span className="hidden sm:inline">Doses</span>
            </TabsTrigger>
            <TabsTrigger 
              value="symptoms" 
              className="data-[state=active]:bg-slate-800 text-gray-300 flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Sintomas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reports" 
              className="data-[state=active]:bg-slate-800 text-gray-300 flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doses" className="space-y-4">
            <DoseModule userId={user?.id} onUpdate={loadUserData} />
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-4">
            <SymptomsModule userId={user?.id} onUpdate={loadUserData} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsModule userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
