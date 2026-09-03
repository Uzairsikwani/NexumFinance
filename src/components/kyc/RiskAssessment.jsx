import React, { useState } from 'react';
import { Target, ArrowRight, CheckCircle2, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const questions = [
  {
    id: 'experience',
    question: 'What is your experience with investing?',
    options: [
      { value: 'none', label: 'None - I\'m new to investing', score: 1 },
      { value: 'basic', label: 'Basic - I\'ve invested in FDs or savings schemes', score: 2 },
      { value: 'moderate', label: 'Moderate - I\'ve invested in stocks or mutual funds', score: 3 },
      { value: 'advanced', label: 'Advanced - I actively manage my portfolio', score: 4 }
    ]
  },
  {
    id: 'horizon',
    question: 'What is your investment time horizon?',
    options: [
      { value: 'short', label: 'Less than 1 year', score: 1 },
      { value: 'medium', label: '1-3 years', score: 2 },
      { value: 'long', label: '3-5 years', score: 3 },
      { value: 'very_long', label: 'More than 5 years', score: 4 }
    ]
  },
  {
    id: 'loss_tolerance',
    question: 'How would you react if your portfolio drops 20% in a month?',
    options: [
      { value: 'panic', label: 'Sell immediately to prevent further losses', score: 1 },
      { value: 'concerned', label: 'Sell some holdings and wait', score: 2 },
      { value: 'hold', label: 'Hold and wait for recovery', score: 3 },
      { value: 'buy_more', label: 'Buy more at lower prices', score: 4 }
    ]
  },
  {
    id: 'income_source',
    question: 'What is your primary source of income?',
    options: [
      { value: 'dependent', label: 'I depend on family/others', score: 1 },
      { value: 'single', label: 'Single income source (job/business)', score: 2 },
      { value: 'multiple', label: 'Multiple income sources', score: 3 },
      { value: 'passive', label: 'Significant passive income', score: 4 }
    ]
  },
  {
    id: 'allocation',
    question: 'What percentage of your savings are you comfortable investing?',
    options: [
      { value: 'very_low', label: 'Less than 10%', score: 1 },
      { value: 'low', label: '10-25%', score: 2 },
      { value: 'moderate', label: '25-50%', score: 3 },
      { value: 'high', label: 'More than 50%', score: 4 }
    ]
  }
];

export default function RiskAssessment({ onComplete }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (value, score) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQ].id]: { value, score }
    }));
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      // Calculate risk profile
      const totalScore = Object.values(answers).reduce((sum, a) => sum + a.score, 0);
      const avgScore = totalScore / questions.length;
      
      let profile;
      let score;
      if (avgScore <= 1.5) {
        profile = 'conservative';
        score = 25;
      } else if (avgScore <= 2.5) {
        profile = 'balanced';
        score = 50;
      } else {
        profile = 'aggressive';
        score = 75;
      }
      
      setResult({ profile, score });
    }
  };

  const handleComplete = () => {
    onComplete({
      risk_profile: result.profile,
      risk_score: result.score,
      risk_disclosure_accepted: true
    });
  };

  if (result) {
    const profileInfo = {
      conservative: {
        color: 'emerald',
        title: 'Conservative Investor',
        description: 'You prefer stability and capital preservation over high returns. Recommended: Low-volatility assets, stable coins, large-cap stocks.',
        allocation: { crypto: '10-20%', stocks: '40-50%', fixed: '30-50%' }
      },
      balanced: {
        color: 'blue',
        title: 'Balanced Investor',
        description: 'You seek a balance between growth and stability. Recommended: Diversified portfolio with moderate exposure to volatile assets.',
        allocation: { crypto: '20-30%', stocks: '40-50%', fixed: '20-30%' }
      },
      aggressive: {
        color: 'amber',
        title: 'Aggressive Investor',
        description: 'You are comfortable with volatility for potentially higher returns. Recommended: Higher exposure to growth assets.',
        allocation: { crypto: '30-40%', stocks: '40-50%', fixed: '10-20%' }
      }
    };

    const info = profileInfo[result.profile];

    const colorMap = {
      emerald: 'border-emerald-200',
      blue: 'border-blue-200',
      amber: 'border-amber-200'
    };
    const bgColorMap = {
      emerald: 'bg-emerald-100',
      blue: 'bg-blue-100',
      amber: 'bg-amber-100'
    };
    const textColorMap = {
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      amber: 'text-amber-600'
    };

    return (
      <Card className={colorMap[info.color]}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${bgColorMap[info.color]} rounded-full flex items-center justify-center`}>
              <Target className={`w-6 h-6 ${textColorMap[info.color]}`} />
            </div>
            <div>
              <CardTitle>{info.title}</CardTitle>
              <CardDescription>Risk Score: {result.score}/100</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-slate-600">{info.description}</p>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-3">Suggested Allocation</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Crypto Assets</span>
                <span className="font-medium">{info.allocation.crypto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Stocks & ETFs</span>
                <span className="font-medium">{info.allocation.stocks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Fixed Income</span>
                <span className="font-medium">{info.allocation.fixed}</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-2">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                This is a suggestion based on your responses. You can invest according to your own preferences. 
                We do not guarantee returns and past performance is not indicative of future results.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleComplete}
            className="w-full bg-slate-900 hover:bg-slate-800"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept & Continue
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
            <Target className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>
              Help us understand your investment preferences
            </CardDescription>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-500">Question {currentQ + 1} of {questions.length}</span>
            <span className="text-slate-500">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <h3 className="text-lg font-medium text-slate-900">
          {currentQuestion.question}
        </h3>
        
        <RadioGroup 
          value={answers[currentQuestion.id]?.value || ''}
          onValueChange={(value) => {
            const option = currentQuestion.options.find(o => o.value === value);
            handleAnswer(value, option.score);
          }}
          className="space-y-3"
        >
          {currentQuestion.options.map((option) => (
            <div 
              key={option.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                answers[currentQuestion.id]?.value === option.value
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <Button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id]}
          className="w-full bg-slate-900 hover:bg-slate-800"
        >
          {currentQ < questions.length - 1 ? 'Next Question' : 'See Results'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
