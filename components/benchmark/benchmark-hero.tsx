import { Blob } from "@/components/blob/blob";
import { Title } from "@/components/blob/title";
import { Subtitle } from "@/components/blob/subtitle";
import { BlobBackground } from "@/components/blob/blob-background";
import { resolveBackgrounds, resolveBackgroundClasses } from "@/config/blob-backgrounds";
import { cn } from "@/lib/utils";
import type { BlobConfig } from "@/lib/blob-compose";

export function BenchmarkHero() {
  const backgrounds = resolveBackgrounds(["plusCorners", "grid"]);
  const backgroundClasses = resolveBackgroundClasses(["plusCorners", "grid"]);

  const blobConfig: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",
        size: "xl",
        align: "left",
        paddingX: "container-xl",
        paddingY: "2xl",
      },
      md: {
        size: "2xl",
        paddingY: "4xl",
      },
    },
  };

  return (
    <section className="bg-background border-b border-border">
      <Blob {...blobConfig} className={cn(backgroundClasses, backgrounds.length > 0 && "relative")}>
        <BlobBackground backgrounds={backgrounds} />
        <Blob.Header>
          <Title as="h1" emphasisText="climate impact potential">Discover your climate impact potential</Title>
          <Subtitle>
            In just 3 questions, uncover what your company could contribute to the global climate effort — beyond emissions, including the solutions you enable and the finance you mobilise.
          </Subtitle>
        </Blob.Header>
      </Blob>
    </section>
  );
}
