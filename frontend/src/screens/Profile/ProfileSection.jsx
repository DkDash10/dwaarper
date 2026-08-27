export default function ProfileSection({ title, description, children, action }) {
  return (
    <section className="border-t border-white/[0.08] py-8">
      <div className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">{title}</h2>

          {description && <p className="mt-2 text-sm text-white/40">{description}</p>}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}
