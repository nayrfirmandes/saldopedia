'use client';

import UnifiedCountdown from './unified-countdown';

interface OrderCountdownProps {
  orderId: string;
  expiresAt: string;
  status: string;
}

export default function OrderCountdown({ orderId, expiresAt, status }: OrderCountdownProps) {
  return (
    <UnifiedCountdown
      id={orderId}
      expiresAt={expiresAt}
      status={status}
      type="order"
      validStatuses={['pending', 'pending_proof']}
      expiredRedirectPath="/order/expired?orderId={id}"
    />
  );
}
