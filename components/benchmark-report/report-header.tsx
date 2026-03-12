import { Badge } from "@/components/ui/badge";

interface ReportHeaderProps {
  sector: string;
  title: string;
  description: string;
}

export function ReportHeader({ sector, title, description }: ReportHeaderProps) {
  return (
    <section className="bg-muted py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <Badge variant="secondary" className="text-sm font-medium">
          Sector: {sector}
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold">{title}</h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      </div>
    </section>
  );
}
