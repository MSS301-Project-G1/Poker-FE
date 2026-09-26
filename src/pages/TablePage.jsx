// Adapted from the Poker Rank Stitch design.
// UI copy and image assets are in English; edit this component for product work.
export default function TablePage() {
  return <div className={"bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary"}><header className={"fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(22,6,40,0.85)]"}><div className={"h-20 w-full px-margin flex items-center justify-between gap-space-md"}><div className={"flex items-center gap-space-lg"}><div className={"flex items-center gap-space-sm"}><img alt={"Poker Rank Logo"} className={"h-9 w-auto object-contain rounded-md"} src={"/stitch-assets/logo.svg"} /><span className={"font-headline-sm text-headline-sm uppercase tracking-wider text-primary font-bold"}>POKER RANK</span></div><nav className={"hidden lg:flex items-center gap-space-xs"} data-active-classes={"bg-primary-container text-on-primary-container rounded-lg"}><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"lobby"} href={"/lobby"}>Lobby</a><a aria-current={"page"} className={"px-space-md py-space-sm font-label-action transition-all bg-primary-container text-on-primary-container rounded-lg"} data-path={"ranked"} href={"/ranked"}>Ranked</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"shop"} href={"/shop"}>Shop</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"events"} href={"/events"}>Events</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"mail"} href={"/mailbox"}>Mailbox</a></nav></div><div className={"flex items-center gap-space-md"}><div className={"hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner"}><span className={"material-symbols-outlined text-tertiary text-lg"}>toll</span><span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>1,250,000</span></div><div className={"flex items-center gap-space-xs"}><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"}><span className={"material-symbols-outlined text-lg"}>volume_up</span></button><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"}><span className={"material-symbols-outlined text-lg"}>settings</span></button></div><div className={"flex items-center gap-space-xs cursor-pointer"}><img alt={"Profile"} className={"w-8 h-8 rounded-full object-cover ring-1 ring-primary/40"} src={"/stitch-assets/avatar.svg"} /></div></div></div></header>
<main className={"w-full pt-20 flex-1 bg-surface-container-lowest"}><div className={"flex flex-col w-full relative select-none pb-12 overflow-hidden"}>

<div className={"absolute inset-0 pointer-events-none overflow-hidden"}>
<div className={"absolute top-12 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-secondary-container/20 blur-[130px] rounded-full"}></div>
<div className={"absolute top-32 left-1/4 w-[380px] h-[380px] bg-primary-container/25 blur-[100px] rounded-full"}></div>
<div className={"absolute top-44 right-1/4 w-[420px] h-[420px] bg-tertiary/10 blur-[110px] rounded-full"}></div>
<div className={"absolute -top-20 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(176,18,155,0.18)_0%,transparent_70%)]"}></div>
</div>

<div className={"relative w-full max-w-[1560px] mx-auto px-gutter flex flex-col items-center justify-between min-h-[calc(100vh-5rem)] py-space-sm"}>

<div className={"w-full flex items-center justify-between z-20 px-space-md py-space-xs rounded-xl bg-surface-container/70 backdrop-blur-xl shadow-lg"}>
<div className={"flex items-center gap-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"}></span>
<span className={"w-2 h-2 rounded-full bg-tertiary -ml-3.5"}></span>
<span className={"font-headline-sm text-headline-sm tracking-wide text-on-surface"}>• HIGH-ROLLER TABLE #09</span>
</div>
<span className={"px-space-sm py-0.5 rounded bg-primary-container/40 text-primary font-label-micro text-label-micro uppercase tracking-wider"}>NO LIMIT HOLD'EM</span>
<span className={"text-on-surface-variant font-body-sm text-body-sm"}>Blinds: <strong className={"text-tertiary font-label-numeric-md text-label-numeric-md"}>25,000 / 50,000</strong></span>
<span className={"text-outline-variant font-label-micro text-label-micro"}>• Ante: 5,000</span>
</div>
<div className={"flex items-center gap-space-sm"}>
<div className={"flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full text-on-surface-variant text-label-micro font-label-micro"}>
<span className={"material-symbols-outlined text-sm text-primary"}>history</span>
<span>HAND: #VN-884920</span>
</div>
<button className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"}>
<span className={"material-symbols-outlined text-base"}>view_in_ar</span>
</button>
<button className={"w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all"}>
<span className={"material-symbols-outlined text-base"}>fullscreen</span>
</button>
</div>
</div>

<div className={"relative w-full max-w-[1380px] h-[590px] my-space-xs flex items-center justify-center"}>

<div className={"absolute inset-0 rounded-[280px] bg-gradient-to-b from-[#2e0947] via-[#1a0429] to-[#0f0219] p-4 shadow-[0_24px_70px_rgba(10,2,22,0.95)]"}>

<div className={"w-full h-full rounded-[264px] p-1.5 bg-gradient-to-r from-primary-container via-[#fface7] to-secondary-container shadow-[0_0_28px_rgba(255,172,231,0.55),inset_0_0_16px_rgba(176,18,155,0.7)]"}>

<div className={"w-full h-full rounded-[256px] p-1 bg-gradient-to-b from-tertiary/60 via-surface-container-lowest to-tertiary-container/40"}>

<div className={"relative w-full h-full rounded-[252px] bg-[radial-gradient(ellipse_at_center,_#340b5c_0%,_#21063d_50%,_#130224_100%)] shadow-[inset_0_0_80px_rgba(10,2,22,0.98)] overflow-hidden flex items-center justify-center"}>

<div className={"absolute inset-0 opacity-[0.07] flex items-center justify-center pointer-events-none"}>
<svg className={"text-primary stroke-current"} fill={"none"} height={"340"} viewBox={"0 0 680 340"} width={"680"}>
<ellipse cx={"340"} cy={"170"} rx={"310"} ry={"140"} strokeDasharray={"12 12"} strokeWidth={"2"}></ellipse>
<ellipse cx={"340"} cy={"170"} rx={"270"} ry={"110"} strokeWidth={"1.5"}></ellipse>
<circle cx={"340"} cy={"170"} r={"70"} strokeWidth={"1"}></circle>
<path d={"M 280 170 L 400 170 M 340 110 L 340 230"} strokeWidth={"1"}></path>
</svg>
</div>

<div className={"absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-space-xs text-primary/20 pointer-events-none"}>
<span className={"material-symbols-outlined text-4xl"}>crown</span>
<span className={"font-headline-lg text-headline-lg tracking-[0.25em] font-bold"}>POKER RANK CLUB</span>
<span className={"material-symbols-outlined text-4xl"}>crown</span>
</div>

<div className={"absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10"}>
<div className={"flex items-center gap-space-xs bg-surface-container-lowest/80 px-space-md py-1 rounded-full shadow-md"}>
<div className={"w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center"}>
<span className={"material-symbols-outlined text-sm text-tertiary"}>smart_toy</span>
</div>
<span className={"font-label-action text-label-action text-on-surface-variant"}>DEALER AI - SERAPHINA</span>
<div className={"w-2 h-2 rounded-full bg-primary animate-pulse"}></div>
</div>

<div className={"mt-1 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-container-high/90 shadow-inner"}>
<div className={"w-5 h-7 rounded-sm bg-gradient-to-b from-secondary to-primary-container shadow-sm -rotate-6"}></div>
<div className={"w-5 h-7 rounded-sm bg-gradient-to-b from-primary to-secondary-container shadow-sm rotate-6"}></div>
<div className={"w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-inner"}>
<span className={"material-symbols-outlined text-xs text-tertiary"}>style</span>
</div>
</div>
</div>

<div className={"relative z-10 flex flex-col items-center mt-6"}>

<div className={"flex flex-col items-center mb-space-sm"}>
<div className={"px-space-lg py-1.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_8px_24px_rgba(229,196,87,0.25)] flex items-center gap-space-sm"}>
<span className={"material-symbols-outlined text-tertiary text-xl"} style={{"fontVariationSettings": "'FILL' 1"}}>monetization_on</span>
<span className={"font-headline-sm text-headline-sm text-tertiary tracking-wider font-bold"}>TOTAL POT: 480,000 CHIPS</span>
<span className={"px-space-xs py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-micro text-label-micro"}>TURN</span>
</div>

<div className={"flex items-center -space-x-3 mt-1.5 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"}>
<div className={"w-7 h-7 rounded-full bg-gradient-to-br from-tertiary to-on-tertiary-container ring-2 ring-tertiary flex items-center justify-center font-label-micro text-[10px] text-surface-container-lowest font-bold"}>100k</div>
<div className={"w-7 h-7 rounded-full bg-gradient-to-br from-primary-container to-on-primary ring-2 ring-primary flex items-center justify-center font-label-micro text-[10px] text-on-primary font-bold"}>50k</div>
<div className={"w-7 h-7 rounded-full bg-gradient-to-br from-secondary-container to-on-secondary ring-2 ring-secondary flex items-center justify-center font-label-micro text-[10px] text-on-secondary font-bold"}>10k</div>
<div className={"w-7 h-7 rounded-full bg-gradient-to-br from-tertiary to-on-tertiary-container ring-2 ring-tertiary flex items-center justify-center font-label-micro text-[10px] text-surface-container-lowest font-bold"}>100k</div>
</div>
</div>

<div className={"flex items-center gap-space-sm p-space-sm rounded-2xl bg-surface-container-lowest/50 backdrop-blur-md shadow-2xl"}>

<div className={"w-16 h-24 rounded-lg bg-[#f7f3fb] text-[#0f081d] flex flex-col justify-between p-1.5 shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-transform"}>
<div className={"flex flex-col items-center leading-none"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>10</span>
<span className={"text-sm"}>♠</span>
</div>
<div className={"text-center text-2xl leading-none"}>♠</div>
<div className={"flex flex-col items-center leading-none rotate-180"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>10</span>
<span className={"text-sm"}>♠</span>
</div>
</div>

<div className={"w-16 h-24 rounded-lg bg-[#f7f3fb] text-[#0f081d] flex flex-col justify-between p-1.5 shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-transform"}>
<div className={"flex flex-col items-center leading-none"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>J</span>
<span className={"text-sm"}>♠</span>
</div>
<div className={"text-center text-2xl leading-none font-bold"}>J♠</div>
<div className={"flex flex-col items-center leading-none rotate-180"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>J</span>
<span className={"text-sm"}>♠</span>
</div>
</div>

<div className={"w-16 h-24 rounded-lg bg-[#f7f3fb] text-[#b01248] flex flex-col justify-between p-1.5 shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-transform"}>
<div className={"flex flex-col items-center leading-none"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>Q</span>
<span className={"text-sm"}>♥</span>
</div>
<div className={"text-center text-2xl leading-none font-bold"}>Q♥</div>
<div className={"flex flex-col items-center leading-none rotate-180"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>Q</span>
<span className={"text-sm"}>♥</span>
</div>
</div>

<div className={"w-16 h-24 rounded-lg bg-[#f7f3fb] text-[#c58a14] flex flex-col justify-between p-1.5 shadow-[0_6px_14px_rgba(0,0,0,0.45)] hover:-translate-y-1 transition-transform ring-2 ring-tertiary/70"}>
<div className={"flex flex-col items-center leading-none"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>2</span>
<span className={"text-sm"}>♦</span>
</div>
<div className={"text-center text-2xl leading-none"}>♦</div>
<div className={"flex flex-col items-center leading-none rotate-180"}>
<span className={"font-headline-sm text-headline-sm font-bold"}>2</span>
<span className={"text-sm"}>♦</span>
</div>
</div>

<div className={"w-16 h-24 rounded-lg bg-surface-container-high p-1 shadow-[0_6px_14px_rgba(0,0,0,0.65)] relative group cursor-pointer"}>
<div className={"w-full h-full rounded bg-gradient-to-br from-primary-container via-surface-container-lowest to-secondary-container flex flex-col items-center justify-center p-1 shadow-inner relative overflow-hidden"}>
<div className={"absolute inset-0 bg-[radial-gradient(#fface7_1px,transparent_1px)] [background-size:6px_6px] opacity-30"}></div>
<span className={"material-symbols-outlined text-tertiary text-2xl animate-pulse"}>lock</span>
<span className={"font-label-micro text-label-micro text-primary-fixed uppercase tracking-wider mt-1 font-bold"}>RIVER</span>
</div>
</div>
</div>

<div className={"mt-space-xs flex items-center gap-space-xs text-primary font-label-action text-label-action"}>
<span className={"material-symbols-outlined text-sm"}>auto_awesome</span>
<span>Waiting for 10♠, J♠, Q♥ + A♠, K♠ (Royal Flush Draw)</span>
</div>
</div>
</div>
</div>
</div>
</div>




<div className={"absolute -top-3 left-[18%] z-30 flex flex-col items-center"}>
<div className={"relative bg-surface-container-low/90 backdrop-blur-xl p-space-xs rounded-xl shadow-xl flex items-center gap-space-xs w-44"}>
<div className={"relative"}>
<img className={"w-11 h-11 rounded-lg object-cover"} data-alt={"Cyberpunk high roller male avatar with neon green glowing visor and holographic trench coat in a futuristic neon casino tournament"} src={"/stitch-assets/table-ghostrider-en.png"} />
<span className={"absolute -bottom-1 -right-1 px-1 rounded bg-surface-container-highest text-[10px] font-label-micro text-on-surface"}>P1</span>
</div>
<div className={"flex-1 min-w-0"}>
<div className={"font-label-action text-label-action truncate text-on-surface"}>GhostRider</div>
<div className={"font-label-numeric-md text-label-numeric-md text-tertiary flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-xs"}>toll</span>890,000 Chips
            </div>
<div className={"text-[11px] font-label-micro text-outline uppercase font-semibold"}>FOLD</div>
</div>
</div>

<div className={"flex -space-x-4 -mt-2 opacity-40"}>
<div className={"w-7 h-10 rounded bg-surface-container-highest shadow rotate-[-12deg]"}></div>
<div className={"w-7 h-10 rounded bg-surface-container-highest shadow rotate-[8deg]"}></div>
</div>
</div>

<div className={"absolute -top-3 right-[18%] z-30 flex flex-col items-center"}>
<div className={"relative bg-surface-container-low/90 backdrop-blur-xl p-space-xs rounded-xl shadow-xl flex items-center gap-space-xs w-44"}>
<div className={"relative"}>
<img className={"w-11 h-11 rounded-lg object-cover"} data-alt={"Futuristic cybernetic female poker player with glowing magenta hair and golden cyber-implants in luxury high stakes casino"} src={"/stitch-assets/table-valkyrie-en.png"} />
<span className={"absolute -bottom-1 -right-1 px-1 rounded bg-surface-container-highest text-[10px] font-label-micro text-on-surface"}>P2</span>
</div>
<div className={"flex-1 min-w-0"}>
<div className={"font-label-action text-label-action truncate text-on-surface"}>ValkyrieX</div>
<div className={"font-label-numeric-md text-label-numeric-md text-tertiary flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-xs"}>toll</span>2,140,000 Chips
            </div>
<div className={"text-[11px] font-label-micro text-primary uppercase font-bold"}>CALL 50,000</div>
</div>
</div>

<div className={"mt-2 flex items-center gap-1 bg-surface-container-lowest/80 px-2 py-0.5 rounded-full text-tertiary font-label-numeric-md text-xs shadow"}>
<span className={"w-2.5 h-2.5 rounded-full bg-primary inline-block"}></span> 50,000
        </div>
</div>

<div className={"absolute top-[42%] -left-6 z-30 flex items-center gap-space-xs"}>
<div className={"relative bg-surface-container-low/90 backdrop-blur-xl p-space-xs rounded-xl shadow-xl flex items-center gap-space-xs w-44"}>
<div className={"relative"}>
<img className={"w-11 h-11 rounded-lg object-cover"} data-alt={"Chic cybernetic female assassin themed poker player with glowing cat-ear audio headset and futuristic purple leather aesthetic"} src={"/stitch-assets/table-neonkat-en.png"} />
<span className={"absolute -bottom-1 -right-1 px-1 rounded bg-surface-container-highest text-[10px] font-label-micro text-on-surface"}>D</span>
</div>
<div className={"flex-1 min-w-0"}>
<div className={"font-label-action text-label-action truncate text-on-surface"}>NeonKat</div>
<div className={"font-label-numeric-md text-label-numeric-md text-tertiary flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-xs"}>toll</span>620,000 Chips
            </div>
<div className={"text-[11px] font-label-micro text-secondary uppercase font-semibold"}>CHECK</div>
</div>
</div>

<div className={"flex -space-x-3"}>
<div className={"w-8 h-12 rounded bg-gradient-to-br from-primary-container to-surface-container-lowest shadow-md -rotate-6"}></div>
<div className={"w-8 h-12 rounded bg-gradient-to-br from-primary-container to-surface-container-lowest shadow-md rotate-6"}></div>
</div>
</div>

<div className={"absolute top-[42%] -right-6 z-30 flex items-center gap-space-xs flex-row-reverse"}>
<div className={"relative bg-surface-container-low/90 backdrop-blur-xl p-space-xs rounded-xl shadow-xl flex items-center gap-space-xs w-44"}>
<div className={"relative"}>
<img className={"w-11 h-11 rounded-lg object-cover"} data-alt={"Imposing cyborg high-roller poker master with neon cyber eye monocle and bespoke velvet purple tuxedo in elite poker suite"} src={"/stitch-assets/table-apextitan-en.png"} />
<span className={"absolute -bottom-1 -right-1 px-1 rounded bg-surface-container-highest text-[10px] font-label-micro text-on-surface"}>SB</span>
</div>
<div className={"flex-1 min-w-0"}>
<div className={"font-label-action text-label-action truncate text-on-surface"}>ApexTitan</div>
<div className={"font-label-numeric-md text-label-numeric-md text-tertiary flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-xs"}>toll</span>3,480,000 Chips
            </div>
<div className={"text-[11px] font-label-micro text-outline uppercase font-semibold"}>FOLD</div>
</div>
</div>

<div className={"flex -space-x-3 opacity-30"}>
<div className={"w-8 h-12 rounded bg-surface-container-highest shadow rotate-12"}></div>
</div>
</div>

<div className={"absolute -bottom-4 right-[16%] z-30 flex flex-col items-center"}>

<div className={"mb-2 flex items-center gap-1 bg-surface-container-lowest/80 px-2 py-0.5 rounded-full text-tertiary font-label-numeric-md text-xs shadow"}>
<span className={"w-2.5 h-2.5 rounded-full bg-tertiary inline-block"}></span> 50,000
        </div>
<div className={"relative bg-surface-container-low/90 backdrop-blur-xl p-space-xs rounded-xl shadow-xl flex items-center gap-space-xs w-44"}>
<div className={"relative"}>
<img className={"w-11 h-11 rounded-lg object-cover"} data-alt={"Young cyber prodigy gamer wearing violet tinted sunglasses and glowing neon jacket in high stakes tournament"} src={"/stitch-assets/table-zerolag-en.png"} />
<span className={"absolute -bottom-1 -right-1 px-1 rounded bg-surface-container-highest text-[10px] font-label-micro text-on-surface"}>BB</span>
</div>
<div className={"flex-1 min-w-0"}>
<div className={"font-label-action text-label-action truncate text-on-surface"}>ZeroLag</div>
<div className={"font-label-numeric-md text-label-numeric-md text-tertiary flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-xs"}>toll</span>1,810,000 Chips
            </div>
<div className={"text-[11px] font-label-micro text-primary uppercase font-bold"}>CALL 50,000</div>
</div>
</div>
</div>



<div className={"absolute -bottom-10 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center"}>

<div className={"relative flex flex-col items-center"}>

<div className={"px-space-md py-1 rounded-full bg-gradient-to-r from-primary-container via-primary to-secondary-container text-on-primary font-label-action text-label-action shadow-[0_0_20px_rgba(255,172,231,0.6)] animate-bounce flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-base"}>timer</span>
<span>YOUR TURN (18s)</span>
</div>

<div className={"mt-1 relative p-1 rounded-2xl bg-gradient-to-r from-primary via-tertiary to-primary-container shadow-[0_0_35px_rgba(176,18,155,0.7)]"}>
<div className={"bg-surface-container-lowest/95 backdrop-blur-2xl rounded-[14px] p-space-sm flex items-center gap-space-md min-w-[340px]"}>

<div className={"relative"}>
<div className={"w-16 h-16 rounded-xl p-0.5 bg-gradient-to-tr from-tertiary via-primary to-secondary shadow-lg"}>
<img alt={"CyberKing Avatar"} className={"w-full h-full object-cover rounded-[10px]"} src={"/stitch-assets/avatar.svg"} />
</div>

<div className={"absolute -bottom-2 -right-1 px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-micro text-[10px] font-bold"}>
                  YOU
                </div>
</div>

<div className={"flex-1 min-w-0"}>
<div className={"flex items-center justify-between"}>
<span className={"font-headline-sm text-headline-sm text-primary-fixed font-bold tracking-wide"}>CyberKing</span>
<span className={"px-2 py-0.5 rounded bg-primary-container/40 text-primary font-label-micro text-[11px] font-semibold"}>POSITION: HJ</span>
</div>
<div className={"font-label-numeric-lg text-label-numeric-lg text-tertiary flex items-center gap-1 mt-0.5"}>
<span className={"material-symbols-outlined text-lg"} style={{"fontVariationSettings": "'FILL' 1"}}>monetization_on</span>
<span>1,450,000 Chips</span>
</div>
<div className={"text-on-surface-variant font-body-sm text-body-sm flex items-center gap-1"}>
<span>Current bet:</span>
<span className={"text-on-surface font-bold"}>50,000 Chips</span>
</div>
</div>
</div>
</div>
</div>

<div className={"flex items-center -space-x-6 -mt-3 z-50"}>

<div className={"w-24 h-36 rounded-xl bg-gradient-to-b from-[#ffffff] via-[#f7f0fb] to-[#eedef7] text-[#0f081d] p-2 shadow-[0_12px_32px_rgba(176,18,155,0.6)] flex flex-col justify-between -rotate-6 hover:-translate-y-4 hover:rotate-0 transition-all duration-200 cursor-pointer relative ring-2 ring-primary"}>
<div className={"absolute inset-0 bg-gradient-to-tr from-transparent via-primary/15 to-transparent pointer-events-none rounded-xl"}></div>
<div className={"flex flex-col items-center leading-none"}>
<span className={"font-headline-lg text-headline-lg font-black tracking-tight"}>A</span>
<span className={"text-lg"}>♠</span>
</div>
<div className={"text-center"}>
<span className={"material-symbols-outlined text-4xl text-[#1a082c]"}>stars</span>
</div>
<div className={"flex flex-col items-center leading-none rotate-180"}>
<span className={"font-headline-lg text-headline-lg font-black tracking-tight"}>A</span>
<span className={"text-lg"}>♠</span>
</div>
</div>

<div className={"w-24 h-36 rounded-xl bg-gradient-to-b from-[#ffffff] via-[#f7f0fb] to-[#eedef7] text-[#0f081d] p-2 shadow-[0_12px_32px_rgba(229,196,87,0.6)] flex flex-col justify-between rotate-6 hover:-translate-y-4 hover:rotate-0 transition-all duration-200 cursor-pointer relative ring-2 ring-tertiary"}>
<div className={"absolute inset-0 bg-gradient-to-tr from-transparent via-tertiary/15 to-transparent pointer-events-none rounded-xl"}></div>
<div className={"flex flex-col items-center leading-none"}>
<span className={"font-headline-lg text-headline-lg font-black tracking-tight"}>K</span>
<span className={"text-lg"}>♠</span>
</div>
<div className={"text-center font-headline-md text-headline-md font-extrabold text-[#1a082c]"}>
              K♠
            </div>
<div className={"flex flex-col items-center leading-none rotate-180"}>
<span className={"font-headline-lg text-headline-lg font-black tracking-tight"}>K</span>
<span className={"text-lg"}>♠</span>
</div>
</div>
</div>
</div>
</div>



<div className={"w-full grid grid-cols-12 gap-space-md items-end z-40 mt-1"}>

<div className={"col-span-3 flex flex-col gap-space-xs"}>

<div className={"p-space-sm rounded-xl bg-surface-container/85 backdrop-blur-xl shadow-lg flex flex-col gap-1.5 h-28 overflow-hidden"}>
<div className={"flex items-center justify-between text-on-surface-variant font-label-micro text-label-micro"}>
<span className={"flex items-center gap-1"}><span className={"material-symbols-outlined text-xs"}>forum</span> TABLE CHAT</span>
<span className={"text-tertiary"}>Table (6/6)</span>
</div>
<div className={"flex-1 flex flex-col justify-end text-xs space-y-1"}>
<div className={"truncate text-on-surface-variant"}><span className={"text-secondary font-semibold"}>ZeroLag:</span> Nice pot! Great cards.</div>
<div className={"truncate text-on-surface-variant"}><span className={"text-primary font-semibold"}>ValkyrieX:</span> Heavy raise, who dares call?</div>
<div className={"truncate text-primary-fixed"}><span className={"text-tertiary font-semibold"}>System:</span> CyberKing is thinking...</div>
</div>
</div>

<div className={"flex items-center gap-space-xs"}>
<button className={"flex-1 py-1.5 px-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-action text-label-action flex items-center justify-center gap-1 transition-all"}>
<span className={"material-symbols-outlined text-sm text-primary"}>add_reaction</span>
<span>Emoji</span>
</button>
<button className={"py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all flex items-center justify-center"}>
<span className={"material-symbols-outlined text-sm text-tertiary"}>celebration</span>
</button>
<button className={"py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all flex items-center justify-center"}>
<span className={"material-symbols-outlined text-sm"}>record_voice_over</span>
</button>
<button className={"py-1.5 px-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all flex items-center justify-center"}>
<span className={"material-symbols-outlined text-sm"}>flag</span>
</button>
</div>
</div>

<div className={"col-span-6 flex flex-col items-center gap-space-xs bg-surface-container-lowest/90 p-space-sm rounded-2xl backdrop-blur-2xl shadow-[0_16px_40px_rgba(10,2,22,0.9)]"}>

<div className={"w-full flex items-center gap-space-sm px-space-xs"}>

<div className={"flex items-center gap-1.5"}>
<button className={"px-2.5 py-1 rounded-md bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-action text-label-action transition-all"}>Min</button>
<button className={"px-2.5 py-1 rounded-md bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container text-on-surface-variant font-label-action text-label-action transition-all"}>1/2 Pot</button>
<button className={"px-2.5 py-1 rounded-md bg-secondary-container text-on-secondary-container font-label-action text-label-action transition-all"}>Pot</button>
<button className={"px-2.5 py-1 rounded-md bg-primary-container/40 hover:bg-primary-container text-primary font-label-action text-label-action transition-all"}>All-In</button>
</div>

<div className={"flex-1 flex items-center gap-space-xs"}>
<input className={"w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary"} id={"betSlider"} max={"1450000"} min={"100000"} step={"25000"} type={"range"} defaultValue={"480000"} />
</div>

<div className={"flex items-center gap-1 bg-surface-container-high px-space-sm py-1 rounded-lg"}>
<span className={"material-symbols-outlined text-tertiary text-sm"}>toll</span>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary"} id={"betDisplayVal"}>480,000</span>
</div>
</div>

<div className={"w-full grid grid-cols-3 gap-space-sm"}>

<button className={"py-3 px-space-md rounded-xl bg-surface-container-high/90 hover:bg-[#4a0827] text-on-surface-variant hover:text-error transition-all flex flex-col items-center justify-center gap-0.5 group"}>
<span className={"font-headline-sm text-headline-sm uppercase tracking-wider font-bold"}>FOLD</span>
<span className={"font-label-micro text-label-micro opacity-70 group-hover:opacity-100"}>Fold hand</span>
</button>

<button className={"py-3 px-space-md rounded-xl bg-gradient-to-r from-secondary-container to-[#51167a] hover:from-[#7e25b3] hover:to-[#5e188f] text-on-secondary-container shadow-[0_4px_16px_rgba(108,35,153,0.5)] transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"}>
<span className={"font-headline-sm text-headline-sm uppercase tracking-wider font-bold text-white"}>CALL</span>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary font-bold"}>50,000 CHIPS</span>
</button>

<button className={"py-3 px-space-md rounded-xl bg-gradient-to-r from-primary-container via-[#c415ad] to-[#e61bc8] hover:brightness-110 text-on-primary shadow-[0_4px_24px_rgba(176,18,155,0.65)] transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"}>
<span className={"font-headline-sm text-headline-sm uppercase tracking-wider font-bold text-white flex items-center gap-1"}>
<span>RAISE</span>
<span className={"material-symbols-outlined text-lg"}>bolt</span>
</span>
<span className={"font-label-numeric-md text-label-numeric-md text-primary-fixed font-bold"} id={"raiseBtnAmount"}>480,000 CHIPS</span>
</button>
</div>
</div>

<div className={"col-span-3 flex flex-col gap-space-xs"}>
<div className={"p-space-sm rounded-xl bg-surface-container/85 backdrop-blur-xl shadow-lg flex flex-col gap-2"}>
<div className={"flex items-center justify-between"}>
<div className={"flex items-center gap-1 text-tertiary font-label-action text-label-action"}>
<span className={"material-symbols-outlined text-sm"}>query_stats</span>
<span>WIN ODDS</span>
</div>
<span className={"px-2 py-0.5 rounded bg-tertiary-container/40 text-tertiary font-label-numeric-md text-xs font-bold"}>78.4%</span>
</div>

<div className={"flex items-center gap-space-md"}>
<div className={"relative w-14 h-14 shrink-0 flex items-center justify-center"}>
<svg className={"w-full h-full -rotate-90"} viewBox={"0 0 36 36"}>

<path className={"text-surface-container-high stroke-current"} d={"M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"} fill={"none"} strokeWidth={"3.5"}></path>

<path className={"text-primary stroke-current"} d={"M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"} fill={"none"} strokeDasharray={"78.4, 100"} strokeLinecap={"round"} strokeWidth={"3.5"}></path>
</svg>
<div className={"absolute inset-0 flex flex-col items-center justify-center leading-none"}>
<span className={"font-label-numeric-md text-label-numeric-md text-on-surface font-bold"}>78%</span>
</div>
</div>
<div className={"flex-1 flex flex-col justify-center"}>
<div className={"font-label-action text-label-action text-primary font-bold"}>Royal Flush Draw</div>
<div className={"text-[12px] font-body-sm text-on-surface-variant leading-tight"}>Waiting for 10♠, J♠, Q♥ + A♠, K♠. Need 1 Spade card!</div>
</div>
</div>

<div className={"grid grid-cols-2 gap-1 pt-1"}>
<div className={"bg-surface-container-low px-2 py-1 rounded text-[11px] font-label-micro text-on-surface-variant flex justify-between"}>
<span>Flush Outs:</span>
<strong className={"text-primary font-bold"}>9 Cards</strong>
</div>
<div className={"bg-surface-container-low px-2 py-1 rounded text-[11px] font-label-micro text-on-surface-variant flex justify-between"}>
<span>Royal Outs:</span>
<strong className={"text-tertiary font-bold"}>1 Card (10♠)</strong>
</div>
</div>
</div>
</div>
</div>
</div>


</div></main>
<footer className={"fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(22,6,40,0.7)]"}><div className={"h-10 w-full px-margin flex items-center justify-between text-label-micro font-label-micro"}><div className={"flex items-center gap-space-sm overflow-hidden text-ellipsis whitespace-nowrap"}><div className={"flex items-center gap-space-xs text-tertiary font-bold shrink-0"}><span className={"material-symbols-outlined text-sm"}>campaign</span><span>COSMIC JACKPOT:</span></div><span className={"text-tertiary font-label-numeric-md text-label-numeric-md font-bold shrink-0"}>848,290,000 CHIPS</span><span className={"text-outline shrink-0"}>•</span><div className={"flex items-center gap-space-xs text-on-surface-variant overflow-hidden text-ellipsis whitespace-nowrap"}><span>Congratulations to</span><span className={"text-primary font-bold"}>ShadowAce</span><span>for winning</span><span className={"text-tertiary font-bold"}>+45,000,000 Chips</span><span>at High Roller Table #07</span></div></div><div className={"hidden md:flex items-center gap-space-md text-on-surface-variant shrink-0"}><div className={"flex items-center gap-space-xs"}><span className={"w-2 h-2 rounded-full bg-tertiary animate-pulse"}></span><span>Online: 14,892</span></div><span>|</span><span>Ping: 18ms</span></div></div></footer></div>
}
