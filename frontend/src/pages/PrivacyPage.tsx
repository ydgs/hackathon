import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { useAuth } from '../hooks/useAuth';
import { getPrivacyNotice, acknowledgePrivacyNotice } from '../services/privacy.service';
import type { PrivacyNotice } from '../services/privacy.service';

export function PrivacyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/dashboard';
  const { acknowledgePrivacy } = useAuth();

  const [notice, setNotice] = useState<PrivacyNotice | null>(null);
  const [loadingNotice, setLoadingNotice] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [acknowledging, setAcknowledging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPrivacyNotice()
      .then(setNotice)
      .catch(() => setLoadError('Failed to load the privacy notice. Please refresh and try again.'))
      .finally(() => setLoadingNotice(false));
  }, []);

  const handleAcknowledge = async () => {
    if (!notice) return;
    setAcknowledging(true);
    setError('');
    try {
      const res = await acknowledgePrivacyNotice(notice.version);
      acknowledgePrivacy(res.version, res.acknowledgedAt);
      navigate(returnTo);
    } catch (err: unknown) {
      const e = err as Error & { apiError?: { message: string; errors?: Array<{ code?: string }> } };
      if (e.apiError?.errors?.some((x) => x.code === 'AlreadyAcknowledged')) {
        acknowledgePrivacy(notice.version, new Date().toISOString());
        navigate(returnTo);
        return;
      }
      setError(e.apiError?.message ?? 'Failed to acknowledge privacy notice. Please try again.');
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
          {notice && (
            <p className="text-xs text-gray-400 mt-1">
              Version {notice.version} · Effective {new Date(notice.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-5 prose prose-invert prose-sm max-w-none">
          {loadingNotice ? (
            <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
              <div className="h-4 w-4 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
              Loading privacy notice…
            </div>
          ) : loadError ? (
            <ErrorBanner message={loadError} />
          ) : notice ? (
            <PrivacyContent markdown={notice.content} />
          ) : null}
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
            disabled={loadingNotice || !!loadError || !notice}
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
