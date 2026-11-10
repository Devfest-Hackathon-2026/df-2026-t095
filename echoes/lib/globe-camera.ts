export type ViewExtent = { widthKm: number; heightKm: number };
/** Fit a padded geographic extent inside both axes of the camera's field of view. */
export function globeRangeForExtent(
  extent: ViewExtent,
  viewport: { width: number; height: number },
) {
  const aspect = Math.max(0.2, viewport.width / Math.max(1, viewport.height));
  const verticalSpan = Math.max(extent.heightKm, extent.widthKm / aspect) * 1000;
  return Math.max(800, (verticalSpan * 1.4) / (2 * Math.tan((20 * Math.PI) / 180)));
}
