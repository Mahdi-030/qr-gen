export interface FaqItem {
  q: string
  a: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Is the QR code generator really free?',
    a: 'Yes. You can create and download as many QR codes as you like in PNG, SVG, JPEG and PDF without an account. The site is supported by advertising.',
  },
  {
    q: 'Do you store the content of my QR codes?',
    a: 'No. QR codes are generated entirely in your browser. The text, links, contact details, Wi-Fi passwords and logos you enter are never sent to our servers. A short history of recent codes can be kept in your own browser storage, and you can clear it at any time.',
  },
  {
    q: 'Are my QR codes encrypted?',
    a: 'No. A QR code is only a way of writing data as a picture. Anyone who scans it can read what it contains, including a Wi-Fi password. Only encode information you are comfortable sharing with whoever can see the code.',
  },
  {
    q: 'Which file format should I download?',
    a: 'Use PNG for websites, documents and social media. Use SVG when you need a vector that stays sharp at any size, such as for signage or professional printing. JPEG gives a small file with a solid background. PDF is convenient for printing at a known physical size.',
  },
  {
    q: 'Will my QR code expire?',
    a: 'No. These are static QR codes: the data is written directly into the pattern, so they work forever and need no subscription. The trade-off is that you cannot change the destination later. If you need to update the destination, point the code at a link you control.',
  },
  {
    q: 'How do I make sure my styled QR code scans?',
    a: 'Keep strong contrast between the code and its background, with the darker colour on the code. Avoid very large logos, leave the blank border around the code intact, and print it at least 2 cm (0.8 in) wide. The preview runs an automatic read-back test, but always test the final code with your own phone before printing in bulk.',
  },
  {
    q: 'Can I add my logo to the centre?',
    a: 'Yes. Upload a PNG, JPG or SVG. The generator automatically switches to the highest error-correction level so the code can still be read with part of it covered. Keep the logo below about 30% of the code size.',
  },
  {
    q: 'What can a QR code contain?',
    a: 'Websites, plain text, email, phone numbers, SMS messages, Wi-Fi network credentials, contact cards (vCard), WhatsApp chats, map locations and calendar events. Each type uses the standard format that phone cameras understand.',
  },
  {
    q: 'Why does my light-on-dark QR code not scan on some phones?',
    a: 'Inverted codes (light pattern on a dark background) are supported by modern phone cameras but not by every older scanner app. For maximum compatibility use a dark pattern on a light background.',
  },
]
