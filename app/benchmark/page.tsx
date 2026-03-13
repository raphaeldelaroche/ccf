"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "@/lib/benchmark/benchmark-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { BenchmarkAside } from "@/components/benchmark/benchmark-aside";
import { BenchmarkMobileHeader } from "@/components/benchmark/benchmark-mobile-header";
import { BenchmarkConfirmation } from "@/components/benchmark/benchmark-confirmation";
import { BenchmarkHero } from "@/components/benchmark/benchmark-hero";
import { BenchmarkProgressSteps } from "@/components/benchmark/benchmark-progress-steps";
import { BenchmarkQuestionCard } from "@/components/benchmark/benchmark-question-card";
import { BenchmarkEmailDialog } from "@/components/benchmark/benchmark-email-dialog";
import { BenchmarkNotification } from "@/components/benchmark/benchmark-notification";

export default function BenchmarkPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => setShowNotification(true), 500);
    return () => clearTimeout(timer);
  }, [submitted]);

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const canProceed = Boolean(answers[step.id]);

  const handleNext = () => {
    if (!canProceed) return;

    if (isLastStep) {
      setShowEmailDialog(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleEmailSubmit = () => {
    setShowEmailDialog(false);
    setSubmitted(true);
  };

  const renderInput = () => {
    if (step.inputType === "combobox") {
      const selectedOption = step.options.find(
        (opt) => opt.id === answers[step.id]
      );

      return (
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={comboboxOpen}
              className={cn(
                "w-full justify-between h-14 text-base font-medium transition-all duration-300",
                selectedOption && "border-foreground/40"
              )}
            >
              <span className={cn(!selectedOption && "text-muted-foreground")}>
                {selectedOption ? selectedOption.label : "Select your sector..."}
              </span>
              <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[520px] p-0" align="center" sideOffset={12}>
            <Command>
              <CommandInput placeholder="Search for a sector..." className="h-12 text-base" />
              <CommandList className="max-h-[400px]">
                <CommandEmpty>No sector found.</CommandEmpty>
                <CommandGroup>
                  {step.options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.label}
                      className="py-3 text-base cursor-pointer"
                      onSelect={() => {
                        setAnswers({ ...answers, [step.id]: option.id });
                        setComboboxOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-3 h-5 w-5",
                          answers[step.id] === option.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    if (step.inputType === "radio-buttons") {
      return (
        <RadioGroup
          value={answers[step.id] || ""}
          onValueChange={(value) =>
            setAnswers({ ...answers, [step.id]: value })
          }
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {step.options.map((option) => (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={cn(
                "flex items-center justify-center text-center cursor-pointer rounded-lg border-2 p-6 text-base font-medium transition-all duration-300 ease-out hover:border-foreground/40 hover:bg-muted/30",
                answers[step.id] === option.id
                  ? "border-foreground bg-muted/50 scale-[1.02]"
                  : "border-border"
              )}
            >
              <RadioGroupItem value={option.id} id={option.id} className="sr-only" />
              {option.label}
            </Label>
          ))}
        </RadioGroup>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <BenchmarkAside currentStep={submitted ? 2 : 1} />
      <BenchmarkMobileHeader currentStep={submitted ? 2 : 1} />

      <main className="flex-1">
        {submitted ? (
          <BenchmarkConfirmation />
        ) : (
          <>
            <BenchmarkHero
              currentStep={currentStep + 1}
              totalSteps={STEPS.length}
            />

            <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
              <div className="w-full max-w-3xl space-y-10">
                <BenchmarkProgressSteps
                  totalSteps={STEPS.length}
                  currentStep={currentStep}
                />

                <BenchmarkQuestionCard
                  currentStep={currentStep}
                  totalSteps={STEPS.length}
                  title={step.title}
                  nextLabel={step.nextLabel}
                  canProceed={canProceed}
                  onNext={handleNext}
                  onBack={currentStep > 0 ? () => setCurrentStep((prev) => prev - 1) : undefined}
                >
                  {renderInput()}
                </BenchmarkQuestionCard>
              </div>
            </div>
          </>
        )}

        <BenchmarkEmailDialog
          open={showEmailDialog}
          onOpenChange={setShowEmailDialog}
          onSubmit={handleEmailSubmit}
        />
      </main>

      {showNotification && (
        <BenchmarkNotification
          onClose={() => setShowNotification(false)}
          onClick={() => router.push("/benchmark-report")}
        />
      )}
    </div>
  );
}
