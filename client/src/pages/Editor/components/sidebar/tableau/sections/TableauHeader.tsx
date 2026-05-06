import React from 'react';
import { LayoutGrid, Users } from 'lucide-react';
import { Button } from '../../../../../../ui';
import EventPurchaseModal from '../../../../../../components/payments/EventPurchaseModal';
import type { EventData } from '../../../../../../types/editor';

interface TableauHeaderProps {
  hasTableauAccess: boolean;
  isPurchaseModalOpen: boolean;
  setIsPurchaseModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  slug?: string;
  eventTitle: string;
  event?: EventData | null;
  updateEventData?: (updates: Partial<EventData>, pushToHistory?: () => void) => void;
  config: any;
  patchConfig: (patch: any) => void;
  showPublishConfirm: boolean;
  setShowPublishConfirm: React.Dispatch<React.SetStateAction<boolean>>;
}

const TableauHeader: React.FC<TableauHeaderProps> = ({
  hasTableauAccess,
  isPurchaseModalOpen,
  setIsPurchaseModalOpen,
  slug,
  eventTitle,
  event,
  updateEventData,
  config,
  patchConfig,
  showPublishConfirm,
  setShowPublishConfirm,
}) => {
  return (
    <>
      {!hasTableauAccess && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1000,
          background: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <LayoutGrid size={24} />
          </div>
          <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Tableau Premium</h4>
          <p style={{ margin: '0 0 20px', fontSize: '11px', lineHeight: 1.5, color: 'var(--text-soft)', maxWidth: '200px' }}>
            Attiva l'add-on per gestire i tavoli, gli ospiti e usare l'algoritmo intelligente.
          </p>
          <Button
            variant="primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setIsPurchaseModalOpen(true)}
          >
            Attiva ora per €15
          </Button>

          {slug && (
            <EventPurchaseModal
              open={isPurchaseModalOpen}
              onClose={() => setIsPurchaseModalOpen(false)}
              eventSlug={slug}
              eventTitle={eventTitle}
              purchaseType="tableau_addon"
              onUnlocked={() => {
                setIsPurchaseModalOpen(false);
                if (updateEventData) {
                  updateEventData({
                    addons: {
                      ...(event?.addons || {}),
                      tableau: true
                    }
                  });
                }
              }}
            />
          )}
        </div>
      )}

      {/* HEADER */}
      <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(var(--accent-rgb), 0.12)',
            border: '1px solid rgba(var(--accent-rgb), 0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <Users size={18} color="var(--accent)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Stai modificando</div>
            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Tableau de Mariage</h3>
          </div>
        </div>

        <p style={{ fontSize: '10px', color: 'var(--text-soft)', lineHeight: 1.4, margin: '0 0 12px' }}>
          Pubblica il tableau in pagina pubblica solo quando sarai sicuro della disposizione definitiva.
        </p>

        {!showPublishConfirm ? (
          <Button
            variant={config.tableauIsPublished ? "subtle" : "primary"}
            onClick={() => setShowPublishConfirm(true)}
            style={{ width: '100%', fontSize: '11px', height: '32px', justifyContent: 'center', borderRadius: '100px' }}
          >
            {config.tableauIsPublished ? "Rendi Privato (Bozza)" : "Pubblica Tableau"}
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="ghost"
              onClick={() => setShowPublishConfirm(false)}
              style={{ flex: 1, fontSize: '10px', height: '32px', borderRadius: '100px' }}
            >
              Annulla
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                patchConfig({ tableauIsPublished: !config.tableauIsPublished });
                setShowPublishConfirm(false);
              }}
              style={{ flex: 1, fontSize: '10px', height: '32px', borderRadius: '100px', background: config.tableauIsPublished ? '#ff4d4d' : 'var(--accent)' }}
            >
              {config.tableauIsPublished ? "Sì, nascondi" : "Sì, pubblica"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default TableauHeader;
