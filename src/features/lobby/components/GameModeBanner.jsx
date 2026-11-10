// Full-width game mode card: background artwork, gradient veil and content on top.
export default function GameModeBanner({ image, veil, children }) {
  return <div className="group relative rounded-2xl overflow-hidden bg-surface-container-lowest/40 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl">
    <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url('${image}')` }}></div>
    <div className={`absolute inset-0 bg-gradient-to-r from-surface-container-lowest/70 ${veil}`}></div>
    {children}
  </div>
}
