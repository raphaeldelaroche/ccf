import { Blob, BlobContent, BlobHeader } from "@/components/blob/blob";
import { Title } from "@/components/blob/title";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { BlobBackground } from "../blob/blob-background";
import { Eyebrow } from "../blob/eyebrow";
import { SelfAssessmentIntro } from "./self-assessment-intro";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { PARTNERS } from "@/lib/self-assessment/self-assessment-partners";
import type { SectorData } from "@/lib/self-assessment/sector-data";

interface SelfAssessmentConfirmationNoDataProps {
  sectorData: SectorData;
}

export function SelfAssessmentConfirmationNoData({
  sectorData,
}: SelfAssessmentConfirmationNoDataProps) {
  const backgrounds = resolveBackgrounds(["lineSide", "plusCorners"]);

  return (
    <>
      <SelfAssessmentIntro
        stepNumber="✓"
        title="We'll get back to you with personalized information"
        subtitle="Thank you for your interest! The CCF team will reach out to you shortly with detailed insights tailored to your sector and organization."
        emphasisText="personalized information"
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
        <BlobContent className="space-y-6">
          <div>
            <Title as="h3" className="mb-4">What happens next?</Title>
            <p className="text-lg leading-relaxed">
              The Climate Contribution Framework is continuously expanding its sector coverage.
              Your information helps us prioritize which sectors to analyze next and ensures
              we can provide you with the most relevant and actionable insights.
            </p>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
            <p className="font-medium mb-2">About your sector:</p>
            <p className="text-muted-foreground">{sectorData.displayMessage}</p>
          </div>

          <div>
            <p className="text-lg leading-relaxed">
              Our team will contact you to discuss:
            </p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
              <li>How the CCF methodology can be adapted to your sector</li>
              <li>Your organization&apos;s unique climate contribution potential</li>
              <li>Opportunities to participate in developing sector-specific weightings</li>
              <li>Early access to our tools and resources</li>
            </ul>
          </div>
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
