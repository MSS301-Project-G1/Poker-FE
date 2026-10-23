// Demo jackpot ticker. Replace the static values when a live feed exists.
export default function TickerFooter() {
  return <footer className="fixed bottom-0 left-0 right-0 z-footer bg-surface-container-lowest/90 backdrop-blur-md shadow-footer">
    <div className="h-10 w-full px-margin flex items-center justify-between text-label-micro font-label-micro">
      <div className="flex items-center gap-space-sm overflow-hidden text-ellipsis whitespace-nowrap">
        <div className="flex items-center gap-space-xs text-tertiary font-bold shrink-0">
          <span className="material-symbols-outlined text-sm">campaign</span><span>COSMIC JACKPOT:</span>
        </div>
        <span className="text-tertiary font-label-numeric-md text-label-numeric-md font-bold shrink-0">848,290,000 CHIPS</span>
        <span className="text-outline shrink-0">•</span>
        <div className="flex items-center gap-space-xs text-on-surface-variant overflow-hidden text-ellipsis whitespace-nowrap">
          <span>Congrats player</span><span className="text-primary font-bold">ShadowAce</span><span>on winning</span>
          <span className="text-tertiary font-bold">+45,000,000 Chips</span><span>at High Roller table #07</span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-space-md text-on-surface-variant shrink-0">
        <div className="flex items-center gap-space-xs"><span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span><span>Online: 14,892</span></div>
        <span>|</span>
        <span>Ping: 18ms</span>
      </div>
    </div>
  </footer>
}
