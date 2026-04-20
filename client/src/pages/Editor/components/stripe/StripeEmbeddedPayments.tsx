import React from 'react';
import { ConnectPayments } from '@stripe/react-connect-js';
import StripeConnectProvider from './StripeConnectProvider';

/**
 * Stripe Connect — componente `ConnectPayments`: elenco pagamenti sul Connect account
 * dell’utente (ambito Stripe, non filtrato per singolo evento eenvee).
 */
const StripeEmbeddedPayments: React.FC = () => {
  return (
    <StripeConnectProvider>
      <ConnectPayments />
    </StripeConnectProvider>
  );
};

export default StripeEmbeddedPayments;
