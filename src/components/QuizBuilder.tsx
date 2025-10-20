import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Question {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'textarea' | 'radio' | 'fields';
  field?: string;
  options?: string[];
  fields?: Array<{ name: string; label: string; type: string; required: boolean }>;
  placeholder?: string;
}

interface Quiz {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export const QuizBuilder = () => {
  const { toast } = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('quizTemplates');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(() => {
    const saved = localStorage.getItem('currentQuizDraft');
    return saved ? JSON.parse(saved) : null;
  });
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);

  const [questionForm, setQuestionForm] = useState({
    title: '',
    description: '',
    type: 'text' as Question['type'],
    field: '',
    options: '',
    placeholder: ''
  });
  
  const [customFields, setCustomFields] = useState<Array<{ name: string; label: string; type: string; required: boolean }>>([]);
  
  useEffect(() => {
    if (currentQuiz) {
      localStorage.setItem('currentQuizDraft', JSON.stringify(currentQuiz));
    }
  }, [currentQuiz]);

  const saveQuizzes = (updatedQuizzes: Quiz[]) => {
    localStorage.setItem('quizTemplates', JSON.stringify(updatedQuizzes));
    setQuizzes(updatedQuizzes);
  };

  const createNewQuiz = () => {
    const newQuiz: Quiz = {
      id: Date.now().toString(),
      name: 'Новый тест',
      description: 'Описание теста',
      questions: [],
      createdAt: new Date().toISOString()
    };
    setCurrentQuiz(newQuiz);
    localStorage.setItem('currentQuizDraft', JSON.stringify(newQuiz));
  };

  const saveCurrentQuiz = () => {
    if (!currentQuiz) return;

    const existingIndex = quizzes.findIndex(q => q.id === currentQuiz.id);
    let updatedQuizzes;

    if (existingIndex >= 0) {
      updatedQuizzes = [...quizzes];
      updatedQuizzes[existingIndex] = currentQuiz;
    } else {
      updatedQuizzes = [...quizzes, currentQuiz];
    }

    saveQuizzes(updatedQuizzes);
    localStorage.removeItem('currentQuizDraft');
    toast({
      title: 'Сохранено',
      description: 'Тест успешно сохранён'
    });
    setCurrentQuiz(null);
  };

  const deleteQuiz = (quizId: string) => {
    const updatedQuizzes = quizzes.filter(q => q.id !== quizId);
    saveQuizzes(updatedQuizzes);
    if (currentQuiz?.id === quizId) {
      localStorage.removeItem('currentQuizDraft');
      setCurrentQuiz(null);
    }
    toast({
      title: 'Удалено',
      description: 'Тест удалён'
    });
  };

  const openQuestionDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionForm({
        title: question.title,
        description: question.description,
        type: question.type,
        field: question.field || '',
        options: question.options?.join('\n') || '',
        placeholder: question.placeholder || ''
      });
      setCustomFields(question.fields || []);
    } else {
      setEditingQuestion(null);
      setQuestionForm({
        title: '',
        description: '',
        type: 'text',
        field: '',
        options: '',
        placeholder: ''
      });
      setCustomFields([]);
    }
    setShowQuestionDialog(true);
  };

  const saveQuestion = () => {
    if (!currentQuiz) return;

    const newQuestion: Question = {
      id: editingQuestion?.id || Date.now().toString(),
      title: questionForm.title,
      description: questionForm.description,
      type: questionForm.type,
      ...(questionForm.type === 'fields' ? {} : {
        field: questionForm.field || questionForm.title.toLowerCase().replace(/\s+/g, '_')
      }),
      ...(questionForm.type === 'radio' && {
        options: questionForm.options.split('\n').filter(o => o.trim())
      }),
      ...(questionForm.type === 'textarea' && {
        placeholder: questionForm.placeholder
      }),
      ...(questionForm.type === 'fields' && customFields.length > 0 && {
        fields: customFields
      })
    };

    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = currentQuiz.questions.map(q =>
        q.id === editingQuestion.id ? newQuestion : q
      );
    } else {
      updatedQuestions = [...currentQuiz.questions, newQuestion];
    }

    setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
    setShowQuestionDialog(false);
    toast({
      title: 'Готово',
      description: editingQuestion ? 'Вопрос обновлён' : 'Вопрос добавлен'
    });
  };

  const deleteQuestion = (questionId: string) => {
    if (!currentQuiz) return;
    const updatedQuestions = currentQuiz.questions.filter(q => q.id !== questionId);
    setCurrentQuiz({ ...currentQuiz, questions: updatedQuestions });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!currentQuiz) return;
    const newQuestions = [...currentQuiz.questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setCurrentQuiz({ ...currentQuiz, questions: newQuestions });
  };

  if (currentQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={() => {
            localStorage.removeItem('currentQuizDraft');
            setCurrentQuiz(null);
          }} variant="outline">
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            К списку тестов
          </Button>
          <Button onClick={saveCurrentQuiz} className="bg-gradient-to-r from-pink-400 to-purple-400">
            <Icon name="Save" size={20} className="mr-2" />
            Сохранить тест
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div>
                <Label>Название теста</Label>
                <Input
                  value={currentQuiz.name}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, name: e.target.value })}
                  className="text-xl font-semibold"
                />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea
                  value={currentQuiz.description}
                  onChange={(e) => setCurrentQuiz({ ...currentQuiz, description: e.target.value })}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Вопросы ({currentQuiz.questions.length})</h2>
          <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => openQuestionDialog()} className="bg-gradient-to-r from-pink-400 to-purple-400">
                <Icon name="Plus" size={20} className="mr-2" />
                Добавить вопрос
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingQuestion ? 'Редактировать вопрос' : 'Новый вопрос'}</DialogTitle>
                <DialogDescription>Заполните информацию о вопросе</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Заголовок вопроса</Label>
                  <Input
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                    placeholder="Например: Ваш возраст"
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Input
                    value={questionForm.description}
                    onChange={(e) => setQuestionForm({ ...questionForm, description: e.target.value })}
                    placeholder="Дополнительная информация"
                  />
                </div>
                <div>
                  <Label>Тип вопроса</Label>
                  <Select value={questionForm.type} onValueChange={(value: any) => setQuestionForm({ ...questionForm, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Короткий текст</SelectItem>
                      <SelectItem value="textarea">Длинный текст</SelectItem>
                      <SelectItem value="radio">Выбор варианта</SelectItem>
                      <SelectItem value="fields">Несколько полей</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {questionForm.type !== 'fields' && (
                  <div>
                    <Label>Ключ поля (для сохранения)</Label>
                    <Input
                      value={questionForm.field}
                      onChange={(e) => setQuestionForm({ ...questionForm, field: e.target.value })}
                      placeholder="Например: age_range"
                    />
                  </div>
                )}
                
                {questionForm.type === 'radio' && (
                  <div>
                    <Label>Варианты ответов (каждый с новой строки)</Label>
                    <Textarea
                      value={questionForm.options}
                      onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })}
                      placeholder="18-25&#10;26-35&#10;36-45"
                      rows={5}
                    />
                  </div>
                )}
                
                {questionForm.type === 'textarea' && (
                  <div>
                    <Label>Подсказка</Label>
                    <Input
                      value={questionForm.placeholder}
                      onChange={(e) => setQuestionForm({ ...questionForm, placeholder: e.target.value })}
                      placeholder="Например: Опишите ваш стиль..."
                    />
                  </div>
                )}
                
                {questionForm.type === 'fields' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Поля ввода</Label>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setCustomFields([...customFields, { name: '', label: '', type: 'text', required: false }])}
                        className="bg-gradient-to-r from-pink-400 to-purple-400"
                      >
                        <Icon name="Plus" size={16} className="mr-1" />
                        Добавить поле
                      </Button>
                    </div>
                    {customFields.map((field, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Label className="text-xs">Название поля</Label>
                              <Input
                                value={field.label}
                                onChange={(e) => {
                                  const updated = [...customFields];
                                  updated[index].label = e.target.value;
                                  setCustomFields(updated);
                                }}
                                placeholder="Имя"
                              />
                            </div>
                            <div className="flex-1">
                              <Label className="text-xs">Ключ</Label>
                              <Input
                                value={field.name}
                                onChange={(e) => {
                                  const updated = [...customFields];
                                  updated[index].name = e.target.value;
                                  setCustomFields(updated);
                                }}
                                placeholder="name"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label className="text-xs">Тип</Label>
                              <Select
                                value={field.type}
                                onValueChange={(value) => {
                                  const updated = [...customFields];
                                  updated[index].type = value;
                                  setCustomFields(updated);
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text">Текст</SelectItem>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="tel">Телефон</SelectItem>
                                  <SelectItem value="number">Число</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => {
                                  const updated = [...customFields];
                                  updated[index].required = e.target.checked;
                                  setCustomFields(updated);
                                }}
                                className="w-4 h-4"
                              />
                              <Label className="text-xs">Обязательное</Label>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setCustomFields(customFields.filter((_, i) => i !== index))}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setShowQuestionDialog(false)} variant="outline" className="flex-1">
                    Отмена
                  </Button>
                  <Button onClick={saveQuestion} className="flex-1 bg-gradient-to-r from-pink-400 to-purple-400">
                    {editingQuestion ? 'Сохранить' : 'Добавить'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {currentQuiz.questions.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">Нет вопросов. Добавьте первый вопрос.</p>
            </Card>
          ) : (
            currentQuiz.questions.map((question, index) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveQuestion(index, 'up')}
                        disabled={index === 0}
                      >
                        <Icon name="ChevronUp" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveQuestion(index, 'down')}
                        disabled={index === currentQuiz.questions.length - 1}
                      >
                        <Icon name="ChevronDown" size={16} />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{index + 1}. {question.title}</h3>
                          <p className="text-sm text-gray-600">{question.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {question.type === 'text' && 'Короткий текст'}
                              {question.type === 'textarea' && 'Длинный текст'}
                              {question.type === 'radio' && 'Выбор варианта'}
                            </span>
                            {question.options && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                                {question.options.length} вариантов
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openQuestionDialog(question)}>
                            <Icon name="Pencil" size={16} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteQuestion(question.id)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Конструктор тестов</h2>
        <Button onClick={createNewQuiz} className="bg-gradient-to-r from-pink-400 to-purple-400">
          <Icon name="Plus" size={20} className="mr-2" />
          Создать тест
        </Button>
      </div>

      <div className="grid gap-4">
        {quizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <Icon name="ClipboardList" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Нет созданных тестов</h3>
            <p className="text-gray-600 mb-4">Создайте свой первый тест для клиентов</p>
            <Button onClick={createNewQuiz} className="bg-gradient-to-r from-pink-400 to-purple-400">
              Создать тест
            </Button>
          </Card>
        ) : (
          quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle>{quiz.name}</CardTitle>
                    <CardDescription>{quiz.description}</CardDescription>
                    <div className="flex gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Icon name="HelpCircle" size={16} />
                        {quiz.questions.length} вопросов
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="Calendar" size={16} />
                        {new Date(quiz.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setCurrentQuiz(quiz)}>
                      <Icon name="Pencil" size={16} className="mr-2" />
                      <span className="hidden sm:inline">Редактировать</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Удалить тест "{quiz.name}"? Это действие нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteQuiz(quiz.id)} className="bg-red-600 hover:bg-red-700">
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;