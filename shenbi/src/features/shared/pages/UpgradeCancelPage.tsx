/**
 * Upgrade Cancel Page
 *
 * Shown when user cancels Stripe payment.
 */

import { Link } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../infrastructure/i18n';

export default function UpgradeCancelPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
        {/* Cancel icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <X className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          {t('subscription.paymentCancelled')}
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 text-lg">{t('subscription.paymentCancelledDesc')}</p>

        {/* Back to app button */}
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('subscription.backToApp')}
        </Link>
      </div>
    </div>
  );
}
