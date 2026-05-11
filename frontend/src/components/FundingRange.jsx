export default function FundingRange({ className = "" }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      $5K&ndash;
      <span
        aria-label="infinity"
        className="inline-block leading-none ml-[0.06em] text-[1.75em] relative top-[0.08em]"
      >
        ∞
      </span>
    </span>
  );
}
