import { Icon } from '@/shared/ui'

// Demo queue until matchmaking is connected. The first entry is the current player.
const players = [
  { name: 'ViperAce (You)', flag: '🇻🇳', elo: '2,485', avatar: '/stitch-assets/avatar.svg', you: true },
  { name: 'KuroNeko', flag: '🇯🇵', elo: '2,510', avatar: '/stitch-assets/ranked-viperace-en.png' },
  { name: 'SeoulShark', flag: '🇰🇷', elo: '2,420', avatar: '/stitch-assets/ranked-kuroneko-en.png' },
  { name: 'LionCity_9', flag: '🇸🇬', elo: '2,605', avatar: '/stitch-assets/ranked-seoulshark-en.png' },
  { name: 'TaipeiFold', flag: '🇹🇼', elo: '2,490', avatar: '/stitch-assets/ranked-lioncity-en.png' },
]
const tableSize = 6

function PlayerSlot({ player }) {
  return <div className="bg-surface-container p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-sm">
    <div className="absolute top-1.5 right-1.5">
      <span className={`w-2 h-2 rounded-full bg-tertiary block ${player.you ? 'animate-pulse' : ''}`}></span>
    </div>
    <div className="relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high p-0.5 mb-space-xs">
      <img alt={`${player.name} avatar`} className="w-full h-full object-cover rounded-full" src={player.avatar} />
    </div>
    <div className="flex items-center gap-space-xs w-full justify-center">
      <span className="font-label-micro text-label-micro text-tertiary">{player.flag}</span>
      <span className="font-label-action text-label-action text-on-surface truncate">{player.name}</span>
    </div>
    <div className="flex items-center justify-center gap-1 mt-1">
      <span className={`font-label-micro text-label-micro ${player.you ? 'text-primary' : 'text-on-surface-variant'}`}>ELO</span>
      <span className={`font-label-numeric-md text-label-numeric-md ${player.you ? 'text-primary' : 'text-secondary'}`}>{player.elo}</span>
    </div>
    <span className={`mt-space-xs px-space-xs py-0.5 rounded font-label-micro text-label-micro ${player.you
      ? 'bg-primary-container/40 text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
      {player.you ? 'READY' : 'CONNECTED'}
    </span>
  </div>
}

function OpenSeat({ seat }) {
  return <div className="bg-surface-container-low/60 p-space-sm rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
    <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-surface-container mb-space-xs">
      <Icon name="hourglass_top" className="text-primary text-2xl animate-spin" />
      <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
    </div>
    <span className="font-label-action text-label-action text-primary animate-pulse uppercase">FINDING...</span>
    <span className="font-label-micro text-label-micro text-on-surface-variant mt-1">Seat #{String(seat).padStart(2, '0')}</span>
    <span className="mt-space-xs px-space-xs py-0.5 rounded bg-surface-container-high/40 text-outline font-label-micro text-label-micro uppercase">MATCHING</span>
  </div>
}

export default function TableGathering() {
  const openSeats = Array.from({ length: tableSize - players.length }, (_, index) => players.length + index + 1)
  return <div className="px-space-md sm:px-space-xl pt-space-xs pb-space-md">
    <div className="flex items-center justify-between mb-space-sm">
      <div className="flex items-center gap-space-xs">
        <span className="font-label-action text-label-action uppercase tracking-wide text-on-surface">TABLE GATHERING PROGRESS</span>
        <span className="px-space-xs py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-numeric-md text-label-numeric-md">
          {players.length} / {tableSize}
        </span>
      </div>
      <span className="font-body-sm text-body-sm text-on-surface-variant">Table almost full, please get ready...</span>
    </div>

    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
      {players.map(player => <PlayerSlot key={player.name} player={player} />)}
      {openSeats.map(seat => <OpenSeat key={seat} seat={seat} />)}
    </div>
  </div>
}
