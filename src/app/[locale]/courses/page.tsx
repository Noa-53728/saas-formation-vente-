export default function CoursesIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Formations</h1>
      <p className="text-white/70">
        Sélectionnez une formation ou créez-en une nouvelle.
      </p>

      <a
        href="/courses/new"
        className="button-primary inline-block"
      >
        ➕ Publier une formation
      </a>
    </div>
  );
}
