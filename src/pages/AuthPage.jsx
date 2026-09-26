// Adapted from the Poker Rank Stitch design.
// UI copy and image assets are in English; edit this component for product work.
export default function AuthPage({ mode = 'sign-in' }) {
  return <div className={"bg-background text-on-surface min-h-screen relative overflow-x-hidden font-body-md selection:bg-primary-container selection:text-white"}>




<div className={"pointer-events-none fixed inset-0 overflow-hidden -z-10"}>
<div className={"absolute -top-32 left-1/2 -translate-x-1/2 w-[48rem] h-[28rem] bg-primary-container/20 rounded-full blur-[130px]"}></div>
<div className={"absolute top-1/3 -left-32 w-96 h-96 bg-secondary-container/25 rounded-full blur-[110px]"}></div>
<div className={"absolute -bottom-20 -right-20 w-[32rem] h-[32rem] bg-tertiary-container/15 rounded-full blur-[120px]"}></div>
<div className={"absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/10 via-background to-surface-container-lowest"}></div>
</div>


<div className={"min-h-screen flex flex-col justify-between items-center px-4 py-8 md:py-12 relative z-10 max-w-7xl mx-auto"}>

<header className={"w-full flex flex-col items-center text-center mb-8"}>
<div className={"inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-surface-container-high/70 border border-outline-variant/40 shadow-lg backdrop-blur-md mb-3"}>
<span className={"material-symbols-outlined text-primary text-xl"}>style</span>
<span className={"text-xs font-label-action uppercase tracking-widest text-primary-fixed"}>Official High Roller Gateway</span>
</div>
<div className={"flex items-center justify-center gap-3"}>
<span className={"material-symbols-outlined text-tertiary-fixed text-4xl md:text-5xl filter drop-shadow-[0_0_12px_rgba(229,196,87,0.5)]"}>playing_cards</span>
<h1 className={"font-display-hero text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary-fixed via-primary to-secondary-fixed bg-clip-text text-transparent"}>POKER RANK</h1>
</div>
<p className={"mt-2 text-xs md:text-sm font-label-action tracking-widest text-on-surface-variant/90 uppercase"}>VIP HIGH ROLLER ARENA • CYBER POKER LOUNGE</p>
</header>

<main className={"w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch my-auto"}>

<section className={"lg:col-span-6 relative rounded-2xl bg-gradient-to-b from-surface-container-high/80 via-surface-container/70 to-surface-container-low/90 border border-outline-variant/40 p-6 md:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl overflow-hidden"}>

<div className={"absolute -top-16 -left-16 w-44 h-44 bg-primary/20 rounded-full blur-3xl pointer-events-none"}></div>
<div>

<div className={"inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/15 border border-tertiary/30 text-tertiary-fixed text-xs font-label-action tracking-wider uppercase mb-5"}>
<span className={"material-symbols-outlined text-sm"}>stars</span>
            EXCLUSIVE ROOKIE REWARD 2025
          </div>
<h2 className={"font-headline-xl text-3xl md:text-4xl font-bold tracking-tight text-white mb-3"}>Poker Reborn</h2>
<p className={"text-body-md text-on-surface-variant leading-relaxed mb-6"}>Step into the premier cyber arena. Compete in high-stakes No-Limit Hold'em &amp; Omaha alongside top global players.</p>

<div className={"relative rounded-xl bg-surface-container-lowest/85 border border-primary/25 p-5 shadow-inner mb-6 overflow-hidden"}>
<div className={"absolute top-0 right-0 transform translate-x-3 -translate-y-3 opacity-10 pointer-events-none"}>
<span className={"material-symbols-outlined text-8xl text-primary"}>casino</span>
</div>
<div className={"flex items-center justify-between mb-1.5"}>
<span className={"text-xs font-label-action uppercase tracking-wider text-primary font-bold"}>Welcome Bonus</span>
<span className={"px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded bg-primary-container/40 text-primary-fixed border border-primary/30"}>Instant Unlock</span>
</div>
<div className={"font-headline-lg text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-tertiary-fixed via-tertiary to-amber-200 tracking-tight mb-2"}>
              +1,000,000 CHIPS
            </div>
<p className={"text-xs text-on-surface-variant flex items-center gap-1.5"}>
<span className={"material-symbols-outlined text-secondary text-sm"}>verified</span>
              Receive Silver VIP Pass &amp; 10 Lucky Wheel Spins upon phone verification.
            </p>
</div>

<div className={"flex items-center justify-center gap-2 py-2 mb-4"}>

<div className={"w-14 h-20 rounded-lg bg-surface-container-lowest border border-outline-variant/60 shadow-md flex flex-col justify-between p-1.5 transform -rotate-6 hover:-translate-y-1 transition-all"}>
<span className={"text-xs font-bold text-white leading-none"}>A♠</span>
<span className={"material-symbols-outlined text-lg text-white mx-auto"}>keyboard_arrow_up</span>
<span className={"text-xs font-bold text-white text-right leading-none"}>A</span>
</div>

<div className={"w-14 h-20 rounded-lg bg-surface-container-lowest border border-primary/40 shadow-md flex flex-col justify-between p-1.5 transform -rotate-2 hover:-translate-y-1 transition-all"}>
<span className={"text-xs font-bold text-error leading-none"}>K♥</span>
<span className={"material-symbols-outlined text-lg text-error mx-auto"}>favorite</span>
<span className={"text-xs font-bold text-error text-right leading-none"}>K</span>
</div>

<div className={"w-14 h-20 rounded-lg bg-surface-container-lowest border border-primary/40 shadow-md flex flex-col justify-between p-1.5 transform rotate-2 hover:-translate-y-1 transition-all"}>
<span className={"text-xs font-bold text-error leading-none"}>Q♦</span>
<span className={"material-symbols-outlined text-lg text-error mx-auto"}>diamond</span>
<span className={"text-xs font-bold text-error text-right leading-none"}>Q</span>
</div>

<div className={"w-14 h-20 rounded-lg bg-surface-container-lowest border border-outline-variant/60 shadow-md flex flex-col justify-between p-1.5 transform rotate-6 hover:-translate-y-1 transition-all"}>
<span className={"text-xs font-bold text-white leading-none"}>J♣</span>
<span className={"material-symbols-outlined text-lg text-white mx-auto"}>spa</span>
<span className={"text-xs font-bold text-white text-right leading-none"}>J</span>
</div>
</div>
</div>

<div className={"pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant"}>
<div className={"flex items-center gap-2"}>
<span className={"relative flex h-2.5 w-2.5"}>
<span className={"animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"}></span>
<span className={"relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"}></span>
</span>
<span className={"font-medium text-on-surface"}>18,429+ Players Online</span>
</div>
<span className={"text-tertiary font-semibold flex items-center gap-1"}>
<span className={"material-symbols-outlined text-xs"}>local_fire_department</span> Hot Tables
          </span>
</div>
</section>

<section className={"lg:col-span-6 rounded-2xl bg-surface-container-low/95 border border-outline-variant/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between"}>
<div>

<div className={"flex items-center rounded-xl bg-surface-container-lowest p-1 mb-6 border border-outline-variant/30 auth-tabs"}>
<button className={"flex-1 py-2.5 rounded-lg text-xs md:text-sm font-label-action text-white bg-primary-container shadow-md transition-all flex items-center justify-center gap-1.5"}>
<span className={"material-symbols-outlined text-sm"}>login</span>
              Sign In
            </button>
<button className={"flex-1 py-2.5 rounded-lg text-xs md:text-sm font-label-action text-on-surface-variant hover:text-white transition-all flex items-center justify-center gap-1.5"}>
<span className={"material-symbols-outlined text-sm"}>person_add</span>
              Create Account
            </button>
</div>
<form action={"#"} className={"space-y-4"}>

<div>
<label className={"block text-xs font-label-action text-on-surface mb-1.5 tracking-wider uppercase"}>
                USERNAME / EMAIL <span className={"text-primary"}>*</span>
</label>
<div className={"relative"}>
<span className={"material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none"}>account_circle</span>
<input className={"w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"} placeholder={"player_poker_vip"} type={"text"} />
</div>
</div>

<div>
<div className={"flex items-center justify-between mb-1.5"}>
<label className={"text-xs font-label-action text-on-surface tracking-wider uppercase"}>
                  PASSWORD <span className={"text-primary"}>*</span>
</label>
<a className={"text-xs font-label-action text-primary hover:text-primary-fixed underline transition-colors"} href={"#"}>Forgot password?</a>
</div>
<div className={"relative"}>
<span className={"material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none"}>lock</span>
<input className={"w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md"} placeholder={"••••••••"} type={"password"} />
<button className={"material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-lg focus:outline-none"} type={"button"}>visibility</button>
</div>
</div>

<div className={"flex items-center justify-between pt-1"}>
<label className={"inline-flex items-center gap-2 cursor-pointer select-none"}>
<input className={"w-4 h-4 rounded bg-surface-container-lowest border-outline-variant text-primary-container focus:ring-0 focus:ring-offset-0 cursor-pointer"} type={"checkbox"} />
<span className={"text-xs text-on-surface-variant font-medium"}>Remember me</span>
</label>
<div className={"inline-flex items-center gap-1 text-[11px] text-outline"}>
<span className={"material-symbols-outlined text-xs text-emerald-400"}>lock</span>
                256-bit SSL Protected
              </div>
</div>

{mode === 'register' && <>
<div><label className="block text-xs font-label-action text-on-surface mb-1.5 tracking-wider uppercase">EMAIL ADDRESS *</label><input className="w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary" type="email" placeholder="you@example.com" required /></div>
<div><label className="block text-xs font-label-action text-on-surface mb-1.5 tracking-wider uppercase">CONFIRM PASSWORD *</label><input className="w-full bg-surface-container-lowest/90 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary" type="password" placeholder="••••••••" required /></div>
</>}<div className={"pt-2"}>
<button className={"w-full py-3.5 px-4 rounded-xl font-label-action text-sm tracking-wider uppercase font-bold text-on-primary bg-gradient-to-r from-primary via-primary-fixed to-secondary shadow-[0_0_22px_rgba(255,172,231,0.35)] hover:shadow-[0_0_28px_rgba(255,172,231,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"} type={"submit"}>
<span>{mode === 'register' ? 'CREATE ACCOUNT' : 'ENTER ARENA NOW'}</span>
<span className={"text-base font-bold"}>→</span>
</button>
</div>
</form>

<div className={"relative my-5 text-center"}>
<div className={"absolute inset-0 flex items-center"}>
<div className={"w-full border-t border-outline-variant/40"}></div>
</div>
<span className={"relative px-3 bg-surface-container-low text-[11px] font-label-action uppercase tracking-widest text-outline"}>OR CONTINUE WITH</span>
</div>

<div className={"grid grid-cols-4 gap-2.5 mb-4"}>

<button className={"py-2.5 px-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-high transition-all flex items-center justify-center gap-1 text-xs font-semibold text-white"} title={"Sign in with Google"}>
<span className={"font-bold text-sm"}>G</span>
</button>

<button className={"py-2.5 px-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-high transition-all flex items-center justify-center gap-1 text-xs font-semibold text-white"} title={"Sign in with Facebook"}>
<span className={"font-bold text-sm"}>f</span>
</button>

<button className={"py-2.5 px-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-primary/40 hover:bg-surface-container-high transition-all flex items-center justify-center gap-1 text-xs font-semibold text-white"} title={"Sign in with Apple"}>
<span className={"material-symbols-outlined text-sm"}>terminal</span>
</button>

<button className={"py-2.5 px-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:border-tertiary/40 hover:bg-surface-container-high transition-all flex items-center justify-center gap-1 text-xs font-semibold text-tertiary"} title={"Play as Guest"}>
<span className={"material-symbols-outlined text-sm"}>person</span>
</button>
</div>

<div className={"p-2.5 rounded-lg bg-tertiary-container/15 border border-tertiary/25 text-center"}>
<span className={"text-xs font-medium text-tertiary-fixed"}>
              Instant Guest Play: <strong className={"text-white"}>+50,000 Free Chips</strong>
</span>
</div>
</div>
</section>
</main>

<footer className={"w-full max-w-4xl mt-8 pt-4 border-t border-outline-variant/20 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-xs text-on-surface-variant"}>
<div className={"inline-flex items-center gap-1.5"}>
<span className={"material-symbols-outlined text-emerald-400 text-sm"}>shield</span>
<span>Bank-Grade Encryption</span>
</div>
<div className={"inline-flex items-center gap-1.5"}>
<span className={"material-symbols-outlined text-tertiary text-sm"}>verified_user</span>
<span>Fair Play RNG Certified</span>
</div>
<div className={"inline-flex items-center gap-1.5"}>
<span className={"material-symbols-outlined text-primary text-sm"}>support_agent</span>
<span>24/7 VIP Concierge</span>
</div>
</footer>
</div>

</div>
}
