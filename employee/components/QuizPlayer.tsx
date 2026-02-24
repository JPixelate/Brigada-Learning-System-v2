import React, { useState } from 'react';
import { CheckCircle, XCircle, Award, RotateCcw } from 'lucide-react';
import { ModuleComponent, QuizAttempt, Question } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface QuizPlayerProps {
  component: ModuleComponent;
  moduleId: string;
}

const QuizPlayer = ({ component, moduleId }: QuizPlayerProps) => {
  const { user } = useAuth();
  const { addQuizAttempt, data } = useData();
  const questions: Question[] = Array.isArray(component.content) ? component.content : [];
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const existingAttempts = (data.quizAttempts || []).filter(
    qa => qa.employeeId === user?.id && qa.componentId === component.id
  );

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length < questions.length) return;

    let correct = 0;
    const answers = questions.map(q => {
      const selectedId = selectedAnswers[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      const isCorrect = correctOption?.id === selectedId;
      if (isCorrect) correct++;
      return {
        questionId: q.id,
        selectedOptionId: selectedId,
        isCorrect,
      };
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      employeeId: user!.id,
      moduleId,
      componentId: component.id,
      answers,
      score: scorePercent,
      attemptNumber: existingAttempts.length + 1,
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      passed: scorePercent >= 70,
    };

    addQuizAttempt(attempt);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-50">
          <Award size={20} className="text-amber-600" />
        </div>
        <span className="text-sm font-black text-amber-600 uppercase tracking-widest">Assessment Quiz</span>
      </div>

      <h2 className="text-2xl font-bold text-main-heading">{component.title}</h2>

      {/* Score Banner */}
      {submitted && (
        <div className={`p-6 rounded-2xl border-2 ${score >= 70 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'} animate-in zoom-in-95 duration-300`}>
          <div className="flex items-center gap-5">
            {score >= 70 ? (
              <CheckCircle size={32} className="text-emerald-600" />
            ) : (
              <XCircle size={32} className="text-red-600" />
            )}
            <div>
              <p className={`text-xl font-black ${score >= 70 ? 'text-emerald-700' : 'text-red-700'}`}>
                Final Score: {score}%
              </p>
              <p className={`text-base font-medium mt-1 ${score >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>
                {score >= 70 ? 'Excellent work! You have successfully passed this assessment.' : 'You did not reach the passing score. Please review the material and try again.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, qIdx) => {
          const selectedId = selectedAnswers[question.id];
          return (
            <div key={question.id} className="bg-main-surface rounded-2xl border border-main-border p-6 shadow-sm">
              <p className="text-lg font-bold text-main-heading mb-5 leading-relaxed">
                <span className="text-slate-400 mr-2">Question {qIdx + 1}.</span>
                {question.text}
              </p>
              <div className="space-y-3">
                {question.options.map(option => {
                  const isSelected = selectedId === option.id;
                  let optionStyle = 'border-main-border hover:border-brand-primary hover:bg-main-bg shadow-sm';
                  if (submitted) {
                    if (option.isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500 shadow-emerald-100';
                    } else if (isSelected && !option.isCorrect) {
                      optionStyle = 'border-red-500 bg-red-50 ring-1 ring-red-500 shadow-red-100';
                    } else {
                      optionStyle = 'border-main-border opacity-50 bg-gray-50';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20';
                  }

                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(question.id, option.id)}
                      disabled={submitted}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${optionStyle}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-brand-primary bg-brand-primary' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white transition-all scale-100" />}
                      </div>
                      <span className={`text-base font-medium ${isSelected ? 'text-main-heading font-bold' : 'text-slate-600'}`}>{option.text}</span>
                      {submitted && option.isCorrect && <CheckCircle size={20} className="ml-auto text-emerald-500" />}
                      {submitted && isSelected && !option.isCorrect && <XCircle size={20} className="ml-auto text-red-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(selectedAnswers).length < questions.length}
            className="px-8 py-4 bg-brand-primary text-brand-primary-text rounded-xl font-bold text-lg hover:bg-brand-hover transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Quiz Answers
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-3 px-8 py-4 bg-main-surface border-2 border-main-border text-main-heading rounded-xl font-bold text-lg hover:bg-main-bg transition-all shadow-md"
          >
            <RotateCcw size={20} />
            Retry Assessment
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
