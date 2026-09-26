// Adapted from the Poker Rank Stitch design.
// UI copy and image assets are in English; edit this component for product work.
export default function ShopPage() {
  return <div className={"bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary"}><header className={"fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/85 backdrop-blur-2xl shadow-[0_4px_24px_rgba(22,6,40,0.85)]"}><div className={"h-20 w-full px-margin flex items-center justify-between gap-space-md"}><div className={"flex items-center gap-space-lg"}><div className={"flex items-center gap-space-sm"}><img alt={"Poker Rank Logo"} className={"h-10 w-10 object-contain rounded-lg shadow-sm"} src={"/stitch-assets/logo.svg"} /><span className={"font-headline-sm text-headline-sm uppercase tracking-wider text-primary"}>POKER RANK</span></div><nav className={"hidden lg:flex items-center gap-space-xs"} data-active-classes={"bg-primary-container text-on-primary-container rounded-lg"}><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"lobby"} href={"/lobby"}>Lobby</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"ranked"} href={"/ranked"}>Ranked</a><a aria-current={"page"} className={"px-space-md py-space-sm font-label-action transition-all bg-primary-container text-on-primary-container rounded-lg"} data-path={"shop"} href={"/shop"}>Shop</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"events"} href={"/events"}>Events</a><a className={"px-space-md py-space-sm font-label-action text-label-action text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"} data-path={"mailbox"} href={"/mailbox"}>Mailbox</a></nav></div><div className={"flex items-center gap-space-md"}><div className={"hidden sm:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner"}><span className={"material-symbols-outlined text-tertiary text-lg"}>toll</span><span className={"font-label-numeric-md text-label-numeric-md text-tertiary"}>1,250,000</span><button className={"flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container hover:bg-primary-container hover:text-on-primary-container transition-colors ml-space-xs"}><span className={"material-symbols-outlined text-xs"}>add</span></button></div><div className={"hidden md:flex items-center bg-surface-container-low px-space-md py-space-xs rounded-full gap-space-xs shadow-inner"}><span className={"material-symbols-outlined text-primary text-lg"}>diamond</span><span className={"font-label-numeric-md text-label-numeric-md text-primary"}>850</span><button className={"flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container hover:bg-primary-container hover:text-on-primary-container transition-colors ml-space-xs"}><span className={"material-symbols-outlined text-xs"}>add</span></button></div><div className={"flex items-center bg-tertiary-container/30 px-space-sm py-space-xs rounded-lg gap-space-xs"}><span className={"material-symbols-outlined text-tertiary text-sm"}>military_tech</span><span className={"font-label-action text-label-action text-tertiary"}>VIP 6</span></div><div className={"flex items-center gap-space-xs"}><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"}><span className={"material-symbols-outlined text-lg"}>volume_up</span></button><button className={"w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"}><span className={"material-symbols-outlined text-lg"}>settings</span></button></div><div className={"flex items-center gap-space-xs cursor-pointer"}><img alt={"Profile Avatar"} className={"w-9 h-9 rounded-full object-cover ring-2 ring-primary/40 shadow-sm"} src={"/stitch-assets/avatar.svg"} /></div></div></div></header>
<main className={"w-full pt-20 flex-1 bg-surface-container-lowest"}><div className={"flex flex-col w-full"}>

<div className={"relative w-full overflow-hidden pb-16"}>
<div className={"absolute -top-32 left-1/4 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none"}></div>
<div className={"absolute top-1/2 right-10 w-[500px] h-[500px] bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"}></div>
<div className={"w-full max-w-7xl mx-auto px-margin"}>

<section className={"w-full pt-space-lg pb-space-md"}>
<div className={"flex flex-col md:flex-row md:items-center justify-between gap-space-md"}>

<div className={"flex items-center gap-space-xs p-1.5 bg-surface-container-low rounded-xl backdrop-blur-xl overflow-x-auto shadow-inner"}>
<button className={"flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-primary-container text-on-primary-container shadow-md font-label-action text-label-action shrink-0 transition-transform active:scale-95"}>
<span className={"material-symbols-outlined text-lg"} style={{"fontVariationSettings": "'FILL' 1"}}>style</span>
<span>Card Skins</span>
</button>
<button className={"flex items-center gap-space-xs px-space-md py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-action text-label-action shrink-0 transition-all"}>
<span className={"material-symbols-outlined text-lg"}>casino</span>
<span>Table Felts</span>
</button>
<button className={"flex items-center gap-space-xs px-space-md py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-action text-label-action shrink-0 transition-all"}>
<span className={"material-symbols-outlined text-lg"}>mood</span>
<span>Animated Emojis &amp; Sounds</span>
</button>
<button className={"flex items-center gap-space-xs px-space-md py-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-label-action text-label-action shrink-0 transition-all"}>
<span className={"material-symbols-outlined text-lg"}>paid</span>
<span>Chip &amp; Ruby Bundles</span>
</button>
</div>

<div className={"flex items-center gap-space-md"}>
<span className={"text-on-surface-variant font-label-micro text-label-micro uppercase tracking-widest flex items-center gap-1"}>
<span className={"inline-block w-2 h-2 rounded-full bg-primary animate-pulse"}></span>
              CURRENT COLLECTION: <strong className={"text-primary font-bold"}>14/68</strong>
</span>
</div>
</div>
</section>

<section className={"w-full mt-space-sm mb-space-xl"}>
<div className={"relative rounded-2xl bg-gradient-to-r from-surface-container via-surface-container-low to-surface-container p-space-lg md:p-space-xl overflow-hidden shadow-2xl"}>
<div className={"absolute -right-16 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-2xl"}></div>
<div className={"absolute left-1/3 bottom-0 w-64 h-32 bg-tertiary/10 rounded-full blur-xl"}></div>
<div className={"relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center"}>
<div className={"lg:col-span-7 flex flex-col gap-space-sm"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"px-space-sm py-0.5 rounded-full bg-error-container text-error font-label-micro text-label-micro uppercase tracking-wider font-bold animate-pulse"}>
                  FLASH SALE • ENDS IN 04:32:18
                </span>
<span className={"px-space-sm py-0.5 rounded-full bg-tertiary-container/40 text-tertiary font-label-micro text-label-micro font-bold"}>
                  SAVE 40%
                </span>
</div>
<h2 className={"font-headline-lg text-headline-lg text-on-surface"}>
                Royal Amethyst Violet Bundle
              </h2>
<p className={"font-body-md text-body-md text-on-surface-variant max-w-xl"}>
                Elevate your VIP prestige with the ultra-rare reflective amethyst velvet felt combined with a 20-piece interactive Cyber-VIP Emoji pack with surround spatial audio.
              </p>
<div className={"flex flex-wrap items-center gap-space-md pt-space-xs"}>
<div className={"flex items-baseline gap-space-xs"}>
<span className={"font-label-numeric-lg text-label-numeric-lg text-tertiary flex items-center gap-1"}>
<span className={"material-symbols-outlined text-xl"}>diamond</span> 2,400
                  </span>
<span className={"line-through text-outline font-label-numeric-md text-label-numeric-md"}>4,000</span>
</div>
<button className={"px-space-lg py-space-sm rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-action text-label-action hover:brightness-110 shadow-[0_0_20px_rgba(176,18,155,0.45)] transition-all flex items-center gap-space-xs"}>
<span className={"material-symbols-outlined text-lg"}>bolt</span>
<span>Unlock Now</span>
</button>
</div>
</div>

<div className={"lg:col-span-5 flex items-center justify-center"}>
<div className={"relative w-full max-w-sm h-48 rounded-xl overflow-hidden shadow-lg bg-surface-container-lowest flex items-center justify-center p-space-sm"}>
<img className={"w-full h-full object-cover rounded-lg"} data-alt={"A luxurious royal purple velvet poker table felt with glowing amethyst geometric inlays, floating holographic playing cards, and sparkling gold VIP crests in cinematic esports lighting"} src={"/stitch-assets/shop-bundle-en.png"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent flex items-end p-space-md"}>
<div className={"flex items-center justify-between w-full"}>
<span className={"text-tertiary font-label-action text-label-action"}>Royal Table Felt + 20 Emojis</span>
<span className={"bg-primary/20 backdrop-blur-md px-2 py-0.5 rounded text-primary font-label-micro text-label-micro font-bold"}>MYTHIC BUNDLE</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className={"w-full"}>
<div className={"flex items-center justify-between mb-space-md"}>
<div className={"flex items-center gap-space-xs"}>
<span className={"w-1.5 h-6 rounded-full bg-primary-container"}></span>
<h3 className={"font-headline-md text-headline-md text-on-surface"}>Card Deck Skins</h3>
</div>
<div className={"flex items-center gap-space-xs"}>
<span className={"font-label-micro text-label-micro text-on-surface-variant"}>Filter:</span>
<button className={"px-space-sm py-1 rounded bg-surface-container text-on-surface text-label-micro font-label-micro hover:bg-surface-container-high transition-colors"}>All</button>
<button className={"px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface-variant text-label-micro font-label-micro hover:text-on-surface transition-colors"}>Mythic</button>
<button className={"px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface-variant text-label-micro font-label-micro hover:text-on-surface transition-colors"}>Legendary</button>
</div>
</div>
<div className={"grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start"}>

<div className={"xl:col-span-4 rounded-2xl bg-surface-container-low p-space-lg flex flex-col gap-space-md shadow-xl sticky top-24"}>
<div className={"flex items-center justify-between"}>
<span className={"text-on-surface-variant font-label-micro text-label-micro uppercase tracking-wider flex items-center gap-1"}>
<span className={"material-symbols-outlined text-sm text-primary"}>3d_rotation</span>
                3D INTERACTIVE PREVIEW
              </span>
<span className={"px-space-xs py-0.5 rounded bg-primary-container/40 text-primary font-label-micro text-label-micro font-bold"} id={"preview-rarity"}>
                MYTHIC
              </span>
</div>

<div className={"relative w-full h-80 rounded-xl bg-surface-container-lowest flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing shadow-inner group"} id={"stage-3d"}>

<div className={"absolute inset-0 bg-gradient-to-b from-primary-container/10 via-transparent to-secondary-container/15"}></div>
<div className={"absolute w-48 h-48 rounded-full bg-primary/20 blur-2xl group-hover:scale-125 transition-transform duration-700"}></div>

<div className={"relative w-44 h-64 rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.7)] transition-transform duration-200 ease-out preserve-3d"} id={"interactive-card"} style={{"transformStyle": "preserve-3d", "transform": "rotateY(-12deg) rotateX(10deg)"}}>

<div className={"absolute -inset-0.5 bg-gradient-to-tr from-primary to-tertiary rounded-xl opacity-80 blur-[2px]"}></div>

<div className={"relative w-full h-full rounded-xl bg-surface-container p-2 flex flex-col justify-between overflow-hidden shadow-2xl"}>
<img className={"w-full h-full object-cover rounded-lg"} data-alt={"Exquisite Royal Cyber poker card deck with luminous magenta edge trim, detailed cyberpunk filigree patterns on obsidian purple back, premium metallic foil highlights"} id={"preview-image"} src={"/stitch-assets/shop-cyber-box-en.png"} />
<div className={"absolute top-3 left-3 flex flex-col items-center"}>
<span className={"font-headline-sm text-headline-sm text-tertiary font-bold leading-none"} id={"preview-corner-val"}>A</span>
<span className={"material-symbols-outlined text-sm text-tertiary"}>diamond</span>
</div>
<div className={"absolute bottom-3 right-3 flex flex-col items-center rotate-180"}>
<span className={"font-headline-sm text-headline-sm text-tertiary font-bold leading-none"}>A</span>
<span className={"material-symbols-outlined text-sm text-tertiary"}>diamond</span>
</div>
</div>
</div>
<div className={"absolute bottom-3 text-center w-full pointer-events-none"}>
<span className={"text-outline font-label-micro text-label-micro bg-surface-container-lowest/80 px-2.5 py-1 rounded-full backdrop-blur-md"}>
                  Hover to rotate 360° view
                </span>
</div>
</div>

<div className={"flex flex-col gap-space-xs pt-space-xs"}>
<div className={"flex items-center justify-between"}>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"} id={"preview-title"}>Royal Cyber Deck</h4>
<span className={"text-tertiary font-label-action text-label-action flex items-center gap-1"}>
<span className={"material-symbols-outlined text-sm"} style={{"fontVariationSettings": "'FILL' 1"}}>stars</span> 5.0
                </span>
</div>
<p className={"text-body-sm font-body-sm text-on-surface-variant"} id={"preview-desc"}>
                Exclusive futuristic styling with neon reactive edges synced to turn timing. Grants a 10% Jackpot win visual flair.
              </p>
</div>

<div className={"grid grid-cols-2 gap-space-xs pt-1"}>
<div className={"bg-surface-container p-2.5 rounded-lg flex flex-col"}>
<span className={"text-outline font-label-micro text-label-micro uppercase"}>Flip Effect</span>
<span className={"text-on-surface font-label-action text-label-action text-sm"}>Hologram Sparkle</span>
</div>
<div className={"bg-surface-container p-2.5 rounded-lg flex flex-col"}>
<span className={"text-outline font-label-micro text-label-micro uppercase"}>Deal Sound</span>
<span className={"text-on-surface font-label-action text-label-action text-sm"}>Neon Shimmer SFX</span>
</div>
</div>
</div>

<div className={"xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-space-md"}>

<div className={"deck-card group relative rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer ring-2 ring-primary"} data-desc={"Exclusive futuristic styling with neon reactive edges synced to turn timing. Grants a 10% Jackpot win visual flair."} data-rarity={"MYTHIC"} data-title={"Royal Cyber Deck"} data-val={"A"}>

<div className={"flex items-center justify-between mb-space-sm"}>
<span className={"px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-micro text-label-micro font-bold tracking-wider"}>
                  MYTHIC
                </span>
<span className={"flex items-center gap-1 text-primary font-label-action text-label-action"}>
<span className={"material-symbols-outlined text-base"}>check_circle</span> Equipped
                </span>
</div>

<div className={"relative w-full h-52 rounded-xl bg-surface-container-lowest overflow-hidden mb-space-sm shadow-md"}>
<img className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Royal Cyber Deck poker cards displayed in fan shape, glowing violet neon edges, high-tech obsidian texture, esports style luxury"} src={"/stitch-assets/shop-cyber-deck-en.png"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent flex items-end p-space-sm"}>
<span className={"text-outline font-label-micro text-label-micro"}>Season VIP S1 Edition</span>
</div>
</div>
<div className={"flex flex-col gap-1 mb-space-md"}>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"}>Royal Cyber Deck</h4>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2"}>Luminous metallic violet edge trims with dynamic breathing pulse when action is on you.</p>
</div>

<div className={"flex items-center justify-between pt-space-xs"}>
<span className={"text-primary font-label-action text-label-action"}>Owned</span>
<button className={"px-space-md py-2 rounded-xl bg-surface-container text-on-surface-variant font-label-action text-label-action cursor-default opacity-80 flex items-center gap-1"}>
<span className={"material-symbols-outlined text-base"}>verified</span>
<span>Equipped</span>
</button>
</div>
</div>

<div className={"deck-card group relative rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"} data-desc={"Imperial handcrafted gold foil with blazing dragon aura, emitting golden rays on All-In bets."} data-rarity={"LEGENDARY"} data-title={"Golden Dragon Dynasty"} data-val={"K"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<span className={"px-space-sm py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-micro text-label-micro font-bold tracking-wider"}>
                  LEGENDARY
                </span>
<span className={"flex items-center gap-1 text-tertiary font-label-numeric-md text-label-numeric-md"}>
<span className={"material-symbols-outlined text-base"}>diamond</span> 1,200
                </span>
</div>
<div className={"relative w-full h-52 rounded-xl bg-surface-container-lowest overflow-hidden mb-space-sm shadow-md"}>
<img className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Golden Dragon Dynasty poker playing card back featuring an intricately sculpted imperial gold dragon, rich purple imperial silk fabric background, metallic gold reflections"} src={"/stitch-assets/shop-golden-dragon-en.png"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent flex items-end p-space-sm"}>
<span className={"text-outline font-label-micro text-label-micro"}>Royal Handcrafted Finish</span>
</div>
</div>
<div className={"flex flex-col gap-1 mb-space-md"}>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"}>Golden Dragon Dynasty</h4>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2"}>Imperial handcrafted gold foil with blazing dragon aura.</p>
</div>

<div className={"flex items-center justify-between pt-space-xs"}>
<div className={"flex flex-col"}>
<span className={"text-outline font-label-micro text-label-micro"}>Price</span>
<span className={"text-tertiary font-label-numeric-md text-label-numeric-md font-bold"}>1,200 Ruby</span>
</div>
<button className={"px-space-md py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-action text-label-action hover:brightness-110 shadow-md transition-transform active:scale-95 flex items-center gap-1"}>
<span className={"material-symbols-outlined text-base"}>shopping_cart</span>
<span>Buy Now</span>
</button>
</div>
</div>

<div className={"deck-card group relative rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"} data-desc={"Deep cosmic fractal violet cards with vortex shading, echoing into the deep silent casino realm."} data-rarity={"MYTHIC"} data-title={"Dark Void Obsidian"} data-val={"Q"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<span className={"px-space-sm py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-micro text-label-micro font-bold tracking-wider"}>
                  MYTHIC
                </span>
<span className={"flex items-center gap-1 text-primary font-label-numeric-md text-label-numeric-md"}>
<span className={"material-symbols-outlined text-base"}>diamond</span> 850
                </span>
</div>
<div className={"relative w-full h-52 rounded-xl bg-surface-container-lowest overflow-hidden mb-space-sm shadow-md"}>
<img className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Dark Void Obsidian poker playing card deck with black crystal mirror surface, glowing ultra-violet fractal lines, futuristic dark cosmic style"} src={"/stitch-assets/shop-dark-void-en.png"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent flex items-end p-space-sm"}>
<span className={"text-outline font-label-micro text-label-micro"}>Ancient Void Cosmic Relic</span>
</div>
</div>
<div className={"flex flex-col gap-1 mb-space-md"}>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"}>Dark Void Obsidian</h4>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2"}>Deep cosmic fractal violet cards with vortex shading.</p>
</div>

<div className={"flex items-center justify-between pt-space-xs"}>
<div className={"flex flex-col"}>
<span className={"text-outline font-label-micro text-label-micro"}>Price</span>
<span className={"text-primary font-label-numeric-md text-label-numeric-md font-bold"}>850 Ruby</span>
</div>
<button className={"px-space-md py-2 rounded-xl bg-primary-container text-on-primary font-label-action text-label-action hover:brightness-110 shadow-md transition-transform active:scale-95 flex items-center gap-1"}>
<span className={"material-symbols-outlined text-base"}>shopping_cart</span>
<span>Buy Now</span>
</button>
</div>
</div>

<div className={"deck-card group relative rounded-2xl bg-surface-container-low p-space-md flex flex-col justify-between shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"} data-desc={"Holographic cards shifting hues with pot action intensity and futuristic cyber-lounge vibes."} data-rarity={"LEGENDARY"} data-title={"Neon Las Vegas 2077"} data-val={"J"}>
<div className={"flex items-center justify-between mb-space-sm"}>
<span className={"px-space-sm py-0.5 rounded-full bg-tertiary-container/30 text-tertiary font-label-micro text-label-micro font-bold tracking-wider"}>
                  LEGENDARY
                </span>
<span className={"flex items-center gap-1 text-tertiary font-label-numeric-md text-label-numeric-md"}>
<span className={"material-symbols-outlined text-base"}>diamond</span> 1,500
                </span>
</div>
<div className={"relative w-full h-52 rounded-xl bg-surface-container-lowest overflow-hidden mb-space-sm shadow-md"}>
<img className={"w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"} data-alt={"Neon Las Vegas 2077 cyberpunk poker deck with holographic iridescent foil, glowing neon magenta and cyan signage accents, vibrant casino aesthetic"} src={"/stitch-assets/shop-neon-vegas-en.png"} />
<div className={"absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent flex items-end p-space-sm"}>
<span className={"text-outline font-label-micro text-label-micro"}>2077 Hologram Technology</span>
</div>
</div>
<div className={"flex flex-col gap-1 mb-space-md"}>
<h4 className={"font-headline-sm text-headline-sm text-on-surface"}>Neon Las Vegas 2077</h4>
<p className={"font-body-sm text-body-sm text-on-surface-variant line-clamp-2"}>Holographic cards shifting hues with pot action intensity.</p>
</div>

<div className={"flex items-center justify-between pt-space-xs"}>
<div className={"flex flex-col"}>
<span className={"text-outline font-label-micro text-label-micro"}>Price</span>
<span className={"text-tertiary font-label-numeric-md text-label-numeric-md font-bold"}>1,500 Ruby</span>
</div>
<button className={"px-space-md py-2 rounded-xl bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-label-action text-label-action hover:brightness-110 shadow-md transition-transform active:scale-95 flex items-center gap-1"}>
<span className={"material-symbols-outlined text-base"}>shopping_cart</span>
<span>Buy Now</span>
</button>
</div>
</div>
</div>
</div>
</section>

<section className={"w-full mt-space-xl"}>
<div className={"rounded-xl bg-surface-container p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md shadow-lg"}>
<div className={"flex items-center gap-space-md"}>
<div className={"w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary"}>
<span className={"material-symbols-outlined text-2xl"}>workspace_premium</span>
</div>
<div>
<h5 className={"font-headline-sm text-headline-sm text-on-surface"}>VIP Member Exclusive Privilege</h5>
<p className={"font-body-sm text-body-sm text-on-surface-variant"}>Enjoy an extra 15% discount on all decks upon reaching VIP 7 this month.</p>
</div>
</div>
<button className={"px-space-md py-2 rounded-lg bg-surface-container-high text-tertiary font-label-action text-label-action hover:bg-surface-bright transition-colors whitespace-nowrap"}>
            Explore VIP Tiers
          </button>
</div>
</section>
</div>
</div>
</div>

</main>
<footer className={"fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(22,6,40,0.7)]"}><div className={"h-10 w-full px-margin flex items-center justify-between text-label-micro font-label-micro"}><div className={"flex items-center gap-space-sm overflow-hidden text-ellipsis whitespace-nowrap"}><div className={"flex items-center gap-space-xs text-tertiary font-bold shrink-0"}><span className={"material-symbols-outlined text-sm"}>campaign</span><span>COSMIC JACKPOT:</span></div><span className={"text-tertiary font-label-numeric-md text-label-numeric-md font-bold shrink-0"}>848,290,000 CHIPS</span><span className={"text-outline shrink-0"}>•</span><div className={"flex items-center gap-space-xs text-on-surface-variant overflow-hidden text-ellipsis whitespace-nowrap"}><span>Congratulations to</span><span className={"text-primary font-bold"}>ShadowVIP</span><span>for winning</span><span className={"text-tertiary font-bold"}>+45,000,000 Chips</span><span>at High Roller Table #07</span></div></div><div className={"hidden md:flex items-center gap-space-md text-on-surface-variant shrink-0"}><div className={"flex items-center gap-space-xs"}><span className={"w-2 h-2 rounded-full bg-tertiary animate-pulse"}></span><span>Online: 14,892</span></div><span>|</span><span>Ping: 18ms</span></div></div></footer></div>
}
