import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export default function PaymentQr({ order }) {
  const payload = order?.qrCode
  const [image, setImage] = useState(null)

  useEffect(() => {
    let disposed = false
    // Manual-bank orders contain an image URL. PayOS returns an EMV payload.
    if (payload && !/^https?:\/\//i.test(payload)) {
      QRCode.toDataURL(payload, { width: 300, margin: 4 }).then(url => {
        if (!disposed) setImage({ payload, url })
      }).catch(() => { if (!disposed) setImage(null) })
    }
    return () => { disposed = true }
  }, [payload])

  const source = image?.payload === payload ? image.url
    : /^https?:\/\//i.test(payload || '') && payload === order?.checkoutUrl ? payload : null
  if (!source) return <p className="text-xs text-on-surface/60">Use the checkout link to view this order’s QR code.</p>
  return <img src={source} alt="Payment QR for this order" className="w-full h-auto aspect-square object-contain" />
}
