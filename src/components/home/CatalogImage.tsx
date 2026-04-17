import Image from "next/image";

interface CatalogImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

function isLocalAsset(src: string) {
  return src.startsWith("/") || src.startsWith("data:");
}

export function CatalogImage({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: CatalogImageProps) {
  if (isLocalAsset(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={className}
        sizes={sizes}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={className}
    />
  );
}