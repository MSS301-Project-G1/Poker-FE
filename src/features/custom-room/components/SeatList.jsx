export default function SeatList({ room, accountId, profiles, busy, onKick, onTransfer }) {
  const isOwner = room.ownerId === accountId
  const waiting = room.status === 'WAITING'
  const empty = Math.max(0, room.maxPlayers - room.members.length)
  return <ol className="room-seats" aria-label="Seats">
    {room.members.map((member, index) => {
      const name = profiles[member.accountId]?.displayName || `Player ${member.accountId.slice(-6)}`
      return <li key={member.accountId} className={`room-seat ${member.accountId === accountId ? 'room-seat-you' : ''}`}>
        <span className="room-seat-number">{index + 1}</span>
        <span className="room-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <div className="room-seat-name"><strong>{name}</strong>
          <span>{member.owner && <em className="room-tag room-tag-host">Host</em>}{member.accountId === accountId && <em className="room-tag">You</em>}</span></div>
        <span className={`room-ready ${member.owner || member.ready ? 'room-ready-on' : ''}`}>{member.owner ? 'Hosting' : member.ready ? 'Ready' : 'Not ready'}</span>
        {isOwner && !member.owner && <div className="room-seat-actions">
          <button className="room-link" disabled={busy} onClick={() => onTransfer(member.accountId)}>Make host</button>
          {waiting && <button className="room-link room-link-danger" disabled={busy} onClick={() => onKick(member.accountId)}>Remove</button>}
        </div>}
      </li>
    })}
    {Array.from({ length: empty }, (_, index) => <li key={`empty-${index}`} className="room-seat room-seat-empty">
      <span className="room-seat-number">{room.members.length + index + 1}</span><span>Open seat</span></li>)}
  </ol>
}
