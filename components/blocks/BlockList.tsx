import { BlobIterator } from "@/components/blob/blob-iterator"
import { Blob } from "@/components/blob/blob"
import { Title } from "@/components/blob/title"
import { Subtitle } from "@/components/blob/subtitle"
import { Marker } from "@/components/blob/marker"
import { resolveAppearance } from "@/config/blob-appearances"
import { renderIconObject } from "@/lib/render-icon"
import { iconOptions } from "@/lib/blob-fields"

interface ListItem {
  title: string
  subtitle?: string
}

interface BlockListProps {
  items: ListItem[]
  icon?: string
}

const appearanceConfig = resolveAppearance("list")

export function BlockList({ items, icon = "arrowRight" }: BlockListProps) {
  if (!items.length) return null

  const selectedIcon = iconOptions[icon] ?? iconOptions["arrowRight"]

  return (
    <BlobIterator containerLayout="grid-1" gapX="md" gapY="none">
      {items.map((item, i) => (
        <Blob
          key={i}
          responsive={{
            base: {
              size: "xs",
              marker: "left",
              paddingX: "none",
              paddingY: "none",
            }
          }}
          className={appearanceConfig.blobClassName}
        >
          <Marker variant="ghost" className={appearanceConfig.markerClassName}>
            {selectedIcon && renderIconObject(selectedIcon.iconObject)}
          </Marker>
          <Blob.Header className={appearanceConfig.headerClassName}>
            <Title>{item.title}</Title>
            {item.subtitle && <Subtitle>{item.subtitle}</Subtitle>}
          </Blob.Header>
        </Blob>
      ))}
    </BlobIterator>
  )
}
