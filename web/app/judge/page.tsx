export default function JudgePage() {
  return (
    <main>
      <h1>Judge Console</h1>
      <p>
        Fast inputs for trick values, deductions, and composition checks will appear here. Judges will
        see the current skater, run timer, and quick access to rubric guidance.
      </p>
      <section>
        <h2>Interface goals</h2>
        <ul>
          <li>Large tap targets for per-trick scoring and deductions</li>
          <li>Offline resilience with automatic sync when the network returns</li>
          <li>Audit trail per run with finalize and flag actions</li>
        </ul>
      </section>
    </main>
  );
}
