import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import QuizBuilder from '@/components/QuizBuilder';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface QuizData {
  name: string;
  email: string;
  phone: string;
  ageRange: string;
  bodyType: string;
  stylePreferences: string;
  colorPreferences: string;
  wardrobeGoals: string;
  budgetRange: string;
  lifestyle: string;
}

const Index = () => {
  const [step, setStep] = useState(0);
  const [showAdmin, setShowAdmin] = useState(() => {
    return localStorage.getItem('showAdmin') === 'true';
  });
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  
  const [quizData, setQuizData] = useState<any>({});
  
  useEffect(() => {
    localStorage.setItem('showAdmin', showAdmin.toString());
  }, [showAdmin]);

  useEffect(() => {
    const templates = JSON.parse(localStorage.getItem('quizTemplates') || '[]');
    const savedStep = localStorage.getItem('quizStep');
    const savedData = localStorage.getItem('quizData');
    
    if (templates.length > 0) {
      setActiveQuiz(templates[0]);
      
      if (savedStep) {
        setStep(parseInt(savedStep));
      }
      
      if (savedData) {
        try {
          setQuizData(JSON.parse(savedData));
        } catch (e) {
          console.error('Error parsing saved quiz data:', e);
        }
      } else {
        const initialData: any = {};
        templates[0].questions.forEach((q: any) => {
          if (q.field) {
            initialData[q.field] = '';
          }
          if (q.fields) {
            q.fields.forEach((f: any) => {
              initialData[f.name] = '';
            });
          }
        });
        setQuizData(initialData);
      }
    } else {
      setActiveQuiz(null);
    }
  }, []);

  const questions = activeQuiz?.questions || [];
  const currentQuestion = questions[step];
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  const handleInputChange = (name: string, value: string) => {
    const updatedData = { ...quizData, [name]: value };
    setQuizData(updatedData);
    localStorage.setItem('quizData', JSON.stringify(updatedData));
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      const newStep = step + 1;
      setStep(newStep);
      localStorage.setItem('quizStep', newStep.toString());
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const newStep = step - 1;
      setStep(newStep);
      localStorage.setItem('quizStep', newStep.toString());
    }
  };

  const handleSubmit = () => {
    toast({
      title: 'Спасибо!',
      description: 'Ваши ответы сохранены. Скоро с вами свяжется стилист.'
    });
    
    const savedResponses = JSON.parse(localStorage.getItem('quizResponses') || '[]');
    savedResponses.push({
      ...quizData,
      completed_at: new Date().toISOString(),
      id: Date.now()
    });
    localStorage.setItem('quizResponses', JSON.stringify(savedResponses));
    
    const emptyData: any = {};
    if (activeQuiz?.questions) {
      activeQuiz.questions.forEach((q: any) => {
        if (q.field) {
          emptyData[q.field] = '';
        }
        if (q.fields) {
          q.fields.forEach((f: any) => {
            emptyData[f.name] = '';
          });
        }
      });
    }
    
    setQuizData(emptyData);
    setStep(0);
    localStorage.removeItem('quizData');
    localStorage.removeItem('quizStep');
  };

  const canProceed = () => {
    if (!currentQuestion) return false;
    
    if (currentQuestion.fields) {
      return currentQuestion.fields.some((f: any) => 
        f.required && quizData[f.name]?.trim()
      ) || currentQuestion.fields.every((f: any) => !f.required);
    }
    
    if (currentQuestion.type === 'radio' && currentQuestion.field) {
      return quizData[currentQuestion.field] !== '';
    }
    
    return true;
  };

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  if (!activeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md shadow-xl border-0 text-center p-8">
          <Icon name="ClipboardList" size={64} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Тест не создан
          </h1>
          <p className="text-gray-600 mb-6">
            Администратор ещё не создал тест. Пожалуйста, зайдите позже.
          </p>
          <button
            onClick={() => setShowAdmin(true)}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Вход для администратора
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6 md:mb-8 animate-fade-in px-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-2 md:mb-3">
            {activeQuiz?.name || 'Стилист-тест'}
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            {activeQuiz?.description || `Узнайте свой идеальный стиль за ${questions.length} шагов`}
          </p>
        </div>

        <Card className="shadow-xl border-0 animate-fade-in">
          <CardHeader className="space-y-3 md:space-y-4 p-4 sm:p-6">
            <div className="flex justify-between items-center gap-2">
              <CardTitle className="text-lg sm:text-xl md:text-2xl">{currentQuestion.title}</CardTitle>
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                {step + 1} / {questions.length}
              </span>
            </div>
            <CardDescription className="text-sm md:text-base">{currentQuestion.description}</CardDescription>
            
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4 md:space-y-6 p-4 sm:p-6">
            {currentQuestion.fields && (
              <div className="space-y-4">
                {currentQuestion.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name} className="text-base">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type}
                      value={quizData[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="border-gray-300"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'radio' && currentQuestion.field && (
              <RadioGroup
                value={quizData[currentQuestion.field] || ''}
                onValueChange={(value) => handleInputChange(currentQuestion.field!, value)}
                className="space-y-3"
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === 'textarea' && currentQuestion.field && (
              <div className="space-y-2">
                <Textarea
                  value={quizData[currentQuestion.field] || ''}
                  onChange={(e) => handleInputChange(currentQuestion.field!, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-32 border-gray-300 resize-none"
                />
              </div>
            )}

            <div className="flex justify-between pt-4 md:pt-6 gap-2 sm:gap-3">
              <Button
                onClick={handlePrev}
                disabled={step === 0}
                variant="outline"
                className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                size="sm"
              >
                <Icon name="ChevronLeft" size={18} className="sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Назад</span>
              </Button>

              {step < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-sm sm:text-base"
                  size="sm"
                >
                  <span className="hidden sm:inline">Далее</span>
                  <span className="sm:hidden">Далее</span>
                  <Icon name="ChevronRight" size={18} className="sm:w-5 sm:h-5" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-sm sm:text-base"
                  size="sm"
                >
                  Отправить
                  <Icon name="Send" size={18} className="sm:w-5 sm:h-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <button
          onClick={() => setShowAdmin(true)}
          className="mt-4 text-sm text-gray-400 hover:text-gray-600 mx-auto block"
        >
          Вход для администратора
        </button>
      </div>
    </div>
  );
};

const AdminPanel = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [responses, setResponses] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isAuthenticated) {
      loadResponses();
    }
  }, []);

  const handleLogin = async () => {
    if (email === 'pells1ze@gmail.com' && password === '123789456h') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      loadResponses();
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный email или пароль',
        variant: 'destructive'
      });
    }
  };

  const loadResponses = () => {
    const savedResponses = JSON.parse(localStorage.getItem('quizResponses') || '[]');
    setResponses(savedResponses);
  };

  const deleteResponse = (responseId: number) => {
    const updatedResponses = responses.filter(r => r.id !== responseId);
    setResponses(updatedResponses);
    localStorage.setItem('quizResponses', JSON.stringify(updatedResponses));
    toast({
      title: 'Удалено',
      description: 'Ответ пользователя удалён'
    });
  };

  const clearAllResponses = () => {
    setResponses([]);
    localStorage.setItem('quizResponses', '[]');
    toast({
      title: 'Очищено',
      description: 'Все ответы удалены'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl">Вход для администратора</CardTitle>
            <CardDescription>Введите данные для доступа к результатам</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Пароль</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => {
                localStorage.removeItem('showAdmin');
                onBack();
              }} variant="outline" className="flex-1">
                Назад
              </Button>
              <Button onClick={handleLogin} className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400">
                Войти
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Админ-панель</h1>
          <Button onClick={() => {
            localStorage.removeItem('adminAuth');
            localStorage.removeItem('showAdmin');
            onBack();
          }} variant="outline" size="sm">
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>

        <Tabs defaultValue="responses" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="responses" className="text-sm sm:text-base">Результаты</TabsTrigger>
            <TabsTrigger value="builder" className="text-sm sm:text-base">Конструктор</TabsTrigger>
          </TabsList>

          <TabsContent value="responses" className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <p className="text-sm text-gray-600">Всего ответов: {responses.length}</p>
              {responses.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Icon name="Trash2" size={16} className="mr-2" />
                      Очистить всё
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить все ответы?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Все ответы пользователей будут удалены безвозвратно.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllResponses} className="bg-red-600 hover:bg-red-700">
                        Удалить всё
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          {responses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Пока нет результатов</p>
            </Card>
          ) : (
            responses.map((response) => (
              <Card key={response.id} className="shadow-md">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg sm:text-xl">{response.name}</CardTitle>
                          <CardDescription className="text-xs sm:text-sm mt-1">
                            {response.email && <span className="block sm:inline">{response.email}</span>}
                            {response.phone && <span className="block sm:inline sm:ml-3">{response.phone}</span>}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(response.completed_at).toLocaleDateString('ru-RU')}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Удалить ответ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Удалить ответ пользователя {response.name}? Это действие нельзя отменить.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteResponse(response.id)} className="bg-red-600 hover:bg-red-700">
                              Удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3 sm:gap-4 p-4 sm:p-6">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Возраст</p>
                    <p className="text-sm sm:text-base">{response.ageRange}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Тип фигуры</p>
                    <p className="text-sm sm:text-base">{response.bodyType}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Бюджет</p>
                    <p className="text-sm sm:text-base">{response.budgetRange}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Стиль</p>
                    <p className="text-sm sm:text-base">{response.stylePreferences}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Цветовые предпочтения</p>
                    <p className="text-sm sm:text-base">{response.colorPreferences}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Цели по гардеробу</p>
                    <p className="text-sm sm:text-base">{response.wardrobeGoals}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Образ жизни</p>
                    <p className="text-sm sm:text-base">{response.lifestyle}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          </TabsContent>

          <TabsContent value="builder">
            <QuizBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;