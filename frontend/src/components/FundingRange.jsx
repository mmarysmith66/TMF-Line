export default function FundingRange({ className = "" }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      $5K&ndash;
      <span
        aria-label="infinity"
        className="inline-block leading-none ml-[0.06em] text-[1.5em] relative top-[-0.04em]"
      >
        ∞
      </span>
    </span>
  );
}
