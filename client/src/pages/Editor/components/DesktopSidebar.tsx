import React from 'react';
import { Surface, Button } from "../../../ui";
import { 
  Palette as PaletteIcon, Layout, Monitor, Smartphone, Mail, MailOpen, Sparkles
} from "lucide-react";
import InviteSection from "./sidebar/InviteSection";
import EnvelopeSection from "./sidebar/EnvelopeSection";
import ScenarioSection from "./sidebar/ScenarioSection";
import PageSection from "./sidebar/PageSection";
import type { Layer, CanvasProps, Block } from "../../../types/editor";

interface DesktopSidebarProps {
  slug: string;
  editorMode: 'canvas' | 'envelope' | 'background' | 'event_page' | 'sections';
  setEditorMode: (mode: 'canvas' | 'envelope' | 'background' | 'event_page') => void;
  selectedLayer: any;
  selectedLayerIds: string[];
  layers: Layer[];
  setSelectedLayerIds: (ids: string[]) => void;
  updateSelectedLayer: (updates: Partial<Layer>) => void;
  deleteSelectedLayers: () => void;
  alignLayers: (dir: any, ref: any) => void;
  hoveredLayerId: string | null;
  setHoveredLayerId: (id: string | null) => void;
  keyLayerId: string | null;
  setKeyLayerId: (id: string | null) => void;
  alignmentReference: any;
  setAlignmentReference: (ref: any) => void;
  displayColorPicker: 'font' | 'bg' | false;
  setDisplayColorPicker: (show: 'font' | 'bg' | false) => void;
  addTextLayer: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canvasProps: CanvasProps;
  setCanvasProps: React.Dispatch<React.SetStateAction<CanvasProps>>;
  invitoBgInputRef: React.RefObject<HTMLInputElement | null>;
  isEditingBackground: boolean;
  setIsEditingBackground: (val: boolean) => void;
  pushToHistory: () => void;
  handleBackgroundUpload: (file: File, type: 'canvas' | 'liner' | 'scenario') => Promise<void>;
  isEnvelopeOpen: boolean;
  setIsEnvelopeOpen: (val: boolean) => void;
  event: any;
  updateTheme: (updates: any) => void;
  textureInputRef: React.RefObject<HTMLInputElement | null>;
  userLinerImages: string[];
  isEditingLiner: boolean;
  setIsEditingLiner: (val: boolean) => void;
  scenarioBgInputRef: React.RefObject<HTMLInputElement | null>;
  userScenarioBgImages: string[];
  previewMobile?: boolean;
  setPreviewMobile: (preview: boolean) => void;
  selectedBlockId: string | null;
  selectedBlock: Block | null;
  blocks: Block[] | null;
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>> | null;
  setIsDirty: (val: boolean) => void;
  activeRsvpTab: 'content' | 'style' | 'questions';
  setActiveRsvpTab: (tab: 'content' | 'style' | 'questions') => void;
  showVisibility?: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  slug,
  editorMode,
  setEditorMode,
  selectedLayer,
  selectedLayerIds,
  layers,
  setSelectedLayerIds,
  updateSelectedLayer,
  deleteSelectedLayers,
  alignLayers,
  hoveredLayerId,
  setHoveredLayerId,
  keyLayerId,
  setKeyLayerId,
  alignmentReference,
  setAlignmentReference,
  displayColorPicker,
  setDisplayColorPicker,
  addTextLayer,
  fileInputRef,
  handleImageUpload,
  canvasProps,
  setCanvasProps,
  invitoBgInputRef,
  isEditingBackground,
  setIsEditingBackground,
  pushToHistory,
  handleBackgroundUpload,
  isEnvelopeOpen,
  setIsEnvelopeOpen,
  event,
  updateTheme,
  textureInputRef,
  userLinerImages,
  isEditingLiner,
  setIsEditingLiner,
  scenarioBgInputRef,
  userScenarioBgImages,
  previewMobile = false,
  setPreviewMobile = () => {},
  selectedBlockId,
  selectedBlock,
  blocks,
  setBlocks,
  setIsDirty,
  activeRsvpTab,
  setActiveRsvpTab,
  showVisibility = true
}) => {
  const [activeRsvpTabLocal, setActiveRsvpTabLocal] = React.useState<'content' | 'style' | 'questions'>('content');
  const activeRsvpTabActual = activeRsvpTab || activeRsvpTabLocal;
  const setActiveRsvpTabActual = setActiveRsvpTab || setActiveRsvpTabLocal;

  return (
    <div className="editor-sidebar left-sidebar">
        {/* SWITCHER DESKTOP */}
        <Surface variant="soft" className="panel-section desktop-only" style={{ marginBottom: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-soft)', letterSpacing: '1px', marginBottom: '12px', textTransform: 'uppercase' }}>Scegli Cosa Modificare</div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
             <Button 
               variant={editorMode === 'canvas' ? 'primary' : 'subtle'} 
               style={{ 
                 flex: 1, 
                 justifyContent: 'center', 
                 fontSize: '10px', 
                 padding: '8px 2px',
                 ...(editorMode === 'canvas' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
               }}
               onClick={() => setEditorMode('canvas')}
             >
               Invito
             </Button>
             <Button 
               variant={editorMode === 'envelope' ? 'primary' : 'subtle'} 
               style={{ 
                 flex: 1, 
                 justifyContent: 'center', 
                 fontSize: '10px', 
                 padding: '8px 2px',
                 ...(editorMode === 'envelope' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
               }}
               onClick={() => { setEditorMode('envelope'); setIsEnvelopeOpen(true); }}
             >
               Busta
             </Button>
              <Button 
                variant={editorMode === 'background' ? 'primary' : 'subtle'} 
                style={{ 
                  flex: 1, 
                  justifyContent: 'center', 
                  fontSize: '10px', 
                  padding: '8px 2px',
                  ...(editorMode === 'background' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {})
                }}
                onClick={() => setEditorMode('background')}
              >
                 Scenario
               </Button>
            </div>
            <Button 
              variant={editorMode === 'event_page' ? 'primary' : 'subtle'} 
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px', marginTop: '4px', ...(editorMode === 'event_page' ? { boxShadow: '0 0 12px rgba(var(--accent-rgb), 0.4)' } : {}) }}
              onClick={() => setEditorMode('event_page')}
            >
              Pagina Evento
            </Button>
         </Surface>

          {/* Invite Design Section */}
          {editorMode === 'canvas' && (
            <InviteSection 
              slug={slug}
              selectedLayer={selectedLayer}
              selectedLayerIds={selectedLayerIds}
              layers={layers}
              setSelectedLayerIds={setSelectedLayerIds}
              updateSelectedLayer={updateSelectedLayer}
              deleteSelectedLayers={deleteSelectedLayers}
              alignLayers={alignLayers}
              hoveredLayerId={hoveredLayerId}
              setHoveredLayerId={setHoveredLayerId}
              keyLayerId={keyLayerId}
              setKeyLayerId={setKeyLayerId}
              alignmentReference={alignmentReference}
              setAlignmentReference={setAlignmentReference}
              displayColorPicker={displayColorPicker}
              setDisplayColorPicker={setDisplayColorPicker}
              addTextLayer={addTextLayer}
              fileInputRef={fileInputRef}
              handleImageUpload={handleImageUpload}
              canvasProps={canvasProps}
              setCanvasProps={setCanvasProps}
              invitoBgInputRef={invitoBgInputRef}
              isEditingBackground={isEditingBackground}
              setIsEditingBackground={setIsEditingBackground}
              pushToHistory={pushToHistory}
              handleBackgroundUpload={handleBackgroundUpload}
              showVisibility={false}
            />
          )}

          {/* Envelope Design Section */}
          {editorMode === 'envelope' && (
            <EnvelopeSection 
              isEnvelopeOpen={isEnvelopeOpen}
              setIsEnvelopeOpen={setIsEnvelopeOpen}
              canvasProps={canvasProps}
              event={event}
              pushToHistory={pushToHistory}
              updateTheme={updateTheme}
              displayColorPicker={displayColorPicker}
              setDisplayColorPicker={setDisplayColorPicker}
              textureInputRef={textureInputRef}
              handleBackgroundUpload={handleBackgroundUpload}
              userLinerImages={userLinerImages}
              isEditingLiner={isEditingLiner}
              setIsEditingLiner={setIsEditingLiner}
            />
          )}

          {/* Scene Background Selection Section */}
          {editorMode === 'background' && (
            <ScenarioSection 
              displayColorPicker={displayColorPicker}
              setDisplayColorPicker={setDisplayColorPicker}
              pushToHistory={pushToHistory}
              event={event}
              updateTheme={updateTheme}
              scenarioBgInputRef={scenarioBgInputRef}
              handleBackgroundUpload={handleBackgroundUpload}
              userScenarioBgImages={userScenarioBgImages}
            />
          )}

          {editorMode === "event_page" && (
            <PageSection 
              previewMobile={previewMobile}
              setPreviewMobile={setPreviewMobile}
              slug={slug}
              selectedLayer={selectedLayer}
              selectedLayerIds={selectedLayerIds}
              layers={layers}
              setSelectedLayerIds={setSelectedLayerIds}
              updateSelectedLayer={updateSelectedLayer}
              deleteSelectedLayers={deleteSelectedLayers}
              alignLayers={alignLayers}
              hoveredLayerId={hoveredLayerId}
              setHoveredLayerId={setHoveredLayerId}
              keyLayerId={keyLayerId}
              setKeyLayerId={setKeyLayerId}
              alignmentReference={alignmentReference}
              setAlignmentReference={setAlignmentReference}
              displayColorPicker={displayColorPicker}
              setDisplayColorPicker={setDisplayColorPicker}
              selectedBlockId={selectedBlockId}
              addTextLayer={addTextLayer}
              fileInputRef={fileInputRef}
              handleImageUpload={handleImageUpload}
              blocks={blocks || []}
              setBlocks={setBlocks || (() => {})}
              setIsDirty={setIsDirty}
              pushToHistory={pushToHistory}
              showVisibility={true}
              updateTheme={updateTheme}
            />
          )}
     </div>
  );
};

export default DesktopSidebar;
