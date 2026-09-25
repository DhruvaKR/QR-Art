/* Small hand-authored inline icon set — no external icon library or font. */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};

export function TextIcon(props) {
  return <svg {...base} {...props}><path d="M4 4h16M4 10h16M4 16h10" /></svg>;
}

export function UrlIcon(props) {
  return <svg {...base} {...props}><circle cx="8" cy="12" r="3" /><circle cx="16" cy="12" r="3" /><path d="M11 12h2" /></svg>;
}

export function MultiIcon(props) {
  return <svg {...base} {...props}><rect x="3" y="3" width="11" height="11" rx="2" /><rect x="10" y="10" width="11" height="11" rx="2" /></svg>;
}

export function EmailIcon(props) {
  return <svg {...base} {...props}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
}

export function PhoneIcon(props) {
  return <svg {...base} {...props}><rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" /></svg>;
}

export function SmsIcon(props) {
  return <svg {...base} {...props}><path d="M4 4h16v12H8l-4 4V4z" /></svg>;
}

export function WifiIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M2 8.5a16 16 0 0120 0" />
      <path d="M5.5 12a11 11 0 0113 0" />
      <path d="M9 15.5a6 6 0 016 0" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ContactIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10.5" r="2.25" />
      <path d="M5.5 16.5c.6-2 2.4-3 3.5-3s2.9 1 3.5 3M14.5 9.5h4M14.5 13h4" />
    </svg>
  );
}

export function DownloadIcon(props) {
  return <svg {...base} {...props}><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>;
}

export function FileIcon(props) {
  return <svg {...base} {...props}><path d="M6 2h9l5 5v15H6z" /><path d="M15 2v5h5" /></svg>;
}

export function CopyIcon(props) {
  return <svg {...base} {...props}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>;
}

export const TYPE_ICONS = {
  text: TextIcon,
  url: UrlIcon,
  multi: MultiIcon,
  email: EmailIcon,
  phone: PhoneIcon,
  sms: SmsIcon,
  wifi: WifiIcon,
  vcard: ContactIcon
};
