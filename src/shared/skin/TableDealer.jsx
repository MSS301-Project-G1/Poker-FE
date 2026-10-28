import { useSkin } from './SkinContext'
import styles from './skin.module.css'

const tablePoses = ['idle', 'deal', 'flip', 'win']
// In px: below the smallest height a dealer is not worth drawing; above the largest it stops growing.
const smallestHeight = 56
const largestHeight = 140

/**
 * The equipped dealer, standing behind the board. pose is idle, deal, flip or win; a pose without an image shows idle.
 * room is the free height above the board: the dealer fills it up to its full size and stays hidden when it is too small.
 * Every pose stays mounted, so switching never waits for an image to load.
 */
export default function TableDealer({ pose = 'idle', room }) {
  const { dealer } = useSkin()
  if (!dealer?.idle || room < smallestHeight) return null
  const shown = dealer[pose] ? pose : 'idle'
  return <div className={styles.tableDealer} style={{ height: Math.min(room, largestHeight) }} aria-hidden="true">
    {tablePoses.filter(name => dealer[name]).map(name =>
      <img key={name} src={dealer[name]} alt="" draggable={false} className={name === shown ? styles.dealerShown : undefined} />)}
  </div>
}
