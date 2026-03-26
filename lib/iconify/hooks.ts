import { useState, useEffect } from "react";
import { retryOperation, applySvgStrokeWidth } from "./utils";

/**
 * Search icons using Iconify API
 * Returns list of icon names matching the query
 */
export function useIconifySearch(
  query: string,
  collection: string = "lucide",
  limit: number = 50
) {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't search for empty queries
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const searchIcons = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await retryOperation(async () => {
          const res = await fetch(
            `https://api.iconify.design/search?query=${encodeURIComponent(
              query
            )}&limit=${limit}&prefix=${collection}`
          );

          if (!res.ok) {
            throw new Error(`Search failed: ${res.status} ${res.statusText}`);
          }

          return res.json();
        });

        if (!cancelled) {
          // API returns { icons: string[] } or { icons: string[], total: number }
          setResults(response.icons || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setResults([]);
          setLoading(false);
        }
      }
    };

    searchIcons();

    // Cleanup on unmount or query change
    return () => {
      cancelled = true;
    };
  }, [query, collection, limit]);

  return { results, loading, error };
}

/**
 * Fetch SVG for a specific icon from Iconify API
 * Returns SVG string with custom size and stroke-width applied
 */
export function useIconifySvg(
  iconName: string | null,
  collection: string = "lucide",
  size: number = 24,
  strokeWidth: number = 2
) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!iconName) {
      setSvg(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchSvg = async () => {
      setLoading(true);
      setError(null);

      try {
        // Remove collection prefix from icon name if present (e.g., "lucide:hand" → "hand")
        const cleanIconName = iconName.includes(':')
          ? iconName.split(':')[1]
          : iconName;

        const svgString = await retryOperation(async () => {
          const res = await fetch(
            `https://api.iconify.design/${collection}/${cleanIconName}.svg?height=${size}`
          );

          if (!res.ok) {
            throw new Error(`SVG fetch failed: ${res.status} ${res.statusText}`);
          }

          return res.text();
        });

        if (!cancelled) {
          // Apply custom stroke-width if needed
          const processedSvg = applySvgStrokeWidth(svgString, strokeWidth);
          setSvg(processedSvg);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setSvg(null);
          setLoading(false);
        }
      }
    };

    fetchSvg();

    return () => {
      cancelled = true;
    };
  }, [iconName, collection, size, strokeWidth]);

  return { svg, loading, error };
}

/**
 * Fetch and parse icon to IconData format
 * Combines SVG fetch + parsing into single hook
 */
import { IconData, IconObject } from "@/lib/blob-fields";
import { parseSvgToObject } from "./utils";

export function useIconifyIcon(
  iconName: string | null,
  collection: string = "lucide",
  size: number = 24,
  strokeWidth: number = 2
): {
  iconData: IconData | null;
  loading: boolean;
  error: Error | null;
} {
  const { svg, loading, error } = useIconifySvg(
    iconName,
    collection,
    size,
    strokeWidth
  );

  const [iconData, setIconData] = useState<IconData | null>(null);

  useEffect(() => {
    if (!svg || !iconName) {
      setIconData(null);
      return;
    }

    const iconObject = parseSvgToObject(svg);

    if (iconObject) {
      setIconData({
        name: iconName,
        collection,
        metadata: {
          size,
          strokeWidth,
        },
        iconObject,
      });
    } else {
      setIconData(null);
    }
  }, [svg, iconName, collection, size, strokeWidth]);

  return { iconData, loading, error };
}
