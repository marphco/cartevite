import React from 'react';
import { ConnectAccountOnboarding, ConnectNotificationBanner } from '@stripe/react-connect-js';
import StripeConnectProvider from './StripeConnectProvider';

interface StripeEmbeddedOnboardingProps {
  onExit?: () => void;
}

const StripeEmbeddedOnboarding: React.FC<StripeEmbeddedOnboardingProps> = ({ onExit }) => {
  return (
    <StripeConnectProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <ConnectNotificationBanner />
        <ConnectAccountOnboarding onExit={onExit ?? (() => {})} />
      </div>
    </StripeConnectProvider>
  );
};

export default StripeEmbeddedOnboarding;
