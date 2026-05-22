import { Link } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <ExclamationCircleIcon className="h-16 w-16 text-gray-600" aria-hidden="true" />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="text-xl font-semibold text-gray-300">Page Not Found</p>
        <p className="text-sm text-gray-500 max-w-xs">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link to="/dashboard">
        <Button variant="primary" size="md">
          Go to Dashboard
        </Button>
      </Link>
    </div>
  );
}
