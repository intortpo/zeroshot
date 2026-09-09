import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BookOpen, CheckCircle2, XCircle, Sparkles, Shield, RotateCcw, AlertTriangle } from 'lucide-react';

export interface EslQuestion {
  id: string;
  prompt: string;
  verb: string;
  correctAnswer: string;
  options: string[];
  hint: string;
}

const GRADE_4_ESL_QUESTIONS: EslQuestion[] = [
  {
    id: 'q1',
    prompt: 'Look at the monkey! It ___ a sweet yellow banana in the tree right now.',
    verb: 'peel',
    correctAnswer: 'is peeling',
    options: ['is peeling', 'are peeling', 'peels', 'is peel'],
    hint: 'Singular subject ("It" / "The monkey") takes "is" + verb-ing.',
  },
  {
    id: 'q2',
    prompt: 'Listen! The birds ___ a cheerful morning song outside my window.',
    verb: 'sing',
    correctAnswer: 'are singing',
    options: ['are singing', 'is singing', 'sings', 'are sing'],
    hint: 'Plural subject ("The birds") takes "are" + verb-ing.',
  },
  {
    id: 'q3',
    prompt: 'I cannot play outside right now because I ___ my English homework.',
    verb: 'do',
    correctAnswer: 'am doing',
    options: ['am doing', 'is doing', 'are doing', 'am do'],
    hint: 'First person pronoun "I" always pairs with "am" + verb-ing.',
  },
  {
    id: 'q4',
    prompt: 'Look at the swimming pool! Two boys ___ across the deep lane.',
    verb: 'swim',
    correctAnswer: 'are swimming',
    options: ['are swimming', 'is swimming', 'are swiming', 'swims'],
    hint: 'Plural subject ("Two boys") takes "are", and "swim" doubles the "m" -> "swimming".',
  },
  {
    id: 'q5',
    prompt: 'Where is Dad? He ___ a tasty strawberry cake in the kitchen.',
    verb: 'bake',
    correctAnswer: 'is baking',
    options: ['is baking', 'are baking', 'is bakeing', 'bakes'],
    hint: 'Singular "Dad" takes "is", and drop the silent "e": bake -> baking.',
  },
  {
    id: 'q6',
    prompt: 'The children ___ tag on the soft green grass at the moment.',
    verb: 'play',
    correctAnswer: 'are playing',
    options: ['are playing', 'is playing', 'plays', 'are play'],
    hint: '"Children" is an irregular plural noun, so use "are playing".',
  },
  {
    id: 'q7',
    prompt: 'Shh! Please be quiet. The baby sister ___ in her soft bed.',
    verb: 'sleep',
    correctAnswer: 'is sleeping',
    options: ['is sleeping', 'are sleeping', 'sleeps', 'is sleep'],
    hint: 'Singular subject "The baby sister" takes "is sleeping".',
  },
  {
    id: 'q8',
    prompt: 'Look at that fluffy puppy! It ___ fast after the red tennis ball.',
    verb: 'run',
    correctAnswer: 'is running',
    options: ['is running', 'are running', 'is runing', 'runs'],
    hint: 'Double the final consonant for one-syllable short vowels: run -> running.',
  },
  {
    id: 'q9',
    prompt: 'Right now, Lucas and Emma ___ a massive sandcastle on the beach.',
    verb: 'build',
    correctAnswer: 'are building',
    options: ['are building', 'is building', 'builds', 'are build'],
    hint: 'Compound subject ("Lucas and Emma" = two people) uses "are building".',
  },
  {
    id: 'q10',
    prompt: 'Look out the window! Heavy rain ___ down from the stormy grey clouds.',
    verb: 'fall',
    correctAnswer: 'is falling',
    options: ['is falling', 'are falling', 'falls', 'is fall'],
    hint: 'Uncountable noun "Heavy rain" acts as singular, taking "is falling".',
  },
  {
    id: 'q11',
    prompt: 'Why ___ you ___ such a thick winter sweater today?',
    verb: 'wear',
    correctAnswer: 'are / wearing',
    options: ['are / wearing', 'is / wearing', 'do / wearing', 'are / wear'],
    hint: 'Second-person "you" takes "are" in questions: "Why are you wearing...?"',
  },
  {
    id: 'q12',
    prompt: 'The students ___ quietly for their Grade 4 spelling bee right now.',
    verb: 'study',
    correctAnswer: 'are studying',
    options: ['are studying', 'is studying', 'are studyying', 'studies'],
    hint: 'Plural "The students" takes "are". With -y verbs, keep the "y": studying.',
  },
  {
    id: 'q13',
    prompt: 'Look! The big brown bear ___ up the tall oak tree.',
    verb: 'climb',
    correctAnswer: 'is climbing',
    options: ['is climbing', 'are climbing', 'climbs', 'is climb'],
    hint: 'Singular animal ("The bear") takes "is climbing".',
  },
  {
    id: 'q14',
    prompt: 'My brother and I ___ our favorite space adventure cartoon right now.',
    verb: 'watch',
    correctAnswer: 'are watching',
    options: ['are watching', 'is watching', 'watches', 'am watching'],
    hint: '"My brother and I" = "We" (plural), which takes "are watching".',
  },
  {
    id: 'q15',
    prompt: 'Listen! Somebody ___ gently on our front classroom door.',
    verb: 'knock',
    correctAnswer: 'is knocking',
    options: ['is knocking', 'are knocking', 'knocks', 'is knock'],
    hint: 'Indefinite pronoun "Somebody" takes the singular verb: "is knocking".',
  },
  {
    id: 'q16',
    prompt: 'We ___ new English grammar rules to unlock our match respawn!',
    verb: 'learn',
    correctAnswer: 'are learning',
    options: ['are learning', 'is learning', 'learns', 'are learn'],
    hint: 'Subject pronoun "We" pairs with "are" + verb-ing.',
  },
  {
    id: 'q17',
    prompt: 'The cute white bunny ___ quickly through the vegetable garden.',
    verb: 'hop',
    correctAnswer: 'is hopping',
    options: ['is hopping', 'are hopping', 'is hoping', 'hops'],
    hint: 'Double the "p" when adding -ing to "hop" -> "is hopping".',
  },
  {
    id: 'q18',
    prompt: 'Right now, the friendly school nurse ___ a bandage on Tommy’s knee.',
    verb: 'put',
    correctAnswer: 'is putting',
    options: ['is putting', 'are putting', 'is puting', 'puts'],
    hint: 'Double the consonant: put -> putting, with singular "nurse": "is putting".',
  },
  {
    id: 'q19',
    prompt: 'Look! The playful dolphins ___ gracefully above the ocean waves.',
    verb: 'leap',
    correctAnswer: 'are leaping',
    options: ['are leaping', 'is leaping', 'leaps', 'are leap'],
    hint: 'Plural "dolphins" takes "are leaping".',
  },
  {
    id: 'q20',
    prompt: 'I ___ an exciting postcard to send to my pen pal in London.',
    verb: 'write',
    correctAnswer: 'am writing',
    options: ['am writing', 'is writing', 'are writing', 'am writeing'],
    hint: '"I" pairs with "am", and drop the silent "e": write -> writing.',
  },
  {
    id: 'q21',
    prompt: 'The chef ___ a giant pot of delicious tomato soup at the stove.',
    verb: 'stir',
    correctAnswer: 'is stirring',
    options: ['is stirring', 'are stirring', 'is stiring', 'stirs'],
    hint: 'Double the "r" for stir -> stirring, with singular "chef": "is stirring".',
  },
  {
    id: 'q22',
    prompt: 'Look at the colorful butterflies! They ___ over the bright sunflowers.',
    verb: 'flutter',
    correctAnswer: 'are fluttering',
    options: ['are fluttering', 'is fluttering', 'flutters', 'are flutter'],
    hint: 'Subject "They" takes "are fluttering".',
  },
  {
    id: 'q23',
    prompt: 'The mechanic ___ the squeaky bicycle chain right now.',
    verb: 'fix',
    correctAnswer: 'is fixing',
    options: ['is fixing', 'are fixing', 'fixes', 'is fix'],
    hint: 'Words ending in "x" do not double the consonant: "is fixing".',
  },
  {
    id: 'q24',
    prompt: 'At this very moment, Mom and Aunt Sarah ___ fresh orange juice.',
    verb: 'make',
    correctAnswer: 'are making',
    options: ['are making', 'is making', 'are makeing', 'makes'],
    hint: 'Two people ("Mom and Aunt Sarah") = plural "are making" (drop silent e).',
  },
  {
    id: 'q25',
    prompt: 'Listen! The school choir ___ an upbeat song in the auditorium.',
    verb: 'practice',
    correctAnswer: 'is practicing',
    options: ['is practicing', 'are practicing', 'practices', 'is practice'],
    hint: 'Collective noun "The school choir" acting together takes singular "is practicing".',
  },
];

// Sound generator using Web Audio API
function playChime(isCorrect: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (isCorrect) {
      // Ascending major chord fanfare (C5 -> E5 -> G5 -> C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.18, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.35);
      });
    } else {
      // Gentle warning buzz (two descending low tones)
      const freqs = [220, 174.61];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.25);
      });
    }
  } catch {
    // Graceful fallback if Web Audio is muted/blocked
  }
}

interface EslPresentContinuousModalProps {
  isOpen: boolean;
  onRespawn: () => void;
  characterName?: string;
  gameModeTitle?: string;
}

export const EslPresentContinuousModal: React.FC<EslPresentContinuousModalProps> = ({
  isOpen,
  onRespawn,
  characterName = 'Your Dude',
  gameModeTitle = 'Tactical Arena',
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pick a random question when the modal opens
  const pickNewQuestion = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * GRADE_4_ESL_QUESTIONS.length);
    setCurrentQuestionIndex(randomIndex);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShake(false);
    setCountdown(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      pickNewQuestion();
    }
  }, [isOpen, pickNewQuestion]);

  const activeQuestion = GRADE_4_ESL_QUESTIONS[currentQuestionIndex];

  // CRITICAL REQUIREMENT: "with randomized location of the present continuous questions multiple choice"
  // Shuffled locations of the 4 options whenever a question is displayed
  const randomizedOptions = useMemo(() => {
    if (!activeQuestion) return [];
    const array = [...activeQuestion.options];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }, [activeQuestion, currentQuestionIndex, isOpen]);

  // Handle user option selection
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    const correct = option.trim() === activeQuestion.correctAnswer.trim();
    setIsCorrect(correct);
    playChime(correct);

    if (correct) {
      // Start auto-respawn countdown
      setCountdown(2);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            onRespawn();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleTryAnother = () => {
    pickNewQuestion();
  };

  if (!isOpen || !activeQuestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden transform transition-all ${
          shake ? 'animate-bounce' : ''
        }`}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-[#FF5F1F] to-[#0ABAB5] px-6 py-4 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-md">
                  Grade 4 ESL Challenge
                </span>
                <span className="text-xs font-semibold text-white/90">
                  Present Continuous (am/is/are + verb-ing)
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white mt-0.5">
                Respawn Gate: Pushed Into The Void!
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/20">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-medium text-white">{characterName}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Situation Notice */}
          <div className="flex items-center justify-between text-xs font-medium text-stone-500 bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200/70">
            <span>Stage: {gameModeTitle}</span>
            <span className="text-[#FF5F1F] font-semibold">Answer correctly to unlock match respawn!</span>
          </div>

          {/* Question Sentence Display */}
          <div className="p-5 rounded-2xl bg-stone-900 text-white shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-24 h-24 text-[#0ABAB5]" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#0ABAB5] mb-2 uppercase tracking-wide">
                <span>Base Verb:</span>
                <span className="bg-[#0ABAB5]/20 text-teal-200 px-2 py-0.5 rounded-md border border-[#0ABAB5]/40 font-mono">
                  ({activeQuestion.verb})
                </span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {activeQuestion.prompt.split('___').map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span className="inline-block mx-1.5 px-3 py-0.5 rounded-lg bg-[#0ABAB5]/30 border-2 border-dashed border-[#0ABAB5] font-bold text-teal-300 min-w-[90px] text-center">
                        {isAnswered ? selectedOption : '___ ? ___'}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
          </div>

          {/* Multiple Choice Options - RANDOMIZED LOCATIONS */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Choose the correct present continuous form:
              </span>
              <span className="text-[11px] text-stone-400 italic">
                (Locations randomized)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {randomizedOptions.map((option, idx) => {
                const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === option;
                const isCorrectChoice = option.trim() === activeQuestion.correctAnswer.trim();

                let buttonClass = 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-800 hover:border-stone-300';
                let letterBadge = 'bg-stone-200 text-stone-700';

                if (isAnswered) {
                  if (isSelected && isCorrectChoice) {
                    buttonClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/40';
                    letterBadge = 'bg-emerald-500 text-white';
                  } else if (isSelected && !isCorrectChoice) {
                    buttonClass = 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-400/40';
                    letterBadge = 'bg-rose-500 text-white';
                  } else if (isCorrectChoice) {
                    buttonClass = 'bg-emerald-50/70 border-emerald-400 text-emerald-900 border-dashed';
                    letterBadge = 'bg-emerald-400 text-white';
                  } else {
                    buttonClass = 'bg-stone-50/50 border-stone-200 text-stone-400 opacity-60';
                    letterBadge = 'bg-stone-100 text-stone-400';
                  }
                }

                return (
                  <button
                    key={`${currentQuestionIndex}-${option}-${idx}`}
                    type="button"
                    disabled={isAnswered && isCorrect}
                    onClick={() => handleSelectOption(option)}
                    className={`subtle-depth-interactive flex items-center justify-start p-3.5 rounded-2xl border text-left transition-all duration-150 ${buttonClass}`}
                  >
                    <span className={`w-7 h-7 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-xs mr-3 ${letterBadge}`}>
                      {optionLetter}
                    </span>
                    <span className="text-sm font-semibold flex-1 font-mono">
                      {option}
                    </span>
                    {isAnswered && isSelected && (
                      <span className="ml-2">
                        {isCorrectChoice ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grammar Explanation & Feedback Box */}
          {isAnswered && (
            <div
              className={`p-4 rounded-2xl border text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                isCorrect
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold flex items-center space-x-2">
                    <span>{isCorrect ? 'Outstanding! Correct Grammar!' : 'Grammar Tip (Try Again):'}</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">
                    {activeQuestion.hint}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center space-x-2 text-xs text-stone-500">
              <Shield className="w-4 h-4 text-[#0ABAB5]" />
              <span>Respawn grants temporary invulnerability shield</span>
            </div>

            <div className="flex items-center space-x-2.5">
              {isAnswered && !isCorrect && (
                <button
                  type="button"
                  onClick={handleTryAnother}
                  className="subtle-depth-interactive flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Next Question</span>
                </button>
              )}

              {isAnswered && isCorrect && (
                <button
                  type="button"
                  onClick={onRespawn}
                  className="subtle-depth-interactive flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#FF5F1F] hover:bg-orange-600 text-white shadow-md transition-all active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Respawn Now {countdown !== null ? `(${countdown}s)` : ''}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
