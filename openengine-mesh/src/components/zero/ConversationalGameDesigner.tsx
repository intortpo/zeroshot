import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle,
  Zap,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react';
import { GameChatMessage, GameQuestion, GameQuestionOption } from '../../types';

interface ConversationalGameDesignerProps {
  chatHistory: GameChatMessage[];
  pendingQuestion?: GameQuestion;
  onAnswerQuestion: (optionId: string, customText?: string) => void;
  onSendMessage: (text: string) => void;
  onResetInterview: () => void;
}

export const ConversationalGameDesigner: React.FC<ConversationalGameDesignerProps> = ({
  chatHistory,
  pendingQuestion,
  onAnswerQuestion,
  onSendMessage,
  onResetInterview,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectOption = (option: GameQuestionOption) => {
    setSelectedOptionId(option.id);
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId && !inputText.trim()) return;

    setIsSubmitting(true);
    if (pendingQuestion && selectedOptionId) {
      onAnswerQuestion(selectedOptionId, inputText.trim() || undefined);
    } else if (inputText.trim()) {
      onSendMessage(inputText.trim());
    }

    setSelectedOptionId(null);
    setInputText('');
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-full subtle-depth rounded-2xl overflow-hidden border border-stone-200/80 font-sans">
      {/* Designer Header */}
      <div className="p-4 border-b border-stone-200/80 bg-white/70 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-4 h-4 text-[#0ABAB5]" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-900 flex items-center space-x-2">
              <span>Bevy MCP Designer</span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium">
                Avian Physics Active
              </span>
            </div>
            <div className="text-[11px] text-stone-500 font-normal">
              Back-and-forth interview to synthesize game modes & ECS loops
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetInterview}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1"
          title="Restart design interview"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg) => {
          const isDesigner = msg.sender === 'designer';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${
                isDesigner ? 'justify-start' : 'justify-end'
              }`}
            >
              {isDesigner && (
                <div className="w-6 h-6 rounded-lg bg-stone-900 flex-shrink-0 flex items-center justify-center text-white mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#0ABAB5]" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed ${
                  isDesigner
                    ? 'subtle-depth-card border border-stone-200/80 text-stone-800'
                    : 'bg-stone-900 text-white shadow-sm'
                }`}
              >
                <div className="font-normal whitespace-pre-wrap">{msg.text}</div>

                {msg.bevyUpdate && (
                  <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-center space-x-1.5">
                    <Zap className="w-3 h-3 text-[#FF5F1F]" />
                    <span>Synthesized: {msg.bevyUpdate}</span>
                  </div>
                )}
              </div>

              {!isDesigner && (
                <div className="w-6 h-6 rounded-lg bg-stone-200 flex-shrink-0 flex items-center justify-center text-stone-700 mt-0.5">
                  <User className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}

        {/* Pending Interactive Question Card */}
        {pendingQuestion && (
          <div className="subtle-depth-card rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-3.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-stone-200/70 pb-2.5">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-stone-800" />
                <span className="text-xs font-semibold text-stone-900">
                  {pendingQuestion.title}
                </span>
              </div>
              <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                {pendingQuestion.category}
              </span>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              {pendingQuestion.description}
            </p>

            {/* Selectable Options Grid */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {pendingQuestion.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option)}
                    className={`subtle-depth-interactive w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200/90 bg-white/90 hover:border-stone-400 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs">{option.label}</span>
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4 text-[#0ABAB5]" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-stone-300" />
                      )}
                    </div>
                    <div
                      className={`text-[11px] mt-1 ${
                        isSelected ? 'text-stone-300' : 'text-stone-500'
                      }`}
                    >
                      {option.description}
                    </div>
                    {option.physicsSnippet && (
                      <div
                        className={`text-[10px] mt-1.5 pt-1 border-t ${
                          isSelected ? 'border-stone-700 text-stone-400' : 'border-stone-100 text-stone-400'
                        }`}
                      >
                        Avian ECS: {option.physicsSnippet}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Input / Response Bar */}
      <div className="p-3 border-t border-stone-200/80 bg-white/70 backdrop-blur-xl">
        <form onSubmit={handleSubmitAnswer} className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                selectedOptionId
                  ? 'Selected option (type to add custom mechanics or instructions)...'
                  : 'Type custom game rules, physics impulses, or questions...'
              }
              className="flex-1 bg-white/90 border border-stone-200/90 rounded-xl px-3.5 py-2 text-xs font-sans text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-all font-normal"
            />
            <button
              type="submit"
              disabled={(!selectedOptionId && !inputText.trim()) || isSubmitting}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-medium font-sans flex items-center space-x-1.5 disabled:opacity-40 transition-colors shadow-sm"
            >
              <span>{pendingQuestion && selectedOptionId ? 'Apply' : 'Send'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
