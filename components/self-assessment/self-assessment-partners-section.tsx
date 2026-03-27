"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Blob, BlobContent, BlobHeader } from "@/components/blob/blob";
import { BlobBackground } from "@/components/blob/blob-background";
import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { Eyebrow } from "@/components/blob/eyebrow";
import { PARTNERS } from "@/lib/self-assessment/self-assessment-partners";

/**
 * Partners carousel section for the self-assessment page
 * Displays logos of partner companies in an auto-scrolling carousel
 */
export function SelfAssessmentPartnersSection() {
  return (
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
  );
}
