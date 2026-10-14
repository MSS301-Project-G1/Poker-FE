// Adapted from the Poker Rank Stitch design.
// UI copy and image assets are in English; edit this component for product work.
export default function RankedPage() {
  return <div className={"bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary"}><header className={"fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(22,6,40,0.85)]"}><div className={"h-20 w-full px-margin flex items-center justify-between gap-space-md"}><div className={"flex items-center gap-space-lg"}><div className={"flex items-center gap-space-sm"}><img alt={"Poker Rank Logo"} className={"h-8 w-auto object-contain rounded-md"} src={"/stitch-assets/logo.svg"} /><span className={"font-headline-sm text-headline-sm uppercase tracking-wider text-primary"}>POKER RANK</span></div><nav className={"hidden lg:flex items-center gap-space-xs"} data-active-classes={"bg-primary-container text-on-primary-container rounded-lg"}><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"lobby"} href={"/lobby"}>Lobby</a><a aria-current={"page"} className={"px-space-md py-space-sm font-label-action transition-all bg-primary-container text-on-primary-container rounded-lg"} data-path={"ranked"} href={"/ranked"}>Ranked</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"shop"} href={"/shop"}>Shop</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"events"} href={"/events"}>Events</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"mail"} href={"/mailbox"}>Mailbox</a></nav></div><div className={"flex items-center gap-space-md"}><div className={"hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner"}><span className={"material-symbols-outlined text-tertiary text-lg"}>toll</span><span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>1,250,000</span></div><div className={"flex items-center gap-space-xs"}><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"}><span className={"material-symbols-outlined text-lg"}>volume_up</span></button><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"}><span className={"material-symbols-outlined text-lg"}>settings</span></button></div><div className={"flex items-center gap-space-xs cursor-pointer"}><img alt={"Profile"} className={"w-8 h-8 rounded-full object-cover"} src={"/stitch-assets/avatar.svg"} /></div></div></div></header>
<main className={"w-full pt-20 flex-1 bg-surface-container-lowest"}><div className={"flex flex-col w-full"}>
<div className={"relative w-full min-h-[calc(100vh-7.5rem)] flex items-center justify-center p-space-sm sm:p-space-lg overflow-hidden"}>

<div className={"absolute inset-0 pointer-events-none opacity-35 filter blur-md select-none"}>
<div className={"w-full h-full p-margin grid grid-cols-12 gap-gutter"}>
<div className={"col-span-12 lg:col-span-8 flex flex-col gap-space-md"}>
<div className={"h-44 rounded-xl bg-surface-container-high relative overflow-hidden"}>
<div className={"absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-secondary-container/40 to-transparent"}></div>
</div>
<div className={"grid grid-cols-3 gap-space-md"}>
<div className={"h-32 rounded-lg bg-surface-container-low"}></div>
<div className={"h-32 rounded-lg bg-surface-container-low"}></div>
<div className={"h-32 rounded-lg bg-surface-container-low"}></div>
</div>
</div>
<div className={"hidden lg:flex col-span-4 flex-col gap-space-md"}>
<div className={"h-80 rounded-xl bg-surface-container-low"}></div>
<div className={"h-40 rounded-xl bg-surface-container-low"}></div>
</div>
</div>
</div>

<div className={"absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[720px] bg-primary-container/20 rounded-full blur-[140px] pointer-events-none"}></div>
<div className={"absolute -bottom-28 right-1/4 w-[480px] h-[480px] bg-secondary-container/25 rounded-full blur-[120px] pointer-events-none"}></div>

<div className={"relative z-10 w-full max-w-5xl bg-surface-container-lowest/95 backdrop-blur-2xl rounded-xl shadow-[0_24px_80px_rgba(10,2,22,0.95)] overflow-hidden flex flex-col"}>

<div className={"w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-85"}></div>

<div className={"px-space-md sm:px-space-xl pt-space-lg pb-space-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md"}>
<div className={"flex items-center gap-space-md"}>
<div className={"w-12 h-12 rounded-xl bg-primary-container/30 flex items-center justify-center shadow-[0_0_20px_rgba(176,18,155,0.35)] shrink-0"}>
<span className={"material-symbols-outlined text-primary text-2xl"} style={{"fontVariationSettings": "'FILL' 1"}}>military_tech</span>
</div>
<div className={"flex flex-col"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-space-xs py-0.5 rounded bg-tertiary-container/30 font-label-micro text-label-micro text-tertiary uppercase tracking-widest"}>RANKED SEASON 12 • 6-MAX NO-LIMIT HOLD'EM</span>
</div>
<h1 className={"font-headline-sm text-headline-sm text-on-surface tracking-wide flex items-center gap-space-xs"}>
              Ranked Match <span className={"text-tertiary font-headline-sm text-headline-sm"}>• Master Tier</span>
<span className={"font-label-micro text-label-micro px-space-xs py-0.5 rounded bg-surface-container-highest text-secondary-fixed"}>Master Tier</span>
</h1>
</div>
</div>

<div className={"flex items-center gap-space-xs self-stretch sm:self-auto justify-end bg-surface-container-low px-space-md py-space-xs rounded-lg shadow-inner"}>
<div className={"flex flex-col text-right"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant uppercase"}>BLINDS</span>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>25,000 / 50,000</span>
</div>
<span className={"material-symbols-outlined text-tertiary text-lg ml-space-xs"}>toll</span>
</div>
</div>

<div className={"px-space-md sm:px-space-xl py-space-md grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center"}>

<div className={"lg:col-span-7 flex flex-col items-center justify-center relative p-space-sm"}>
<div className={"relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center"}>

<div className={"absolute inset-0 rounded-full bg-secondary-container/15 animate-ping opacity-30"}></div>
<div className={"absolute inset-4 rounded-full bg-surface-container-high/40 shadow-inner"}></div>
<div className={"absolute inset-12 rounded-full bg-surface-container/60"}></div>
<div className={"absolute inset-24 rounded-full bg-surface-container-lowest/90 shadow-[0_0_30px_rgba(176,18,155,0.35)]"}></div>

<svg className={"absolute inset-0 w-full h-full pointer-events-none text-primary/30"} viewBox={"0 0 320 320"}>
<circle cx={"160"} cy={"160"} fill={"none"} opacity={"0.4"} r={"150"} stroke={"currentColor"} strokeDasharray={"4 6"} strokeWidth={"1"}></circle>
<circle cx={"160"} cy={"160"} fill={"none"} opacity={"0.6"} r={"110"} stroke={"currentColor"} strokeDasharray={"2 4"} strokeWidth={"1"}></circle>
<circle cx={"160"} cy={"160"} fill={"none"} opacity={"0.5"} r={"70"} stroke={"currentColor"} strokeDasharray={"6 6"} strokeWidth={"1"}></circle>

<line opacity={"0.4"} stroke={"currentColor"} strokeDasharray={"2 6"} strokeWidth={"1"} x1={"160"} x2={"160"} y1={"10"} y2={"310"}></line>
<line opacity={"0.4"} stroke={"currentColor"} strokeDasharray={"2 6"} strokeWidth={"1"} x1={"10"} x2={"310"} y1={"160"} y2={"160"}></line>
</svg>

<div className={"absolute inset-0 rounded-full overflow-hidden pointer-events-none animate-[spin_3.5s_linear_infinite]"}>
<div className={"w-1/2 h-1/2 ml-auto origin-bottom-left bg-gradient-to-tr from-primary/45 via-primary-container/20 to-transparent blur-[1px]"}></div>
</div>

<div className={"absolute top-16 left-20 w-3 h-3 rounded-full bg-primary animate-pulse shadow-[0_0_12px_#fface7]"}></div>
<div className={"absolute top-28 right-16 w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_10px_#e5c457]"}></div>
<div className={"absolute bottom-20 left-28 w-3 h-3 rounded-full bg-secondary animate-pulse shadow-[0_0_12px_#e5b5ff]"}></div>
<div className={"absolute bottom-16 right-24 w-2 h-2 rounded-full bg-primary animate-pulse"}></div>

<div className={"relative z-10 flex flex-col items-center text-center select-none"}>
<span className={"font-label-micro text-label-micro uppercase tracking-widest text-secondary-fixed-dim"}>SEARCHING TABLE</span>
<div className={"font-headline-xl text-headline-xl text-primary tracking-tight font-bold my-space-xs"} id={"radarTimer"}>
                00:28
              </div>
<div className={"flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high/70"}>
<span className={"w-2 h-2 rounded-full bg-tertiary animate-ping"}></span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Est: <strong className={"text-tertiary"}>~00:35</strong></span>
</div>
</div>
</div>

<div className={"mt-space-md flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-primary text-sm animate-spin"}>sync</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Synchronizing with VN-South server #04</span>
</div>
</div>

<div className={"lg:col-span-5 flex flex-col gap-space-md"}>
<div className={"bg-surface-container-low rounded-xl p-space-md relative overflow-hidden shadow-md"}>

<div className={"absolute -right-4 -bottom-4 text-surface-container-highest opacity-30 select-none"}>
<span className={"material-symbols-outlined text-8xl"}>local_fire_department</span>
</div>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-tertiary text-lg"}>hotel_class</span>
<span className={"font-label-action text-label-action uppercase text-tertiary"}>PERSONAL PERFORMANCE</span>
</div>
<span className={"font-label-micro text-label-micro px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant uppercase"}>Last 20 Hands</span>
</div>

<div className={"grid grid-cols-2 gap-space-sm mb-space-sm"}>
<div className={"bg-surface-container rounded-lg p-space-sm flex flex-col justify-between"}>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Current Win Streak</span>
<div className={"flex items-baseline gap-space-xs mt-space-xs"}>
<span className={"font-headline-md text-headline-md text-primary font-bold"}>4</span>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Consecutive Matches</span>
</div>
<div className={"w-full bg-surface-container-highest h-1.5 rounded-full mt-space-xs overflow-hidden"}>
<div className={"h-full bg-gradient-to-r from-primary-container to-primary w-4/5 rounded-full"}></div>
</div>
</div>
<div className={"bg-surface-container rounded-lg p-space-sm flex flex-col justify-between"}>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Final Table Rate</span>
<div className={"flex items-baseline gap-space-xs mt-space-xs"}>
<span className={"font-headline-md text-headline-md text-tertiary font-bold"}>68%</span>
<span className={"font-label-micro text-label-micro text-primary"}>(Top 2)</span>
</div>
<div className={"w-full bg-surface-container-highest h-1.5 rounded-full mt-space-xs overflow-hidden"}>
<div className={"h-full bg-gradient-to-r from-tertiary-container to-tertiary w-[68%] rounded-full"}></div>
</div>
</div>
</div>

<div className={"bg-surface-container p-space-sm rounded-lg flex items-center justify-between"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container"}>
<span className={"material-symbols-outlined text-sm"}>trending_up</span>
</div>
<div className={"flex flex-col"}>
<span className={"font-label-action text-label-action text-on-surface"}>Current ELO</span>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>+35 ELO to Grandmaster</span>
</div>
</div>
<span className={"font-label-numeric-lg text-label-numeric-lg text-secondary-fixed"}>2,485</span>
</div>
</div>

<div className={"bg-surface-container-low/60 rounded-xl p-space-sm flex items-start gap-space-sm"}>
<span className={"material-symbols-outlined text-primary text-lg mt-0.5"}>info</span>
<p className={"font-body-sm text-body-sm text-on-surface-variant leading-relaxed"}>
              Standard WSOP rules apply. Action time limit: <strong className={"text-on-surface"}>15s</strong> (+ 30s Time Bank).
            </p>
</div>
</div>
</div>

<div className={"px-space-md sm:px-space-xl pt-space-xs pb-space-md"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-action text-label-action uppercase tracking-wide text-on-surface"}>TABLE GATHERING PROGRESS</span>
<span className={"px-space-xs py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-numeric-md text-label-numeric-md"}>
              5 / 6
            </span>
</div>
<span className={"font-body-sm text-body-sm text-on-surface-variant"}>Table almost full, please get ready...</span>
</div>

<div className={"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm"}>

<div className={"bg-surface-container p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-sm group"}>
<div className={"absolute top-1.5 right-1.5"}>
<span className={"w-2 h-2 rounded-full bg-tertiary animate-pulse block"}></span>
</div>
<div className={"relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high p-0.5 mb-space-xs"}>
<img className={"w-full h-full object-cover rounded-full"} data-alt={"Cyberpunk high-roller poker master avatar, sleek neon purple visor, futuristic dark obsidian attire, glowing magenta highlights, hyper-realistic esports profile portrait"} src={"/stitch-assets/avatar.svg"} />
</div>
<div className={"flex items-center gap-space-xs w-full justify-center"}>
<span className={"font-label-micro text-label-micro text-tertiary"}>🇻🇳</span>
<span className={"font-label-action text-label-action text-on-surface truncate"}>ViperAce (You)</span>
</div>
<div className={"flex items-center justify-center gap-1 mt-1"}>
<span className={"font-label-micro text-label-micro text-primary"}>ELO</span>
<span className={"font-label-numeric-md text-label-numeric-md text-primary"}>2,485</span>
</div>
<span className={"mt-space-xs px-space-xs py-0.5 rounded bg-primary-container/40 text-on-primary-container font-label-micro text-label-micro"}>
              READY
            </span>
</div>

<div className={"bg-surface-container p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-sm"}>
<div className={"absolute top-1.5 right-1.5"}>
<span className={"w-2 h-2 rounded-full bg-tertiary block"}></span>
</div>
<div className={"relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high p-0.5 mb-space-xs"}>
<img className={"w-full h-full object-cover rounded-full"} data-alt={"Futuristic cyber gambler female avatar, sharp purple neon lighting, glowing casino cybernetic eyepiece, ultra-premium purple digital portrait"} src={"/stitch-assets/ranked-viperace-en.png"} />
</div>
<div className={"flex items-center gap-space-xs w-full justify-center"}>
<span className={"font-label-micro text-label-micro text-tertiary"}>🇯🇵</span>
<span className={"font-label-action text-label-action text-on-surface truncate"}>KuroNeko</span>
</div>
<div className={"flex items-center justify-center gap-1 mt-1"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>ELO</span>
<span className={"font-label-numeric-md text-label-numeric-md text-secondary"}>2,510</span>
</div>
<span className={"mt-space-xs px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-micro text-label-micro"}>
              CONNECTED
            </span>
</div>

<div className={"bg-surface-container p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-sm"}>
<div className={"absolute top-1.5 right-1.5"}>
<span className={"w-2 h-2 rounded-full bg-tertiary block"}></span>
</div>
<div className={"relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high p-0.5 mb-space-xs"}>
<img className={"w-full h-full object-cover rounded-full"} data-alt={"Elite poker pro avatar, confident posture, dark violet ambient lighting, glowing magenta jewelry, modern casino high-roller esports avatar"} src={"/stitch-assets/ranked-kuroneko-en.png"} />
</div>
<div className={"flex items-center gap-space-xs w-full justify-center"}>
<span className={"font-label-micro text-label-micro text-tertiary"}>🇰🇷</span>
<span className={"font-label-action text-label-action text-on-surface truncate"}>SeoulShark</span>
</div>
<div className={"flex items-center justify-center gap-1 mt-1"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>ELO</span>
<span className={"font-label-numeric-md text-label-numeric-md text-secondary"}>2,420</span>
</div>
<span className={"mt-space-xs px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-micro text-label-micro"}>
              CONNECTED
            </span>
</div>

<div className={"bg-surface-container p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-sm"}>
<div className={"absolute top-1.5 right-1.5"}>
<span className={"w-2 h-2 rounded-full bg-tertiary block"}></span>
</div>
<div className={"relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high p-0.5 mb-space-xs"}>
<img className={"w-full h-full object-cover rounded-full"} data-alt={"Mysterious high-stakes card player avatar, dark hood with neon violet trim, cybernetic hand holding glowing chips, moody cinematic lighting"} src={"/stitch-assets/ranked-seoulshark-en.png"} />
</div>
<div className={"flex items-center gap-space-xs w-full justify-center"}>
<span className={"font-label-micro text-label-micro text-tertiary"}>🇸🇬</span>
<span className={"font-label-action text-label-action text-on-surface truncate"}>LionCity_9</span>
</div>
<div className={"flex items-center justify-center gap-1 mt-1"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>ELO</span>
<span className={"font-label-numeric-md text-label-numeric-md text-secondary"}>2,605</span>
</div>
<span className={"mt-space-xs px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-micro text-label-micro"}>
              CONNECTED
            </span>
</div>

<div className={"bg-surface-container p-space-sm rounded-xl flex flex-col items-center text-center relative overflow-hidden shadow-sm"}>
<div className={"absolute top-1.5 right-1.5"}>
<span className={"w-2 h-2 rounded-full bg-tertiary block"}></span>
</div>
<div className={"relative w-14 h-14 rounded-full overflow-hidden bg-surface-container-high p-0.5 mb-space-xs"}>
<img className={"w-full h-full object-cover rounded-full"} data-alt={"Futuristic cyborg poker grandmaster, sharp purple reflections on chrome skin, luxurious royal violet atmosphere"} src={"/stitch-assets/ranked-lioncity-en.png"} />
</div>
<div className={"flex items-center gap-space-xs w-full justify-center"}>
<span className={"font-label-micro text-label-micro text-tertiary"}>🇹🇼</span>
<span className={"font-label-action text-label-action text-on-surface truncate"}>TaipeiFold</span>
</div>
<div className={"flex items-center justify-center gap-1 mt-1"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>ELO</span>
<span className={"font-label-numeric-md text-label-numeric-md text-secondary"}>2,490</span>
</div>
<span className={"mt-space-xs px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-micro text-label-micro"}>
              CONNECTED
            </span>
</div>

<div className={"bg-surface-container-low/60 p-space-sm rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner group"}>
<div className={"relative w-14 h-14 rounded-full flex items-center justify-center bg-surface-container mb-space-xs"}>
<span className={"material-symbols-outlined text-primary text-2xl animate-spin"}>hourglass_top</span>
<div className={"absolute inset-0 rounded-full bg-primary/10 animate-ping"}></div>
</div>
<span className={"font-label-action text-label-action text-primary animate-pulse uppercase"}>FINDING...</span>
<span className={"font-label-micro text-label-micro text-on-surface-variant mt-1"}>Seat #06</span>
<span className={"mt-space-xs px-space-xs py-0.5 rounded bg-surface-container-high/40 text-outline font-label-micro text-label-micro uppercase"}>
              MATCHING
            </span>
</div>
</div>
</div>

<div className={"px-space-md sm:px-space-xl py-space-md bg-surface-container-low flex flex-col-reverse sm:flex-row items-center justify-between gap-space-md"}>
<div className={"flex items-center gap-space-xs text-on-surface-variant"}>
<span className={"material-symbols-outlined text-base"}>lock</span>
<span className={"font-body-sm text-body-sm"}>Table protected by AI RNG Certified Anti-Cheat</span>
</div>
<div className={"flex items-center gap-space-md w-full sm:w-auto"}>

<button className={"flex-1 sm:flex-initial px-space-lg py-space-sm rounded-lg bg-surface-container-highest hover:bg-error-container text-on-surface hover:text-on-error-container font-label-action text-label-action transition-all flex items-center justify-center gap-space-xs shadow-md"} id={"btnCancelMatch"}>
<span className={"material-symbols-outlined text-base"}>close</span>
<span>CANCEL QUEUE</span>
</button>

<button className={"flex-1 sm:flex-initial px-space-xl py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary text-on-primary-container hover:text-on-primary font-label-action text-label-action transition-all transform active:scale-95 shadow-[0_0_24px_rgba(176,18,155,0.45)] flex items-center justify-center gap-space-xs"} id={"btnReadyMatch"}>
<span className={"material-symbols-outlined text-base"} style={{"fontVariationSettings": "'FILL' 1"}}>check_circle</span>
<span>READY TO JOIN TABLE</span>
</button>
</div>
</div>
</div>
</div>

</div></main>
<footer className={"fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(22,6,40,0.7)]"}><div className={"h-10 w-full px-margin flex items-center justify-between text-label-micro font-label-micro"}><div className={"flex items-center gap-space-sm overflow-hidden text-ellipsis whitespace-nowrap"}><div className={"flex items-center gap-space-xs text-tertiary font-bold shrink-0"}><span className={"material-symbols-outlined text-sm"}>campaign</span><span>COSMIC JACKPOT:</span></div><span className={"text-tertiary font-label-numeric-md text-label-numeric-md font-bold shrink-0"}>848,290,000 CHIPS</span><span className={"text-outline shrink-0"}>•</span><div className={"flex items-center gap-space-xs text-on-surface-variant overflow-hidden text-ellipsis whitespace-nowrap"}><span>Congratulations to player</span><span className={"text-primary font-bold"}>ShadowAce</span><span>for winning</span><span className={"text-tertiary font-bold"}>+45,000,000 Chips</span><span>at High Roller #07 table</span></div></div><div className={"hidden md:flex items-center gap-space-md text-on-surface-variant shrink-0"}><div className={"flex items-center gap-space-xs"}><span className={"w-2 h-2 rounded-full bg-tertiary animate-pulse"}></span><span>Online: 14,892</span></div><span>|</span><span>Ping: 18ms</span></div></div></footer></div>
}
