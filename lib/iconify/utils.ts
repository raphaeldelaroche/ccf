import { IconObject } from "@/lib/blob-fields";

/**
 * Parse SVG string to IconObject structure
 * Converts SVG DOM to recursive object format for React rendering
 */
export function parseSvgToObject(svgString: string): IconObject | null {
  // Ensure we're in a browser environment
  if (typeof window === "undefined" || typeof DOMParser === "undefined") {
    return null;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");

    if (!svg) {
      return null;
    }

    // Recursive function to convert DOM node to IconObject
    function nodeToObject(node: Element): IconObject {
      const obj: IconObject = {
        type: node.tagName,
        props: {},
      };

      // Copy attributes, excluding redundant ones
      Array.from(node.attributes).forEach((attr) => {
        // Skip xmlns (will be added by renderer)
        if (attr.name === "xmlns") {
          return;
        }

        // Convert kebab-case to camelCase for React
        const propName = attr.name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());

        // Convert numeric attributes to numbers
        if (["width", "height", "strokeWidth", "stroke-width"].includes(attr.name)) {
          const numValue = parseFloat(attr.value);
          if (!isNaN(numValue)) {
            obj.props[propName] = numValue;
            return;
          }
        }

        obj.props[propName] = attr.value;
      });

      // Process children recursively
      const children: IconObject[] = [];
      Array.from(node.children).forEach((child) => {
        children.push(nodeToObject(child as Element));
      });

      if (children.length > 0) {
        obj.props.children = children;
      }

      return obj;
    }

    return nodeToObject(svg);
  } catch (error) {
    // Silent failure in production
    return null;
  }
}

/**
 * Apply custom stroke-width to SVG string
 * Replaces stroke-width attribute in all path/circle/etc elements
 */
export function applySvgStrokeWidth(
  svgString: string,
  strokeWidth: number
): string {
  return svgString.replace(
    /stroke-width="[\d.]+"/g,
    `stroke-width="${strokeWidth}"`
  );
}

/**
 * Debounce hook for delaying value updates
 * Useful for search inputs to reduce API calls
 */
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Retry utility for API calls
 * Attempts operation multiple times with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 500
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs * attempt)
        );
      }
    }
  }

  throw lastError || new Error("Operation failed after retries");
}
