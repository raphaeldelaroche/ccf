import { Blob, BlobContent, BlobHeader } from "@/components/blob/blob";
import { BlobGrid } from "@/components/blob/blob-grid";
import { Title } from "@/components/blob/title";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { BlobBackground } from "../blob/blob-background";
import { Eyebrow } from "../blob/eyebrow";
import { Marker } from "../blob/marker";
import { TrendingDown, Zap, Landmark, type LucideIcon } from "lucide-react";
import { SelfAssessmentIntro } from "./self-assessment-intro";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { PARTNERS } from "@/lib/self-assessment/self-assessment-partners";

const PILLARS: Array<{
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  theme: "lime" | "cyan" | "fuchsia";
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "pillar-reduction",
    eyebrow: "Pillar A",
    title: "Reduction",
    subtitle: "Carbon footprint reduction",
    theme: "lime" as const,
    description:
      "Direct and indirect emissions, transition plans, climate governance.",
    icon: TrendingDown,
  },
  {
    id: "pillar-solutions",
    eyebrow: "Pillar B",
    title: "Solutions",
    subtitle: "Climate solutions",
    theme: "cyan" as const,
    description:
      "Pillar B recognizes companies whose products and services enable avoided emissions or generate negative emissions beyond their own footprint.",
    icon: Zap,
  },
  {
    id: "pillar-finance",
    eyebrow: "Pillar C",
    title: "Finance",
    subtitle: "Climate finance",
    theme: "fuchsia" as const,
    description:
      "Pillar C values voluntary financial contributions to climate mitigation — particularly those made outside the company's value chain.",
    icon: Landmark,
  },
];

export function SelfAssessmentConfirmation() {
  const backgrounds = resolveBackgrounds(["lineSide", "plusCorners"]);

  return (
    <>
      <SelfAssessmentIntro
        stepNumber="✓"
        title="Your contribution potential is on its way"
        subtitle="Check your inbox, you'll receive a personalised link to your result in the next few minutes."
        emphasisText="on its way"
        style="active"
      />
      
      <Blob
         responsive={{
          base: {
            paddingX: "container-xl",
            paddingY: "xl"
          }
         }}
        >
        <BlobBackground backgrounds={backgrounds} />
        <BlobContent>

          <p>Your result is built on the three dimensions of climate contribution defined by the CCF:</p>

          <BlobGrid
            responsiveLayout="blob-iterator-grid-1 lg:blob-iterator-grid-3"
            gapX="md"
            gapY="md"
            paddingX="none"
          >


          {PILLARS.map((pillar) => (
            <Blob
              key={pillar.id}
              responsive={{
                base: {
                  marker: "left",
                  layout: "stack",
                  size: "lg",
                  align: "left",
                  paddingX: "2xl",
                  paddingY: "2xl",
                },
              }}
              theme={pillar.theme}
              className="border border-primary/50 rounded-lg overflow-hidden bg-primary/10"
            >

              <Marker className="w-media">
                <pillar.icon />
              </Marker>

              <BlobHeader>
                <Eyebrow>
                  {pillar.eyebrow}
                </Eyebrow>
                <Title as="h3" className="text-center">
                  {pillar.title}
                </Title>
                {/* <Subtitle className="text-center">{pillar.subtitle}</Subtitle> */}
              </BlobHeader>

              <BlobContent>
                {pillar.description}
              </BlobContent>
            </Blob>
          ))}
          </BlobGrid>
        </BlobContent>
      </Blob>

          <Blob
      responsive={{
        base: {
          layout: "stack",
          paddingX: "xs",
          paddingY: "xs",
          align: "center",
        },
        md: {
          paddingX: "container-2xl",
          paddingY: "md",
        },
      }}
    >
      <BlobBackground
        backgrounds={resolveBackgrounds([
          "solidGray",
          "plusCorners",
          "lineTop",
          "lineBottom",
          "lineSide",
          "gradientfromtransparentToBlackToTransparent",
        ])}
      />

      <BlobHeader>
        <Eyebrow>They already assess their contributive potential</Eyebrow>
      </BlobHeader>

      <BlobContent>
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView="auto"
          loop={true}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          speed={3000}
          className="partners-swiper"
        >
          {PARTNERS.map((partner) => (
            <SwiperSlide key={partner.id} className="!w-32 md:!w-48">
              <div className="relative h-16 md:h-20 xl:h-24 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                <Image
                  src={partner.logo}
                  alt={`${partner.id} logo`}
                  fill
                  className="object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </BlobContent>
    </Blob>
    </>
  );
}
