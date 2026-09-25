export default function ContentForm({ activeType, fields, onChange }) {
  const set = (key) => (e) => onChange(key, e.target.value);

  if (activeType === 'text') {
    return (
      <label className="field">
        <span>Text content</span>
        <textarea maxLength={2000} placeholder="Type anything…" value={fields.textContent} onChange={set('textContent')} />
      </label>
    );
  }

  if (activeType === 'url') {
    return (
      <label className="field">
        <span>Website URL</span>
        <input type="url" maxLength={500} placeholder="example.com" value={fields.urlInput} onChange={set('urlInput')} />
      </label>
    );
  }

  if (activeType === 'multi') {
    return (
      <>
        <label className="field">
          <span>URLs <em>one per line</em></span>
          <textarea
            rows={8}
            placeholder={'example.com\nanother-site.com/page\nthird-site.com'}
            value={fields.multiUrls}
            onChange={set('multiUrls')}
          />
        </label>
        <p className="hint">All of these are combined into one QR code — scanning it reveals the whole list as text. Blank lines are ignored.</p>
      </>
    );
  }

  if (activeType === 'email') {
    return (
      <>
        <label className="field">
          <span>Email address</span>
          <input type="email" maxLength={254} placeholder="you@example.com" value={fields.emailAddress} onChange={set('emailAddress')} />
        </label>
        <label className="field">
          <span>Subject (optional)</span>
          <input type="text" maxLength={100} value={fields.emailSubject} onChange={set('emailSubject')} />
        </label>
        <label className="field">
          <span>Message (optional)</span>
          <textarea maxLength={1000} value={fields.emailBody} onChange={set('emailBody')} />
        </label>
      </>
    );
  }

  if (activeType === 'phone') {
    return (
      <label className="field">
        <span>Phone number</span>
        <input type="tel" maxLength={20} placeholder="+1 234 567 8900" value={fields.phoneNumber} onChange={set('phoneNumber')} />
      </label>
    );
  }

  if (activeType === 'sms') {
    return (
      <>
        <label className="field">
          <span>Phone number</span>
          <input type="tel" maxLength={20} placeholder="+1 234 567 8900" value={fields.smsNumber} onChange={set('smsNumber')} />
        </label>
        <label className="field">
          <span>Message</span>
          <textarea maxLength={160} value={fields.smsMessage} onChange={set('smsMessage')} />
        </label>
      </>
    );
  }

  if (activeType === 'wifi') {
    return (
      <>
        <label className="field">
          <span>Network name (SSID)</span>
          <input type="text" maxLength={32} placeholder="MyWiFi" value={fields.wifiSSID} onChange={set('wifiSSID')} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="text" maxLength={63} value={fields.wifiPassword} onChange={set('wifiPassword')} />
        </label>
        <label className="field">
          <span>Security</span>
          <select value={fields.wifiSecurity} onChange={set('wifiSecurity')}>
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">Open (no password)</option>
          </select>
        </label>
      </>
    );
  }

  if (activeType === 'vcard') {
    return (
      <>
        <div className="field-row">
          <label className="field">
            <span>First name</span>
            <input type="text" maxLength={50} value={fields.firstName} onChange={set('firstName')} />
          </label>
          <label className="field">
            <span>Last name</span>
            <input type="text" maxLength={50} value={fields.lastName} onChange={set('lastName')} />
          </label>
        </div>
        <label className="field">
          <span>Organization</span>
          <input type="text" maxLength={100} value={fields.organization} onChange={set('organization')} />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Phone</span>
            <input type="tel" maxLength={20} value={fields.vcardPhone} onChange={set('vcardPhone')} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" maxLength={254} value={fields.vcardEmail} onChange={set('vcardEmail')} />
          </label>
        </div>
        <label className="field">
          <span>Website</span>
          <input type="url" maxLength={500} value={fields.vcardWebsite} onChange={set('vcardWebsite')} />
        </label>
      </>
    );
  }

  return null;
}
