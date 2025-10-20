import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

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
  const [showAdmin, setShowAdmin] = useState(false);
  const { toast } = useToast();
  
  const [quizData, setQuizData] = useState<QuizData>({
    name: '',
    email: '',
    phone: '',
    ageRange: '',
    bodyType: '',
    stylePreferences: '',
    colorPreferences: '',
    wardrobeGoals: '',
    budgetRange: '',
    lifestyle: ''
  });

  const questions = [
    {
      id: 'personal',
      title: 'Контактная информация',
      description: 'Расскажите немного о себе',
      fields: [
        { name: 'name', label: 'Ваше имя', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: false },
        { name: 'phone', label: 'Телефон', type: 'tel', required: false }
      ]
    },
    {
      id: 'age',
      title: 'Возрастная категория',
      description: 'Выберите свою возрастную группу',
      type: 'radio',
      field: 'ageRange',
      options: [
        '18-25',
        '26-35',
        '36-45',
        '46-55',
        '56+'
      ]
    },
    {
      id: 'body',
      title: 'Тип фигуры',
      description: 'Какой у вас тип фигуры?',
      type: 'radio',
      field: 'bodyType',
      options: [
        'Песочные часы',
        'Треугольник',
        'Перевернутый треугольник',
        'Прямоугольник',
        'Яблоко',
        'Груша'
      ]
    },
    {
      id: 'style',
      title: 'Стилевые предпочтения',
      description: 'Какой стиль одежды вам нравится?',
      type: 'textarea',
      field: 'stylePreferences',
      placeholder: 'Например: классический, casual, спортивный...'
    },
    {
      id: 'colors',
      title: 'Цветовая палитра',
      description: 'Какие цвета вы предпочитаете в одежде?',
      type: 'textarea',
      field: 'colorPreferences',
      placeholder: 'Например: пастельные тона, яркие цвета, черно-белая гамма...'
    },
    {
      id: 'goals',
      title: 'Цели по гардеробу',
      description: 'Что вы хотите улучшить в своем гардеробе?',
      type: 'textarea',
      field: 'wardrobeGoals',
      placeholder: 'Например: обновить базовый гардероб, подобрать образы для работы...'
    },
    {
      id: 'budget',
      title: 'Бюджет',
      description: 'Ваш планируемый бюджет на покупки',
      type: 'radio',
      field: 'budgetRange',
      options: [
        'До 10 000 ₽',
        '10 000 - 30 000 ₽',
        '30 000 - 50 000 ₽',
        '50 000 - 100 000 ₽',
        'Более 100 000 ₽'
      ]
    },
    {
      id: 'lifestyle',
      title: 'Образ жизни',
      description: 'Опишите свой образ жизни',
      type: 'textarea',
      field: 'lifestyle',
      placeholder: 'Например: работа в офисе, активный отдых, светские мероприятия...'
    }
  ];

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const handleInputChange = (name: string, value: string) => {
    setQuizData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
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
    
    setQuizData({
      name: '',
      email: '',
      phone: '',
      ageRange: '',
      bodyType: '',
      stylePreferences: '',
      colorPreferences: '',
      wardrobeGoals: '',
      budgetRange: '',
      lifestyle: ''
    });
    setStep(0);
  };

  const canProceed = () => {
    if (currentQuestion.id === 'personal') {
      return quizData.name.trim() !== '';
    }
    if (currentQuestion.type === 'radio') {
      const fieldValue = quizData[currentQuestion.field as keyof QuizData];
      return fieldValue !== '';
    }
    return true;
  };

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Стилист-тест
          </h1>
          <p className="text-gray-600 text-lg">
            Узнайте свой идеальный стиль за 8 шагов
          </p>
        </div>

        <Card className="shadow-xl border-0 animate-fade-in">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">{currentQuestion.title}</CardTitle>
              <span className="text-sm text-muted-foreground">
                {step + 1} / {questions.length}
              </span>
            </div>
            <CardDescription className="text-base">{currentQuestion.description}</CardDescription>
            
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-pink-400 to-purple-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
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
                      value={quizData[field.name as keyof QuizData]}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="border-gray-300"
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'radio' && (
              <RadioGroup
                value={quizData[currentQuestion.field as keyof QuizData]}
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

            {currentQuestion.type === 'textarea' && (
              <div className="space-y-2">
                <Textarea
                  value={quizData[currentQuestion.field as keyof QuizData]}
                  onChange={(e) => handleInputChange(currentQuestion.field!, e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="min-h-32 border-gray-300 resize-none"
                />
              </div>
            )}

            <div className="flex justify-between pt-6 gap-3">
              <Button
                onClick={handlePrev}
                disabled={step === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Icon name="ChevronLeft" size={20} />
                Назад
              </Button>

              {step < questions.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                >
                  Далее
                  <Icon name="ChevronRight" size={20} />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
                >
                  Отправить
                  <Icon name="Send" size={20} />
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (email === 'pells1ze@gmail.com' && password === '123789456h') {
      setIsAuthenticated(true);
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
              <Button onClick={onBack} variant="outline" className="flex-1">
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Результаты тестирования</h1>
          <Button onClick={onBack} variant="outline">
            <Icon name="LogOut" size={20} className="mr-2" />
            Выйти
          </Button>
        </div>

        <div className="space-y-4">
          {responses.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Пока нет результатов</p>
            </Card>
          ) : (
            responses.map((response) => (
              <Card key={response.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{response.name}</CardTitle>
                      <CardDescription>
                        {response.email && <span>{response.email}</span>}
                        {response.phone && <span className="ml-3">{response.phone}</span>}
                      </CardDescription>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(response.completed_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Возраст</p>
                    <p>{response.ageRange}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Тип фигуры</p>
                    <p>{response.bodyType}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Бюджет</p>
                    <p>{response.budgetRange}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Стиль</p>
                    <p>{response.stylePreferences}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Цветовые предпочтения</p>
                    <p>{response.colorPreferences}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Цели по гардеробу</p>
                    <p>{response.wardrobeGoals}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-500">Образ жизни</p>
                    <p>{response.lifestyle}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;