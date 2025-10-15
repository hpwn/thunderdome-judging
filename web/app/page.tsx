export default function HomePage() {
  return (
    <main>
      <h1>Thunderdome Judging Control Center</h1>
      <p>
        This is the operations hub for freestyle contest staff. Use the navigation to visit the admin
        dashboard, judge console, or public leaderboard.
      </p>
      <nav>
        <ul>
          <li>
            <a href="/admin">Admin</a>
          </li>
          <li>
            <a href="/judge">Judge Console</a>
          </li>
          <li>
            <a href="/leaderboard">Leaderboard</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
