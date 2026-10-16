// Full-width game mode card: background artwork, gradient veil and content on top.
export default function GameModeBanner({ image, veil, children }) {
  return <div className="group relative rounded-xl overflow-hidden bg-surface-container shadow-xl transition-all duration-300 hover:shadow-2xl">
    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${image}')` }}></div>
    <div className={`absolute inset-0 bg-gradient-to-r from-surface-container-lowest ${veil}`}></div>
    {children}
  </div>
}
