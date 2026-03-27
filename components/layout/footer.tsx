import { resolveBackgrounds } from "@/config/blob-backgrounds";
import { Blob, BlobContent } from "../blob/blob";
import { BlobBackground } from "../blob/blob-background";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full">
      
        <Blob
            responsive={{
              base: {
                layout: "stack",
                paddingX: "xs",
                paddingY: "none",
              },
              md: {
                paddingX: "container-2xl",
                paddingY: "none",
              },
            }}
          >
            <BlobBackground
              backgrounds={resolveBackgrounds([
                "solidGray",
                "plusCorners",
                "plusPattern",
                "lineBottom",
                "lineTop",
                "lineSide",
                "gradientfromtransparentToBlackToTransparent",
              ])}
            />
          <BlobContent className="bg-white">
            <Blob
              responsive={{
                base: {
                  marker: "left",
                  markerWidth: "default",
                  layout: "stack",
                  size: "md",
                  align: "left",
                  paddingX: "lg",
                  paddingY: "lg",
                },
                md: {
                  paddingY: "4xl",
                  paddingX: "container-xl",
                  gapY: "none",
                },
              }}
            >

            <BlobBackground backgrounds={resolveBackgrounds(["solidGray"])} />

            <BlobContent>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">

                <div className="flex items-center gap-6 grayscale">
                  <Image
                    src="/founders-logo/sweep-logo.webp"
                    alt="Logo Sweep"
                    width={120}
                    height={50}
                    className="shrink-0 -mb-3 object-contain object-center"
                  />
                  <Image
                    src="/founders-logo/logo-mirova.svg"
                    alt="Logo Mirova Research Center"
                    width={100}
                    height={50}
                    className="shrink-0 object-contain object-center"  
                  />
                </div>

                <div>
                  © 2026 The Climate Contribution Framework
                </div>

              </div>
            </BlobContent>
          </Blob>
          </BlobContent>
        </Blob>
    </footer>
  );
}
