import "./globals.css";

export const metadata = {
  title: "DOT 마켓",
  description: "3/31(화) 10AM~4PM | 일일 돗자리마켓",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
