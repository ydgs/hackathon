import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';

// MOCK: replace with GET /api/v1/privacy-notice when backend is ready
const MOCK_PRIVACY_CONTENT = `
## Privacy Notice — EV Charging Platform

**Version:** v1 · **Effective:** 1 May 2026

### What data we collect

We collect the following personal data when you use the NEXLevel Charge platform:

- Your name, email address, and Accenture employee identifier (EID).
- Your badge identifier, where applicable.
- Your vehicle make and model.
- Your parking slot assignment, where applicable.
- Booking records: charger selected, date, start time, end time.
- Charging session data: energy consumed (kWh), session duration, charger used, connector ID, session state.
- Notification delivery status.
- Audit log entries for your actions within the platform.

### Why we collect this data

Your data is used to:

- Manage fair access to EV charging infrastructure.
- Enforce the one-hour-per-user-per-day charging limit.
- Authorize your RFID/tag for the charging station during your booking window.
- Send reminders about your upcoming or active charging session.
- Generate anonymised sustainability and usage reporting for the facilities and ESG teams.
- Maintain an audit trail for governance and compliance purposes.

### Who can access your data

| Role | Access level |
|---|---|
| Standard User | Own bookings, own session data only |
| Security | Your booking status for operational validation |
| Workplace | Operational booking data for coordination |
| Admin / Facilities | Full platform data for operations and reporting |
| System | Automated notifications and audit logging |

Your name, vehicle make, and vehicle model are masked from non-admin users on the real-time dashboard.

### Data retention

Booking and session records are retained for 24 months for ESG and audit purposes, in line with Accenture data governance policy.

### Your rights

You may request access to, correction of, or deletion of your personal data by contacting the Workplace team. Note that booking and session records cannot be deleted while they are referenced by active audit obligations.

### Questions

Contact the Workplace Team or the Data Privacy Office at Accenture Mauritius.
`;

export function PrivacyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/dashboard';

  const [acknowledging, setAcknowledging] = useState(false);
  const [error, setError] = useState('');

  const handleAcknowledge = async () => {
    setAcknowledging(true);
    setError('');
    try {
      // MOCK: replace with POST /api/v1/privacy-notice/acknowledge when backend is ready
      await new Promise((r) => setTimeout(r, 400));
      navigate(returnTo);
    } catch {
      setError('Failed to acknowledge privacy notice. Please try again.');
    } finally {
      setAcknowledging(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-brand-300 hover:text-brand-400 mb-6"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
        Dashboard
      </Link>

      <div className="bg-brand-800 rounded-card border border-brand-700/40 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-700">
          <h1 className="text-xl font-bold text-white">Privacy Notice</h1>
          <p className="text-xs text-gray-400 mt-1">
            Version v1 · Effective 1 May 2026
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 prose prose-invert prose-sm max-w-none">
          <PrivacyContent markdown={MOCK_PRIVACY_CONTENT} />
        </div>

        {/* CTA */}
        <div className="px-6 py-5 border-t border-brand-700 sticky bottom-0 bg-brand-800">
          {error && (
            <ErrorBanner message={error} dismissable className="mb-4" />
          )}
          <Button
            variant="primary"
            size="lg"
            loading={acknowledging}
            className="w-full"
            onClick={handleAcknowledge}
          >
            {acknowledging ? 'Acknowledging…' : '✓ Acknowledge and Continue'}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            By continuing, you acknowledge that you have read and understood this privacy notice.
          </p>
        </div>
      </div>
    </div>
  );
}

// Lightweight markdown-to-HTML renderer (no library needed for this simple content)
function PrivacyContent({ markdown }: { markdown: string }) {
  const lines = markdown.trim().split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(2);
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto my-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                {header.map((cell, i) => (
                  <th key={i} className="text-left px-3 py-2 bg-brand-700 text-gray-200 border border-brand-600">
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-brand-800' : 'bg-brand-700/30'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-300 border border-brand-600">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, i) => {
    if (line.startsWith('|')) {
      inTable = true;
      tableRows.push(line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));
      return;
    }
    if (inTable) flushTable();

    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-6 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-base font-semibold text-gray-200 mt-4 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-semibold text-gray-200 text-sm">{line.slice(2, -2)}</p>);
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="text-sm text-gray-300 ml-4 list-disc">{line.slice(2)}</li>);
    } else if (line.trim() === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(<p key={i} className="text-sm text-gray-300">{line}</p>);
    }
  });

  if (inTable) flushTable();

  return <div className="space-y-1">{elements}</div>;
}
