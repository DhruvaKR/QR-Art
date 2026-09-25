export const ERROR_LEVEL_NAMES = {
  L: 'Low (~7%)',
  M: 'Medium (~15%)',
  Q: 'Quartile (~25%)',
  H: 'High (~30%)'
};

export const DEFAULT_FIELDS = {
  textContent: 'Welcome to QR Art!',
  urlInput: '',
  multiUrls: '',
  emailAddress: '',
  emailSubject: '',
  emailBody: '',
  phoneNumber: '',
  smsNumber: '',
  smsMessage: '',
  wifiSSID: '',
  wifiPassword: '',
  wifiSecurity: 'WPA',
  firstName: '',
  lastName: '',
  organization: '',
  vcardPhone: '',
  vcardEmail: '',
  vcardWebsite: ''
};

export const DEFAULT_OPTS = {
  size: 280,
  errorLevel: 'M',
  fgColor: '#111827',
  bgColor: '#ffffff',
  dotStyle: 'square',
  cornerStyle: 'square',
  eyeColorEnabled: false,
  eyeColor: '#111827',
  gradientEnabled: false,
  gradientType: 'linear',
  gradientColor2: '#6366f1',
  frameEnabled: false,
  frameText: 'SCAN ME',
  framePosition: 'bottom',
  frameColor: '#111827',
  frameTextColor: '#ffffff'
};

export function downloadHref(href, filename) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = href;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
