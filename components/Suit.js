export default function Suit({ base = "#000", accent = "#ff4a0a", trim = "#fff", id = "suit", label = "Leather garment", decorative = false }) {
  const body =
    "M85 18L115 18L152 34L188 200L162 206L146 110L142 210L138 388L104 388L100 230L96 230L96 388L62 388L58 210L54 110L38 206L12 200L48 34Z";
  const a11y = decorative ? { "aria-hidden": "true", focusable: "false" } : { role: "img", "aria-label": label };
  return (
    <svg viewBox="0 0 200 400" {...a11y}>
      <defs><clipPath id={id}><path d={body} /></clipPath></defs>
      <path d={body} fill={base} />
      <g clipPath={`url(#${id})`}>
        <path d="M70 30h60l-3 85H73z" fill={accent} />
        <path d="M12 200l36-166h14L28 204z" fill={trim} />
        <path d="M188 200L152 34h-14l34 170z" fill={trim} />
        <path d="M58 210h14l-4 180H58zM128 210h14l-4 180h-10z" fill={accent} />
        <rect x="0" y="126" width="200" height="6" fill={trim} />
      </g>
      <path d={body} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
    </svg>
  );
}
