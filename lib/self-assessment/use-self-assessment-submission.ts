"use client";

import { useState } from "react";
import { submitForm } from "@/packages/package-form/utils/submit-form";
import { encodeEntryToken } from "@/lib/self-assessment/entry-token";

/**
 * Custom hook for managing self-assessment submission flow
 * Handles email dialog and submission state
 */
export function useSelfAssessmentSubmission() {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (
    email: string,
    answers: Record<string, string>
  ) => {
    setIsSubmitting(true);
    setError(null);

    const formId = 3; // Self-Assessment Form ID in WordPress

    // Map answers to Gravity Forms field IDs
    const fieldValues = [
      {
        id: 1, // Sector field ID
        value: answers.sector || "",
      },
      {
        id: 3, // Company size field ID
        value: answers.size || "",
      },
      {
        id: 5, // Geography field ID
        value: answers.geography || "",
      },
      {
        id: 6, // Email field ID
        emailValues: {
          value: email,
        },
      },
    ];

    // Create FormData for submission
    const submitData = new FormData();
    submitData.set("formId", formId.toString());
    submitData.set("fieldValues", JSON.stringify(fieldValues));

    try {
      const result = await submitForm(submitData);

      if (result.success) {
        // Get entry ID from submission result
        const entryId = result.entry?.databaseId;

        console.log('[Self-Assessment] Form submitted successfully!', result);
        console.log('[Self-Assessment] Entry ID:', entryId);

        // Stay on confirmation page instead of redirecting
        setShowEmailDialog(false);
        setSubmitted(true);
      } else {
        setError(result.error || "An error occurred while submitting the form");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Form submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    showEmailDialog,
    setShowEmailDialog,
    submitted,
    isSubmitting,
    error,
    handleEmailSubmit,
  };
}
