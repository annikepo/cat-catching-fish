import { getUsers } from "../Utils/localStorageAuth";

export default function LeaderboardModal({ isOpen, onClose, currentUsername }) {
  if (!isOpen) return null;

  const usersObject = getUsers();
  const sortedPlayers = Object.values(usersObject).sort(
    (a, b) => (b.highScore || 0) - (a.highScore || 0)
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏆 Local Leaderboard</h2>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        {sortedPlayers.length === 0 ? (
          <p>No scores recorded yet. Play a round to set the first record!</p>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Best Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlayers.map((player, index) => {
                const isCurrent = player.username === currentUsername;
                return (
                  <tr
                    key={player.username}
                    className={isCurrent ? "highlight-row" : ""}
                  >
                    <td>#{index + 1}</td>
                    <td>
                      {player.username} {isCurrent && "(You)"}
                    </td>
                    <td>
                      <strong>{player.highScore || 0}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}