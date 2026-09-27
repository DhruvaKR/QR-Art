import { TYPE_ICONS } from '../icons.jsx';

const TYPES = [
  { key: 'text', label: 'Text' },
  { key: 'url', label: 'URL' },
  { key: 'multi', label: 'Multi URL' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'sms', label: 'SMS' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'upi', label: 'UPI' },
  { key: 'vcard', label: 'Contact' }
];

export default function TypePicker({ activeType, onSelect }) {
  return (
    <div className="type-picker" role="tablist">
      {TYPES.map(({ key, label }) => {
        const Icon = TYPE_ICONS[key];
        const active = key === activeType;
        return (
          <button
            key={key}
            type="button"
            className={`type-btn${active ? ' active' : ''}`}
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(key)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
