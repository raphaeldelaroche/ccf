import type { BlobConfig } from '@/lib/blob-compose'
import { Blob } from '@/components/blob/blob'
import { Title } from '@/components/blob/title'
import { Subtitle } from '@/components/blob/subtitle'
import { Button } from '@/components/ui/button'
import { resolveBlobStyling } from '@/config/blob-config'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NetZeroCTAProps {
  href?: string
}

export function NetZeroCTA({ href = "/scorecard-request" }: NetZeroCTAProps) {
  // Configuration du Blob parent (conteneur)
  const parentConfig: BlobConfig = {
    responsive: {
      base: {
        layout: "stack",
        direction: "default",
        align: "center",
        size: "4xl",
        paddingY: "lg",
        headerPaddingX: "container-md",
        paddingX: "container-xl"
      },
      lg: {
        paddingY: "4xl"
      }
    }
  }

  // Résolution du styling parent
  const parentStyling = resolveBlobStyling(
    ["greenPhoto"],      // background
    ["darkBackground"]   // appearance
  )

  // Configuration du Blob enfant (innerBlock)
  const childConfig: BlobConfig = {
    responsive: {
      base: {
        size: "md",
        layout: "stack",
        align: "center",
        direction: "default",
        marker: "top",
        actions: "before",
        paddingX: "xl",
        paddingY: "xl"
      },
      md: {
        size: "xl",
        paddingY: "xl"
      },
      xl: {
        size: "2xl",
        layout: "bar",
        align: "left",
        direction: "default",
        marker: "top",
        actions: "before",
        paddingX: "container-lg",
        paddingY: "5xl"
      }
    }
  }

  // Résolution du styling enfant
  const childStyling = resolveBlobStyling(
    ["solidWhite", "grid"],  // backgrounds
    ["rounded"]              // appearance
  )

  return (
    <Blob
      {...parentConfig}
      className={cn(parentStyling.blobClassName)}
    >
      {parentStyling.backgrounds}

      <Blob.Content>
        {/* Blob enfant imbriqué */}
        <Blob
          {...childConfig}
          className={cn(childStyling.blobClassName)}
        >
          {childStyling.backgrounds}

          <Blob.Header>
            <Title as="h2">
              Discover your actual contribution
            </Title>
            <Subtitle>
              This self-assessment reveals your potential. The CCF scorecard measures where you
              truly stand — and what your investors, your clients and your peers don’t
              yet see in your climate actions.
            </Subtitle>
          </Blob.Header>

          <Blob.Actions>
            <Button
              asChild
              variant="default"
              data-theme="brand"
              className="theme-brand"
            >
              <Link href={href}>
                Request my full scorecard
              </Link>
            </Button>
          </Blob.Actions>
        </Blob>
      </Blob.Content>
    </Blob>
  )
}
