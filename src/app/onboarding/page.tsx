"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Pill, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase, auth } from '@/lib/supabase';
import { toast } from 'sonner';

const onboardingSteps = [
  {
    icon: Pill,
    title: 'Registre suas doses',
    description: 'Acompanhe facilmente quando e quanto você tomou do seu medicamento GLP-1.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: FileText,
    title: 'Monitore sintomas',
    description: 'Registre efeitos colaterais e sintomas para entender melhor como seu corpo reage.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Activity,
    title: 'Acompanhe seu progresso',
    description: 'Visualize sua jornada com relatórios e gráficos de evolução ao longo do tempo.',
    color: 'from-purple-500 to-purple-600',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const CurrentIcon = onboardingSteps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);

    const user = await auth.getUser();
    if (!user) {
      toast.error('Erro ao completar onboarding');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao completar onboarding', {
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast.success('Bem-vindo ao GLP-Guide!', {
      description: 'Vamos começar sua jornada de saúde.',
    });

    router.push('/dashboard');
    setIsLoading(false);
  };

  const handleSkip = async () => {
    setIsLoading(true);
    await handleComplete();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">GLP-Guide</h1>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Passo {currentStep + 1} de {onboardingSteps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>

        {/* Content Card */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`h-24 w-24 rounded-3xl bg-gradient-to-br ${onboardingSteps[currentStep].color} flex items-center justify-center shadow-2xl`}>
                  <CurrentIcon className="h-12 w-12 text-white" strokeWidth={2} />
                </div>
              </div>

              {/* Text Content */}
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-100">
                  {onboardingSteps[currentStep].title}
                </h2>
                <p className="text-lg text-gray-400 max-w-md mx-auto">
                  {onboardingSteps[currentStep].description}
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-4 pt-4">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className={`${currentStep === 0 ? 'w-full' : 'flex-1'} bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white`}
                >
                  {isLoading ? 'Carregando...' : currentStep === onboardingSteps.length - 1 ? 'Começar' : 'Próximo'}
                  {currentStep === onboardingSteps.length - 1 ? (
                    <CheckCircle className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skip Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-400"
          >
            Pular introdução
          </Button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2">
          {onboardingSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-gradient-to-r from-emerald-500 to-blue-600'
                  : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
