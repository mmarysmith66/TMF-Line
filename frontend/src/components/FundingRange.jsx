export default function FundingRange({ className = "" }) {
  return (
    <span className={`inline-flex items-center align-baseline ${className}`}>
      $5K&ndash;
      <span
        aria-label="infinity"
        className="inline-block leading-none ml-[0.05em] relative text-[1.55em] -mt-[0.15em]"
      >
        ∞
      </span>
    </span>
  );
}
