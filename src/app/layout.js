import './globals.css'

export const metadata = {
  title: 'DOT 마켓 🌸',
  description: '일일 벼룩시장 · 돗자리마켓',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
