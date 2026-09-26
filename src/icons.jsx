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

export function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.93 0-1.31.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

export function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.266 2.37 4.266 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
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
