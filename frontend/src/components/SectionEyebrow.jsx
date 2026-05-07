export default function SectionEyebrow({ label, title, description, align = "left" }) {
  const cls = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-3xl ${cls}`}>
      <div className="eyebrow">{label}</div>
      <h2 className="h2 mt-4">{title}</h2>
      {description && <p className="body-lg mt-5">{description}</p>}
    </div>
  );
}
