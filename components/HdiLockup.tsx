/**
 * PLINTH HDI lockup: the official PLINTH monogram and "PLINTH" letterforms, taken unchanged from
 * the approved PLINTH Network lockup vector (public/plinth-logo-lockup-navy.svg). Only the
 * "NETWORK" line is replaced by "HDI", set in Jost 500, centred under PLINTH and enlarged about 1.5x
 * over the original subline so the product name stays legible at header size.
 * Single colour (currentColor): brand navy on light grounds, white on dark.
 */
const PATH =
  "M0.46 0.12 L-0.04 158.88 L63.08 216.25 L63.45 170.62 L31.58 139.88 L31.58 34.12 L89.45 33.50 L144.33 88.75 L145.08 39.25 L100.45 0.00 Z M62.95 67.25 L62.33 68.00 L62.45 133.00 L62.95 133.38 L99.70 133.12 L124.45 109.00 L124.45 107.88 L84.20 67.38 Z M253.96 55.62 L244.58 53.62 L210.33 53.50 L209.71 53.88 L209.46 124.75 L209.83 125.25 L223.83 125.12 L223.83 104.12 L224.46 103.25 L243.46 103.25 L249.83 102.25 L255.08 100.38 L258.95 98.25 L263.45 94.12 L265.58 91.12 L267.58 86.88 L268.58 82.38 L268.70 75.25 L267.70 70.00 L265.58 65.38 L262.83 61.75 L257.83 57.62 Z M296.33 53.75 L296.08 124.88 L296.83 125.38 L347.20 125.38 L347.70 124.62 L347.70 114.00 L347.08 112.62 L311.33 112.75 L310.45 112.12 L310.33 54.12 L309.33 53.50 Z M374.45 53.62 L373.95 54.62 L373.95 124.75 L374.58 125.38 L388.08 125.38 L388.58 124.88 L388.45 54.12 L387.33 53.50 Z M420.33 53.75 L420.08 125.00 L434.58 124.75 L435.08 78.88 L472.45 125.12 L485.20 125.25 L485.33 53.88 L471.20 54.12 L471.33 99.62 L470.45 100.00 L433.20 53.75 Z M572.21 53.75 L511.83 53.88 L511.58 65.62 L512.08 66.38 L534.21 66.38 L534.83 67.00 L535.08 125.25 L548.58 125.38 L549.33 124.88 L549.33 66.75 L572.08 66.38 L572.58 65.75 Z M599.46 53.75 L599.21 124.88 L613.58 125.00 L613.83 95.50 L646.08 95.25 L647.21 96.00 L647.21 124.88 L661.33 125.25 L661.46 54.00 L647.33 53.88 L646.83 82.25 L614.46 82.50 L613.58 81.62 L613.46 54.00 Z M224.08 66.75 L224.46 66.38 L225.21 66.25 L242.46 66.38 L244.33 66.62 L246.83 67.38 L249.33 68.62 L251.96 71.00 L252.71 72.00 L253.71 74.25 L254.21 77.12 L254.21 79.88 L253.71 82.75 L252.71 84.88 L251.71 86.25 L249.21 88.50 L247.96 89.25 L244.96 90.38 L240.83 90.88 L224.58 90.88 L223.96 90.12 Z";

export default function HdiLockup({ height = 40, className }: { height?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 664.83 219.5"
      height={height}
      width={(height * 664.83) / 219.5}
      role="img"
      aria-label="PLINTH HDI"
      className={className}
    >
      <path d={PATH} fill="currentColor" fillRule="evenodd" />
      <text
        x="436"
        y="198"
        dx="10"
        textAnchor="middle"
        fontFamily="Jost, 'Inter Variable', sans-serif"
        fontWeight={500}
        fontSize="54"
        letterSpacing="20"
        fill="currentColor"
      >
        HDI
      </text>
    </svg>
  );
}
