interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Server Component qui rend directement le JSON-LD dans le HTML.
 * Visible par les crawlers sans JavaScript.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  const jsonString = typeof data === "string" ? data : JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}