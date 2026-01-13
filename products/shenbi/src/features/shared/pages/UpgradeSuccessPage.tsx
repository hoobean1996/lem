/**
 * Upgrade Success Page
 *
 * Shown after successful Stripe payment.
 * The webhook handles subscription activation automatically.
 */

import { Link } from 'react-router-dom';
import { Check, Crown } from 'lucide-react';
import { useLanguage } from '../../../infrastructure/i18n';

export default function UpgradeSuccessPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center relative">
            <Check className="w-12 h-12 text-green-500" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          {t('subscription.paymentSuccess')}
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 text-lg">{t('subscription.paymentSuccessDesc')}</p>

        {/* Back to app button */}
        <Link
          to="/"
          className="inline-block w-full py-4 bg-gradient-to-r from-green-400 to-green-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg"
        >
          {t('subscription.backToApp')}
        </Link>
      </div>
    </div>
  );
}
