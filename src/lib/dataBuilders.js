/* Builds the raw string encoded into the QR code for each content type. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[1-9][\d]{0,15}$/;

function cleanPhone(value) {
  return value.replace(/[-\s()]/g, '');
}

export function normalizeUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const DataBuilders = {
  text(v) {
    return v.textContent.trim();
  },

  url(v) {
    const raw = v.urlInput.trim();
    if (!raw) return '';
    const url = normalizeUrl(raw);
    new URL(url); // throws on invalid
    return url;
  },

  multi(v) {
    const lines = v.multiUrls.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return '';
    const urls = lines.map((line, i) => {
      const url = normalizeUrl(line);
      try {
        new URL(url);
      } catch {
        throw new Error(`Line ${i + 1} isn't a valid URL.`);
      }
      return url;
    });
    return urls.join('\n');
  },

  email(v) {
    const email = v.emailAddress.trim();
    if (!email) return '';
    if (!EMAIL_RE.test(email)) throw new Error('Please enter a valid email address.');

    let data = `mailto:${email}`;
    const params = [];
    if (v.emailSubject.trim()) params.push(`subject=${encodeURIComponent(v.emailSubject.trim())}`);
    if (v.emailBody.trim()) params.push(`body=${encodeURIComponent(v.emailBody.trim())}`);
    if (params.length) data += `?${params.join('&')}`;
    return data;
  },

  phone(v) {
    const phone = v.phoneNumber.trim();
    if (!phone) return '';
    if (!PHONE_RE.test(cleanPhone(phone))) throw new Error('Please enter a valid phone number.');
    return `tel:${phone}`;
  },

  sms(v) {
    const number = v.smsNumber.trim();
    if (!number) return '';
    if (!PHONE_RE.test(cleanPhone(number))) throw new Error('Please enter a valid phone number.');
    let data = `sms:${number}`;
    if (v.smsMessage.trim()) data += `?body=${encodeURIComponent(v.smsMessage.trim())}`;
    return data;
  },

  wifi(v) {
    const ssid = v.wifiSSID.trim();
    if (!ssid) return '';
    if (ssid.length > 32) throw new Error('WiFi network name cannot exceed 32 characters.');
    if (v.wifiPassword.length > 63) throw new Error('WiFi password cannot exceed 63 characters.');
    return `WIFI:T:${v.wifiSecurity};S:${ssid};P:${v.wifiPassword || ''};H:false;;`;
  },

  vcard(v) {
    const first = v.firstName.trim();
    const last = v.lastName.trim();
    if (!first && !last) return '';

    if (v.vcardEmail.trim() && !EMAIL_RE.test(v.vcardEmail.trim())) {
      throw new Error('Please enter a valid email address.');
    }
    if (v.vcardPhone.trim() && !PHONE_RE.test(cleanPhone(v.vcardPhone.trim()))) {
      throw new Error('Please enter a valid phone number.');
    }

    let website = '';
    if (v.vcardWebsite.trim()) {
      website = normalizeUrl(v.vcardWebsite.trim());
      try { new URL(website); } catch { throw new Error('Please enter a valid website URL.'); }
    }

    let data = 'BEGIN:VCARD\nVERSION:3.0\n';
    data += `FN:${first} ${last}\n`;
    data += `N:${last};${first};;;\n`;
    if (v.organization.trim()) data += `ORG:${v.organization.trim()}\n`;
    if (v.vcardPhone.trim()) data += `TEL:${v.vcardPhone.trim()}\n`;
    if (v.vcardEmail.trim()) data += `EMAIL:${v.vcardEmail.trim()}\n`;
    if (website) data += `URL:${website}\n`;
    data += 'END:VCARD';
    return data;
  }
};

export const DATA_TYPE_LABELS = {
  text: 'Plain text',
  url: 'Website URL',
  multi: 'Multiple URLs',
  email: 'Email',
  phone: 'Phone number',
  sms: 'SMS message',
  wifi: 'WiFi network',
  vcard: 'Contact card'
};

export const TYPE_DESCRIPTIONS = {
  text: 'Encode any plain text — a note, a message, anything.',
  url: 'Redirect to an existing web page.',
  multi: 'Combine several URLs into a single QR code.',
  email: 'Open a pre-filled email in the scanner’s mail app.',
  phone: 'Dial a number as soon as it’s scanned.',
  sms: 'Open a pre-filled text message, ready to send.',
  wifi: 'Join a WiFi network without typing the password.',
  vcard: 'Share a contact card that saves straight to an address book.'
};
