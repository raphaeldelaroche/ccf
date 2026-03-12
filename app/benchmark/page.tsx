"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { STEPS } from "./benchmark-data";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Check, ChevronsUpDown, Mail, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BenchmarkAside } from "@/components/benchmark/benchmark-aside";
import { BenchmarkConfirmation } from "@/components/benchmark/benchmark-confirmation";

export default function BenchmarkPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
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
    if (!email) return;
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
              className="w-full justify-between h-12 text-base"
            >
              {selectedOption ? selectedOption.label : "Select..."}
              <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px] p-0" align="center" sideOffset={8}>
            <Command>
              <CommandInput placeholder="Search for a sector..." className="h-12 text-base" />
              <CommandList className="max-h-[350px]">
                <CommandEmpty>No sector found.</CommandEmpty>
                <CommandGroup>
                  {step.options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.label}
                      className="py-3 text-sm"
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {step.options.map((option) => (
            <Label
              key={option.id}
              htmlFor={option.id}
              className={cn(
                "flex items-center justify-center text-center cursor-pointer rounded-xl border-2 p-8 text-lg font-medium transition-all duration-200 hover:border-foreground/50",
                answers[step.id] === option.id
                  ? "border-foreground ring-2 ring-foreground/20"
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
    <div className="flex min-h-screen">
      <BenchmarkAside currentStep={submitted ? 2 : 1} />

      <main className="flex-1 flex items-center justify-center p-8">
        {submitted ? (
          <BenchmarkConfirmation />
        ) : (
        <div className="w-full max-w-3xl space-y-12">
          {/* Progress indicator */}
          <div className="flex gap-3">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-3 flex-1 rounded-full transition-all duration-300",
                  index <= currentStep ? "bg-foreground" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Question */}
          <div className="space-y-10">
            <div>
              <p className="text-base text-muted-foreground mb-3 tracking-wide">
                Step {currentStep + 1} / {STEPS.length}
              </p>
              <h1 className="text-4xl font-semibold leading-tight">{step.title}</h1>
            </div>

            {/* Input */}
            <div className="space-y-4">{renderInput()}</div>

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 text-base px-8"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                >
                  Back
                </Button>
              )}
              <Button onClick={handleNext} disabled={!canProceed} size="lg" className="flex-1 h-12 text-base">
                {step.nextLabel}
              </Button>
            </div>
          </div>
        </div>

        )}

        {/* Email Dialog */}
        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Receive your result</DialogTitle>
              <DialogDescription>
                Enter your email address to receive your climate
                contributive potential.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="h-12 text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleEmailSubmit} disabled={!email} size="lg" className="h-12 text-base">
                Receive the result
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      {/* Fake email notification */}
      {showNotification && (
        <div
          className="fixed top-6 right-6 z-50 w-96 animate-in slide-in-from-right-full duration-500 cursor-pointer"
          onClick={() => router.push("/benchmark-report")}
        >
          <div className="bg-background border-2 border-border rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">CCF Benchmark</p>
                  <p className="text-xs text-muted-foreground">Just now</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotification(false);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="pl-[52px]">
              <p className="text-sm font-medium">Your climate contribution potential is ready</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click to view your personalised result
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
