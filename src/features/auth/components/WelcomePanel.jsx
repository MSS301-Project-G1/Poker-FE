import { PlayingCard } from '@/shared/skin'
import styles from './WelcomePanel.module.css'

// A royal flush in hearts, dealt into a fan once when the page opens.
const hand = ['ACE', 'KING', 'QUEEN', 'JACK', 'TEN'].map(rank => ({ rank, suit: 'HEARTS' }))

const modes = [
  { term: 'Ranked', text: 'Six-handed tables matched by Elo. Finish in the top half to climb.' },
  { term: 'Tournaments', text: 'Open entry and invitation-only events with prize pools.' },
  { term: 'Private rooms', text: 'Share a code with friends. No Elo at stake.' },
]

export default function WelcomePanel() {
  return <section className={styles.panel} aria-labelledby="welcome-title">
    <div className={styles.brand}>
      <img src="/stitch-assets/logo.svg" alt="" className={styles.logo} />
      <span>Poker Rank</span>
    </div>
    <div className={styles.fan} aria-hidden="true">
      {hand.map((card, index) => <div key={card.rank} className={styles.slot} style={{ '--i': index - 2 }}>
        <PlayingCard card={card} size="xl" />
      </div>)}
    </div>
    <h1 id="welcome-title" className={styles.title}>No-Limit Hold&apos;em,<br />played for rank.</h1>
    <p className={styles.lead}>Every ranked hand moves your Elo. Climb the season leaderboard, enter tournaments, or open a private table with friends.</p>
    <dl className={styles.modes}>
      {modes.map(mode => <div key={mode.term}><dt>{mode.term}</dt><dd>{mode.text}</dd></div>)}
    </dl>
  </section>
}
