// Adapted from the Poker Rank Stitch design.
// UI copy and image assets are in English; edit this component for product work.
export default function LobbyPage() {
  return <div className={"bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary"}><header className={"fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(22,6,40,0.85)]"}><div className={"h-20 w-full px-margin flex items-center justify-between gap-space-md"}><div className={"flex items-center gap-space-lg"}><div className={"flex items-center gap-space-sm"}><img alt={"Poker Rank Logo"} className={"h-9 w-auto object-contain rounded-md"} src={"/stitch-assets/logo.svg"} /><span className={"font-headline-sm text-headline-sm uppercase tracking-wider text-primary"}>POKER RANK</span></div><nav className={"hidden lg:flex items-center gap-space-xs"} data-active-classes={"bg-primary-container text-on-primary-container rounded-lg"}><a aria-current={"page"} className={"px-space-md py-space-sm font-label-action transition-all bg-primary-container text-on-primary-container rounded-lg"} data-path={"lobby"} href={"/lobby"}>Lobby</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"ranked"} href={"/ranked"}>Ranked</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"shop"} href={"/shop"}>Shop</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"events"} href={"/events"}>Events</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"mail"} href={"/mailbox"}>Mailbox</a></nav></div><div className={"flex items-center gap-space-md"}><div className={"hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner"}><span className={"material-symbols-outlined text-tertiary text-lg"}>toll</span><span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>1,250,000</span></div><div className={"flex items-center gap-space-xs"}><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"} title={"Audio"}><span className={"material-symbols-outlined text-lg"}>volume_up</span></button><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"} title={"Settings"}><span className={"material-symbols-outlined text-lg"}>settings</span></button></div><div className={"flex items-center gap-space-xs cursor-pointer"}><img alt={"Profile"} className={"w-8 h-8 rounded-full object-cover ring-2 ring-primary/40"} src={"/stitch-assets/avatar.svg"} /></div></div></div></header>
<main className={"w-full pt-20 flex-1 bg-surface-container-lowest"}><div className={"flex flex-col w-full relative pb-16 px-margin"}>
<div className={"w-full max-w-7xl mx-auto pt-6 flex flex-col gap-space-lg"}>

<div className={"flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-low/70 backdrop-blur-xl p-space-md rounded-xl shadow-lg relative overflow-hidden"}>
<div className={"absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-2xl pointer-events-none"}></div>
<div className={"flex items-center gap-space-md z-10 w-full md:w-auto"}>
<div className={"relative shrink-0"}>
<img alt={"Player Avatar"} className={"w-14 h-14 rounded-xl object-cover shadow-md"} data-alt={"Cyberpunk luxury male poker master avatar glowing purple neon edges violet aesthetic high stakes portrait 3d render"} src={"/stitch-assets/avatar.svg"} />

</div>
<div className={"flex flex-col min-w-0"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-headline-sm text-headline-sm text-on-surface truncate"}>Royal_King_99</span>
<span className={"material-symbols-outlined text-tertiary text-sm"} style={{"fontVariationSettings": "'FILL' 1"}}>verified</span>
</div>
<div className={"flex items-center gap-space-sm text-body-sm font-body-sm text-on-surface-variant"}>
<span>Win Rate: <strong className={"text-tertiary font-label-numeric-md"}>68.4%</strong></span>
<span className={"text-outline-variant"}>•</span>
<span>Best Hand: <strong className={"text-primary font-label-numeric-md"}>Royal Flush</strong></span>
</div>
</div>
</div>
<div className={"flex items-center gap-space-sm w-full md:w-auto justify-end z-10"}>
<button className={"flex items-center gap-space-xs px-space-md py-space-sm bg-gradient-to-r from-primary-container to-secondary-container rounded-lg text-on-primary font-label-action text-label-action shadow-md hover:brightness-110 active:scale-98 transition-all"} id={"openDailyBtn"}>
<span className={"material-symbols-outlined text-tertiary text-lg animate-bounce"} style={{"fontVariationSettings": "'FILL' 1"}}>calendar_month</span>
<span>7-Day Check-in</span>
<span className={"w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse ml-1"}></span>
</button>
<button className={"flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high rounded-lg text-on-surface font-label-action text-label-action hover:bg-surface-variant transition-all"}>
<span className={"material-symbols-outlined text-primary text-lg"}>history_edu</span>
<span className={"hidden sm:inline"}>History Log</span>
</button>
</div>
</div>

<div className={"grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start"}>

<div className={"lg:col-span-8 flex flex-col gap-gutter"}>

<div className={"group relative rounded-xl overflow-hidden bg-surface-container shadow-xl transition-all duration-300 hover:shadow-2xl"}>
<div className={"absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"} data-alt={"Deep purple futuristic esports poker arena cyber neon lights glass trophy glowing magenta felt atmosphere dark obsidian background luxury high stakes"} style={{"backgroundImage": "url('/stitch-assets/lobby-ranked-banner.jpg')"}}></div>
<div className={"absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-transparent"}></div>
<div className={"relative p-space-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md min-h-[220px]"}>
<div className={"flex flex-col gap-space-xs max-w-md"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-2 py-0.5 rounded-full bg-primary-container/80 text-on-primary-container text-label-micro font-label-micro tracking-widest uppercase"}>Season S6</span>
<span className={"text-tertiary text-label-micro font-label-micro flex items-center gap-0.5"}>
<span className={"material-symbols-outlined text-xs"}>timer</span> 12 days left
                </span>
</div>
<h2 className={"font-headline-lg text-headline-lg text-primary tracking-wide drop-shadow-md"}>GLOBAL RANKED MATCH</h2>
<p className={"font-body-sm text-body-sm text-on-surface-variant"}>Compete with 50,000 poker champions worldwide. Current: <span className={"text-tertiary font-bold"}>Master II</span> (89/100 Points). Earn Exclusive Badges &amp; 50M Season Reward Chips.</p>

<div className={"w-full bg-surface-container-highest/80 rounded-full h-2 mt-space-xs overflow-hidden"}>
<div className={"bg-gradient-to-r from-secondary to-primary h-full rounded-full"} style={{"width": "89%"}}></div>
</div>
</div>
<div className={"flex flex-col sm:flex-row items-center gap-space-sm w-full md:w-auto shrink-0"}>
<button className={"w-full sm:w-auto px-space-xl py-space-md bg-gradient-to-r from-primary-container to-secondary-container hover:from-primary hover:to-secondary-container text-on-primary font-label-action text-label-action rounded-lg shadow-xl shadow-primary-container/30 active:scale-95 transition-all flex items-center justify-center gap-space-xs"}>
<span className={"material-symbols-outlined"}>swords</span>
<span>FIND MATCH NOW</span>
</button>
</div>
</div>
</div>

<div className={"group relative rounded-xl overflow-hidden bg-surface-container shadow-xl transition-all duration-300 hover:shadow-2xl"}>
<div className={"absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"} data-alt={"Luxurious private poker poker lounge dark purple velvet chairs gold rimmed tables glass whiskey decanter ambient purple lighting subtle bokeh"} style={{"backgroundImage": "url('/stitch-assets/lobby-casual-banner.jpg')"}}></div>
<div className={"absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/85 to-surface-container-lowest/40"}></div>
<div className={"relative p-space-lg flex flex-col gap-space-md"}>
<div className={"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-xs"}>
<div>
<span className={"px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-micro font-label-micro uppercase tracking-wider"}>Free Play • Casual</span>
<h2 className={"font-headline-lg text-headline-lg text-secondary mt-1"}>ROUND TABLE CASUAL</h2>
</div>
<div className={"flex items-center gap-space-xs bg-surface-container-high/80 px-space-sm py-1 rounded-full text-on-surface-variant text-label-micro font-label-micro"}>
<span className={"w-2 h-2 rounded-full bg-tertiary"}></span>
<span>8,420 Active Tables</span>
</div>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant max-w-lg"}>Choose a room tailored to your bankroll or create private friendly tables with your crew.</p>

<div className={"grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs"}>
<button className={"flex flex-col items-center justify-center p-space-sm bg-surface-container-low/90 hover:bg-primary-container/40 rounded-lg transition-all group/btn"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>Beginner</span>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary mt-0.5"}>1K / 2K</span>
<span className={"text-on-surface-variant text-[10px]"}>Buy-in: 40K</span>
</button>
<button className={"flex flex-col items-center justify-center p-space-sm bg-surface-container-low/90 hover:bg-primary-container/40 rounded-lg transition-all group/btn"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>Intermediate</span>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary mt-0.5"}>10K / 20K</span>
<span className={"text-on-surface-variant text-[10px]"}>Buy-in: 400K</span>
</button>
<button className={"flex flex-col items-center justify-center p-space-sm bg-surface-container-low/90 hover:bg-primary-container/40 rounded-lg transition-all group/btn"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>High Roller</span>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary mt-0.5"}>100K / 200K</span>
<span className={"text-on-surface-variant text-[10px]"}>Buy-in: 4M</span>
</button>
<button className={"flex flex-col items-center justify-center p-space-sm bg-surface-container-low/90 hover:bg-primary-container/40 rounded-lg transition-all group/btn"}>
<span className={"font-label-micro text-label-micro text-primary"}>Master</span>
<span className={"font-label-numeric-md text-label-numeric-md text-primary mt-0.5"}>1M / 2M</span>
<span className={"text-on-surface-variant text-[10px]"}>Buy-in: 40M</span>
</button>
</div>

<div className={"flex flex-wrap items-center justify-between gap-space-sm pt-space-xs"}>
<button className={"flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-high hover:bg-surface-variant rounded-lg text-on-surface font-label-action text-label-action transition-all"}>
<span className={"material-symbols-outlined text-secondary"}>group_add</span>
<span>Create Private Room</span>
</button>
<button className={"flex items-center gap-space-xs px-space-lg py-space-sm bg-secondary-container hover:bg-primary-container text-on-secondary-container hover:text-on-primary-container font-label-action text-label-action rounded-lg shadow-md transition-all"}>
<span className={"material-symbols-outlined text-lg"}>bolt</span>
<span>QUICK PLAY</span>
</button>
</div>
</div>
</div>

<div className={"group relative rounded-xl overflow-hidden bg-surface-container shadow-xl transition-all duration-300 hover:shadow-2xl"}>
<div className={"absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"} data-alt={"Grand championship poker stage golden trophy massive glowing LED screen with purple lasers cinematic smoke atmospheric stadium championship"} style={{"backgroundImage": "url('/stitch-assets/lobby-championship-en.png')"}}></div>
<div className={"absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-surface-container-lowest/30"}></div>
<div className={"relative p-space-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-space-md"}>
<div className={"flex flex-col gap-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-2 py-0.5 rounded-full bg-tertiary-container/60 text-tertiary text-label-micro font-label-micro font-bold uppercase"}>MAJOR EVENT</span>
<span className={"text-primary text-label-micro font-label-micro"}>Texas Hold'em Masters S6</span>
</div>
<h2 className={"font-headline-lg text-headline-lg text-tertiary drop-shadow-md"}>CHAMPIONSHIP TOURNAMENT</h2>
<div className={"flex items-baseline gap-space-xs mt-1"}>
<span className={"text-on-surface-variant font-body-sm text-body-sm"}>Total Prize Pool:</span>
<span className={"font-label-numeric-lg text-label-numeric-lg text-tertiary"}>50,000,000 CHIPS</span>
</div>

<div className={"flex items-center gap-space-xs bg-surface-container-lowest/80 backdrop-blur-md px-space-md py-space-xs rounded-lg mt-space-xs w-fit"}>
<span className={"material-symbols-outlined text-error text-sm animate-pulse"}>timer</span>
<span className={"text-on-surface font-label-numeric-md text-label-numeric-md tracking-wider"}>01:42:18</span>
<span className={"text-on-surface-variant text-label-micro font-label-micro"}>until registration closes</span>
</div>
</div>
<div className={"flex flex-col sm:flex-row items-center gap-space-sm w-full md:w-auto shrink-0"}>
<button className={"w-full sm:w-auto px-space-lg py-space-md bg-gradient-to-r from-tertiary-container to-tertiary text-on-tertiary font-label-action text-label-action rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-space-xs"}>
<span className={"material-symbols-outlined"}>emoji_events</span>
<span>REGISTER (100K)</span>
</button>
</div>
</div>
</div>
</div>

<div className={"lg:col-span-4 flex flex-col gap-space-md bg-surface-container-low/80 backdrop-blur-xl p-space-md rounded-xl shadow-xl"}>
<div className={"flex items-center justify-between pb-space-xs"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-tertiary text-xl"} style={{"fontVariationSettings": "'FILL' 1"}}>military_tech</span>
<h3 className={"font-headline-sm text-headline-sm text-on-surface"}>Leaderboard</h3>
</div>
<span className={"text-label-micro font-label-micro uppercase tracking-wider text-primary bg-primary-container/30 px-2 py-0.5 rounded-full"}>This Week</span>
</div>

<div className={"flex flex-col gap-space-xs"}>

<div className={"flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high/90 hover:bg-surface-variant transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-label-numeric-md text-label-numeric-md shadow-md"}>1</div>
<div className={"w-9 h-9 rounded-lg overflow-hidden shrink-0"}>
<img className={"w-full h-full object-cover"} data-alt={"Avatar portrait of high stakes cyber poker champion gold rim glass mask violet theme"} src={"/stitch-assets/lobby-checkin-avatar-en.png"} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-action text-label-action text-on-surface truncate w-24"}>DragonAce</span>
<span className={"font-label-micro text-label-micro text-tertiary"}>Poker God</span>
</div>
</div>
<div className={"text-right"}>
<div className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>+142.5M</div>
<div className={"font-label-micro text-label-micro text-on-surface-variant"}>Win 74%</div>
</div>
</div>

<div className={"flex items-center justify-between p-space-sm rounded-lg bg-surface-container/70 hover:bg-surface-variant transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-label-numeric-md text-label-numeric-md"}>2</div>
<div className={"w-9 h-9 rounded-lg overflow-hidden shrink-0"}>
<img className={"w-full h-full object-cover"} data-alt={"Avatar portrait of mysterious female poker master wearing purple fedora futuristic neon shadows"} src={"/stitch-assets/lobby-woman-avatar.jpg"} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-action text-label-action text-on-surface truncate w-24"}>VioletQueen</span>
<span className={"font-label-micro text-label-micro text-secondary"}>Grandmaster</span>
</div>
</div>
<div className={"text-right"}>
<div className={"font-label-numeric-md text-label-numeric-md text-secondary"}>+98.2M</div>
<div className={"font-label-micro text-label-micro text-on-surface-variant"}>Win 71%</div>
</div>
</div>

<div className={"flex items-center justify-between p-space-sm rounded-lg bg-surface-container/70 hover:bg-surface-variant transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-7 h-7 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-label-numeric-md text-label-numeric-md"}>3</div>
<div className={"w-9 h-9 rounded-lg overflow-hidden shrink-0"}>
<img className={"w-full h-full object-cover"} data-alt={"Cyberpunk sleek poker strategist avatar violet sunglasses neon reflections digital render"} src={"/stitch-assets/lobby-cyber-avatar.jpg"} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-action text-label-action text-on-surface truncate w-24"}>BluffKing</span>
<span className={"font-label-micro text-label-micro text-primary"}>Master</span>
</div>
</div>
<div className={"text-right"}>
<div className={"font-label-numeric-md text-label-numeric-md text-primary"}>+64.8M</div>
<div className={"font-label-micro text-label-micro text-on-surface-variant"}>Win 65%</div>
</div>
</div>

<div className={"flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low/40 hover:bg-surface-variant transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-numeric-md text-label-numeric-md"}>4</div>
<div className={"w-9 h-9 rounded-lg overflow-hidden shrink-0"}>
<img className={"w-full h-full object-cover"} data-alt={"Avatar portrait of high tech poker player violet holographic HUD visor portrait"} src={"/stitch-assets/lobby-leaderboard-avatar.jpg"} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-action text-label-action text-on-surface truncate w-24"}>CyberFlush</span>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>Expert</span>
</div>
</div>
<div className={"text-right"}>
<div className={"font-label-numeric-md text-label-numeric-md text-on-surface"}>+41.2M</div>
<div className={"font-label-micro text-label-micro text-on-surface-variant"}>Win 62%</div>
</div>
</div>

<div className={"flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low/40 hover:bg-surface-variant transition-all"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-7 h-7 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-label-numeric-md text-label-numeric-md"}>5</div>
<div className={"w-9 h-9 rounded-lg overflow-hidden shrink-0"}>
<img className={"w-full h-full object-cover"} data-alt={"Portrait avatar of cool cyber gamer in dark purple lighting sleek stylish portrait"} src={"/stitch-assets/lobby-cyber-avatar.jpg"} />
</div>
<div className={"flex flex-col min-w-0"}>
<span className={"font-label-action text-label-action text-on-surface truncate w-24"}>RoyalShadow</span>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>Platinum</span>
</div>
</div>
<div className={"text-right"}>
<div className={"font-label-numeric-md text-label-numeric-md text-on-surface"}>+32.9M</div>
<div className={"font-label-micro text-label-micro text-on-surface-variant"}>Win 59%</div>
</div>
</div>
</div>

<div className={"mt-space-xs p-space-sm bg-primary-container/20 rounded-lg flex items-center justify-between"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-numeric-md text-label-numeric-md text-primary"}>Rank #128</span>
<span className={"text-body-sm font-body-sm text-on-surface-variant"}>(You)</span>
</div>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>+12,500,000</span>
</div>
</div>
</div>
</div>



<div className={"fixed inset-0 z-50 flex items-center justify-center p-space-md bg-surface-container-lowest/80 backdrop-blur-xl"} id={"dailyModal"}>

<div className={"relative w-full max-w-4xl bg-surface-container-low/95 rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"}>

<div className={"absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"}></div>
<div className={"absolute -bottom-32 right-1/4 w-80 h-80 bg-tertiary/15 rounded-full blur-3xl pointer-events-none"}></div>

<div className={"flex items-center justify-between relative z-10"}>
<div className={"flex items-center gap-space-sm"}>
<div className={"w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center shadow-lg"}>
<span className={"material-symbols-outlined text-tertiary text-2xl"} style={{"fontVariationSettings": "'FILL' 1"}}>stars</span>
</div>
<div>
<div className={"flex items-center gap-space-xs"}>
<h2 className={"font-headline-lg text-headline-lg text-primary tracking-wide"}>7-DAY CHECK-IN</h2>
<span className={"bg-tertiary text-on-tertiary text-label-micro font-label-micro px-2 py-0.5 rounded-full uppercase font-bold"}>MEGA REWARD</span>
</div>
<p className={"font-body-sm text-body-sm text-on-surface-variant"}>Check in daily to collect bonus chips</p>
</div>
</div>

<button aria-label={"Close"} className={"w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-variant text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"} id={"closeDailyBtn"}>
<span className={"material-symbols-outlined text-2xl"}>close</span>
</button>
</div>

<div className={"grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-space-sm relative z-10 pt-space-xs"}>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-surface-container/60 opacity-80"}>
<span className={"font-label-action text-label-action text-on-surface-variant"}>Day 1</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-4xl text-tertiary/70"} style={{"fontVariationSettings": "'FILL' 1"}}>toll</span>
<div className={"absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-xs rounded-full flex items-center justify-center"}>
<span className={"material-symbols-outlined text-2xl text-tertiary"} style={{"fontVariationSettings": "'FILL' 1"}}>check_circle</span>
</div>
</div>
<span className={"font-label-numeric-md text-label-numeric-md text-on-surface-variant"}>50K Chips</span>
<span className={"text-label-micro font-label-micro text-tertiary mt-1 font-semibold"}>Claimed</span>
</div>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-surface-container/60 opacity-80"}>
<span className={"font-label-action text-label-action text-on-surface-variant"}>Day 2</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-4xl text-tertiary/70"} style={{"fontVariationSettings": "'FILL' 1"}}>toll</span>
<div className={"absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-xs rounded-full flex items-center justify-center"}>
<span className={"material-symbols-outlined text-2xl text-tertiary"} style={{"fontVariationSettings": "'FILL' 1"}}>check_circle</span>
</div>
</div>
<span className={"font-label-numeric-md text-label-numeric-md text-on-surface-variant"}>100K Chips</span>
<span className={"text-label-micro font-label-micro text-tertiary mt-1 font-semibold"}>Claimed</span>
</div>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-surface-container/60 opacity-80"}>
<span className={"font-label-action text-label-action text-on-surface-variant"}>Day 3</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-4xl text-primary/70"} style={{"fontVariationSettings": "'FILL' 1"}}>toll</span>
<div className={"absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-xs rounded-full flex items-center justify-center"}>
<span className={"material-symbols-outlined text-2xl text-tertiary"} style={{"fontVariationSettings": "'FILL' 1"}}>check_circle</span>
</div>
</div>
<span className={"font-label-action text-label-action text-on-surface-variant text-center text-xs"}>150K Chips</span>
<span className={"text-label-micro font-label-micro text-tertiary mt-1 font-semibold"}>Claimed</span>
</div>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-gradient-to-b from-primary-container/80 to-surface-container-high shadow-xl shadow-primary-container/40 ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest scale-105 z-20"}>
<div className={"absolute -top-3 bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-sm"}>
            TODAY
          </div>
<span className={"font-label-action text-label-action text-on-primary-container pt-1"}>Day 4</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-5xl text-tertiary drop-shadow-md animate-pulse"} style={{"fontVariationSettings": "'FILL' 1"}}>monetization_on</span>
</div>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary font-bold"}>250K Chips</span>
<button className={"mt-2 w-full py-1 bg-gradient-to-r from-tertiary to-tertiary-container hover:brightness-110 text-on-tertiary font-label-action text-label-action rounded-md shadow-md active:scale-95 transition-all text-xs uppercase tracking-wide"} id={"claimDay4Btn"}>
            CLAIM NOW
          </button>
</div>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest/60 opacity-60"}>
<span className={"font-label-action text-label-action text-on-surface-variant"}>Day 5</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-4xl text-secondary"} style={{"fontVariationSettings": "'FILL' 1"}}>toll</span>
<div className={"absolute inset-0 flex items-center justify-center"}>
<span className={"material-symbols-outlined text-xl text-outline-variant"}>lock</span>
</div>
</div>
<span className={"font-label-action text-label-action text-on-surface-variant text-center text-[11px] leading-tight"}>350K Chips</span>
<span className={"text-label-micro font-label-micro text-outline mt-1"}>Locked</span>
</div>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-surface-container-lowest/60 opacity-60"}>
<span className={"font-label-action text-label-action text-on-surface-variant"}>Day 6</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-4xl text-tertiary"} style={{"fontVariationSettings": "'FILL' 1"}}>toll</span>
<div className={"absolute inset-0 flex items-center justify-center"}>
<span className={"material-symbols-outlined text-xl text-outline-variant"}>lock</span>
</div>
</div>
<span className={"font-label-numeric-md text-label-numeric-md text-on-surface-variant"}>500K Chips</span>
<span className={"text-label-micro font-label-micro text-outline mt-1"}>Locked</span>
</div>

<div className={"relative flex flex-col items-center justify-between p-space-sm rounded-xl bg-gradient-to-b from-surface-container to-surface-container-lowest opacity-85"}>
<div className={"absolute -top-2 bg-primary-container text-on-primary-container px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"}>
            ULTIMATE
          </div>
<span className={"font-label-action text-label-action text-tertiary pt-1"}>Day 7</span>
<div className={"w-14 h-14 my-space-xs flex items-center justify-center relative"}>
<span className={"material-symbols-outlined text-4xl text-tertiary animate-pulse"} style={{"fontVariationSettings": "'FILL' 1"}}>toll</span>
<div className={"absolute inset-0 flex items-center justify-center"}>
<span className={"material-symbols-outlined text-xl text-outline-variant"}>lock</span>
</div>
</div>
<div className={"flex flex-col items-center"}>
<span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>1M Chips</span>
<span className={"text-[10px] text-primary text-center leading-none mt-0.5 font-bold"}></span>
</div>
<span className={"text-label-micro font-label-micro text-outline mt-1"}>Locked</span>
</div>
</div>

<div className={"flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-xs relative z-10"}>
<div className={"flex items-center gap-space-xs text-body-sm font-body-sm text-on-surface-variant"}>
<span className={"material-symbols-outlined text-tertiary text-sm"}>info</span>
<span>Check-in streak resets if missed 1 day.</span>
</div>
<div className={"flex items-center gap-space-sm w-full sm:w-auto"}>
<button className={"w-1/2 sm:w-auto px-space-lg py-space-sm bg-surface-container-high hover:bg-surface-variant text-on-surface-variant rounded-lg font-label-action text-label-action transition-all"} id={"closeDailyBtnSec"}>
            Later
          </button>
<button className={"w-1/2 sm:w-auto px-space-xl py-space-sm bg-gradient-to-r from-primary-container via-primary to-secondary-container text-on-primary font-label-action text-label-action rounded-lg shadow-xl shadow-primary-container/40 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-space-xs"} id={"claimBigBtn"}>
<span className={"material-symbols-outlined text-tertiary"}>card_giftcard</span>
<span>CLAIM TODAY'S REWARD</span>
</button>
</div>
</div>
</div>
</div>
</div>
</main>
<footer className={"fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(22,6,40,0.7)]"}><div className={"h-10 w-full px-margin flex items-center justify-between text-label-micro font-label-micro"}><div className={"flex items-center gap-space-sm overflow-hidden text-ellipsis whitespace-nowrap"}><div className={"flex items-center gap-space-xs text-tertiary font-bold shrink-0"}><span className={"material-symbols-outlined text-sm"}>campaign</span><span>COSMIC JACKPOT:</span></div><span className={"text-tertiary font-label-numeric-md text-label-numeric-md font-bold shrink-0"}>848,290,000 CHIPS</span><span className={"text-outline shrink-0"}>•</span><div className={"flex items-center gap-space-xs text-on-surface-variant overflow-hidden text-ellipsis whitespace-nowrap"}><span>Congrats player</span><span className={"text-primary font-bold"}>ShadowAce</span><span>on winning</span><span className={"text-tertiary font-bold"}>+45,000,000 Chips</span><span>at High Roller table #07</span></div></div><div className={"hidden md:flex items-center gap-space-md text-on-surface-variant shrink-0"}><div className={"flex items-center gap-space-xs"}><span className={"w-2 h-2 rounded-full bg-tertiary animate-pulse"}></span><span>Online: 14,892</span></div><span>|</span><span>Ping: 18ms</span></div></div></footer></div>
}
