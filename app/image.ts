export function optimizedImage(src: string, width = 1200, quality = 78) {
  if (!src.startsWith("/")) return src;
  return `/.netlify/images?url=${src}&w=${width}&q=${quality}`;
}

export function optimizedBackground(src: string, width = 1920, quality = 78) {
  return `url('${optimizedImage(src, width, quality)}')`;
}
