import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import { Home, LayoutDashboard, Save, Check, ImageIcon, Sparkles, Shapes, Undo2, PanelTop } from "lucide-react";

import "./EventEditor.css";
import EditorStage from "./components/EditorStage";

// Sub-components
import DesktopSidebar from "./components/DesktopSidebar";
import MobileToolbar from "./components/MobileToolbar";
import MobileIconBtn from "../../components/ui/MobileIconBtn";
import { loadGoogleFont, AVAILABLE_FONTS } from "./components/EditorHelpers";
import { useEditorHistory } from "../../hooks/useEditorHistory";

// Hooks
import { useFetchEvent } from "./hooks/useFetchEvent";
import { useLayerManager } from "./hooks/useLayerManager";
import { useEditorInteractions } from "./hooks/useEditorInteractions";

// Types
import type { EventData, Layer, Block, CanvasProps } from "../../types/editor";

export default function EventEditor() {
  const isMobile = window.innerWidth <= 768;
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [canvasProps, setCanvasProps] = useState<CanvasProps>({ 
    bgImage: null, bgColor: '#ffffff', bgX: 0, bgY: 0, bgScale: 1, width: 800, height: 1000 
  });
  
  const [activeMobileTab, setActiveMobileTab] = useState<string | null>(null);
  const [showMobileAnchorGrid, setShowMobileAnchorGrid] = useState(false);
  const [isFontExpanded, setIsFontExpanded] = useState(false);
  const [alignmentReference, setAlignmentReference] = useState<string>('canvas'); // 'canvas' | 'selection'
  
  const [displayColorPicker, setDisplayColorPicker] = useState<'font' | 'bg' | false>(false);
  const [isEditingBackground, setIsEditingBackground] = useState(false);
  const [isEditingLiner, setIsEditingLiner] = useState(false);
  const [userLinerImages] = useState<string[]>([]);
  const [userScenarioBgImages] = useState<string[]>([]);
  const [bgNaturalSize, setBgNaturalSize] = useState({ w: 0, h: 0 });
  const [editorMode, setEditorMode] = useState<any>('canvas');
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);
  const scenarioBgInputRef = useRef<HTMLInputElement>(null);
  const invitoBgInputRef = useRef<HTMLInputElement>(null);
  const stateBeforeActionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageScaleRef = useRef(1);

  // --- HISTORY & PERSISTENCE HOOK ---
  const [layers, setLayers] = useState<Layer[]>([]);
  const [event, setEvent] = useState<EventData | null>(null);

  const {
    isDirty, setIsDirty,
    autoSaving,
    setDraftRestored,
    undo, pushToHistory,
    handleSaveAndExit,
    loadDraft,
    latestStateRef, history
  } = useEditorHistory(slug as string, event as any, setEvent as any, layers as any, setLayers as any, blocks as any, setBlocks as any, canvasProps as any, setCanvasProps as any, navigate as any);

  // --- CUSTOM HOOKS (SNELLIMENTO) ---
  const { 
    loading, updateTheme 
  } = useFetchEvent(slug, searchParams, loadDraft, setDraftRestored, setIsDirty, {
    setEvent, setLayers, setBlocks, setCanvasProps
  });

  const {
    selectedLayerIds, setSelectedLayerIds,
    editingLayerId, setEditingLayerId,
    hoveredLayerId, setHoveredLayerId,
    keyLayerId, setKeyLayerId,
    addLayer, updateSelectedLayer, alignLayers, deleteSelectedLayers
  } = useLayerManager(layers, setLayers, pushToHistory, setIsDirty, canvasProps, setActiveMobileTab);

  const {
    selectionBox, setSelectionBox, selectionBoxRef,
    snapGuides, setSnapGuides,
    handlePointerDown, handleResizePointerDown
  } = useEditorInteractions({
    canvasRef, canvasProps, layers, setLayers: setLayers,
    selectedLayerIds, setSelectedLayerIds,
    editingLayerId, setEditingLayerId,
    pushToHistory, setIsDirty, stateBeforeActionRef,
    latestStateRef, deleteSelectedLayers,
    setActiveMobileTab, stageScaleRef
  });

  // --- EDITING POSITION AUTO-FOCUS ---
  useEffect(() => {
    if (editingLayerId) {
      setTimeout(() => {
        const el = document.getElementById(`layer-content-${editingLayerId}`);
        if (el) {
          el.focus();
          const range = document.createRange();
          const sel = window.getSelection();
          if (sel) {
            range.selectNodeContents(el);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
      }, 50);
    }
  }, [editingLayerId]);

  // --- SCROLL LOCK FOR MOBILE ---
  useEffect(() => {
    if (window.innerWidth <= 768) {
      document.body.classList.add('editor-locked');
      document.documentElement.style.overscrollBehavior = 'none';
    }
    return () => {
      document.body.classList.remove('editor-locked');
      document.documentElement.style.overscrollBehavior = 'auto';
    };
  }, []);

  // --- KEY HANDLER FOR BG ---
  useEffect(() => {
    if (!isEditingBackground) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') setCanvasProps(prev => ({ ...prev, bgX: (prev.bgX || 0) - step }));
      if (e.key === 'ArrowRight') setCanvasProps(prev => ({ ...prev, bgX: (prev.bgX || 0) + step }));
      if (e.key === 'ArrowUp') setCanvasProps(prev => ({ ...prev, bgY: (prev.bgY || 0) - step }));
      if (e.key === 'ArrowDown') setCanvasProps(prev => ({ ...prev, bgY: (prev.bgY || 0) + step }));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditingBackground]);

  // --- WRAPPER FOR CONVENIENCE ---
  const addTextLayer = () => {
    addLayer("text", {
      text: "Nuovo Testo",
      fontSize: 32,
      fontFamily: event?.theme?.fonts?.heading || "Playfair Display",
      color: event?.theme?.accent || "#000000",
      textAlign: "center",
      width: "max-content",
      fontWeight: "normal",
      fontStyle: "normal",
      textDecoration: "none",
      letterSpacing: 0,
      lineHeight: 1.2
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 300;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            const ratio = Math.min(maxDim / w, maxDim / h);
            w *= ratio;
            h *= ratio;
          }
          addLayer("image", { src: ev.target?.result as string, w: Math.round(w), h: Math.round(h) });
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // --- FONT LOADING ---
  useEffect(() => {
    layers.forEach(l => { if(l.fontFamily) loadGoogleFont(l.fontFamily); });
    AVAILABLE_FONTS.forEach(font => loadGoogleFont(font));
  }, [layers]);

  // --- RESPONSIVE SCALING ---
  const [stageScale, setStageScale] = useState(1);
  const [envelopeScale, setEnvelopeScale] = useState(1);
  const [scenarioScale, setScenarioScale] = useState(0.75);

  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
         // Più prudente su mobile: usiamo 40px di buffer orizzontale anziché 20
         const paddingX = window.innerWidth <= 768 ? 40 : 96;
         const paddingY = window.innerWidth <= 768 ? 20 : 96; 
         
         const availableWidth = Math.max(0, stageRef.current.clientWidth - paddingX);
         const availableHeight = Math.max(0, stageRef.current.clientHeight - paddingY);
         
         const effectiveHeight = (editorMode === 'envelope' && isEnvelopeOpen) ? canvasProps.height * 1.6 : canvasProps.height;
         
         // Calcolo scala: assicuriamoci di non superare mai la larghezza disponibile
         const newScale = Math.min(availableWidth / canvasProps.width, availableHeight / effectiveHeight, 1);
         setStageScale(newScale); 
         stageScaleRef.current = newScale;

         // Envelope Scale
         const isPortrait = canvasProps.width < canvasProps.height;
         const baseW = isPortrait ? 600 : 500;
         const baseH = isPortrait ? (600 / 1.4) : 500;
         const envW = baseW;
         const envH = isEnvelopeOpen ? baseH * 1.6 : baseH;
         const padding = 10;
         const divW = stageRef.current.clientWidth;
         const divH = stageRef.current.clientHeight;
         setEnvelopeScale(Math.min((divW - padding) / envW, (divH - padding) / envH));

         // Scenario Scale
         const sScaleX = stageRef.current.clientWidth / (canvasProps.width * 2.6);
         const sScaleY = stageRef.current.clientHeight / (canvasProps.height * 2.3);
         setScenarioScale(Math.min(sScaleX, sScaleY, 0.8));
      }
    };
    const timer = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    handleResize();
    const observer = new ResizeObserver(() => handleResize());
    if (stageRef.current) observer.observe(stageRef.current);
    return () => { 
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize); 
      observer.disconnect(); 
    };
  }, [canvasProps.width, canvasProps.height, activeMobileTab, isFontExpanded, displayColorPicker, editorMode, isEnvelopeOpen]);

  if (loading) return <div className="editor-page">Caricamento editor...</div>;
  if (!event) return <div className="editor-page">Evento non trovato.</div>;

  const selectedLayer = selectedLayerIds.length > 0 ? layers.find(l => selectedLayerIds.includes(l.id)) : undefined;

  return (
    <div className={`editor-page ${editorMode !== 'canvas' ? 'preview-mode' : 'canvas-mode'}`} onContextMenu={(e) => e.preventDefault()}>
      <div className="editor-topbar">
          <MobileIconBtn icon={Home} label="Home" onClick={() => navigate("/")} />
          <MobileIconBtn icon={LayoutDashboard} label="Eventi" onClick={() => navigate("/dashboard")} />
          <MobileIconBtn icon={ImageIcon} label="Invito" className="mobile-only" variant={editorMode === 'canvas' ? 'primary' : 'ghost'} onClick={() => { setEditorMode('canvas'); setSelectedLayerIds([]); setActiveMobileTab(null); setDisplayColorPicker(false); }} />
          <MobileIconBtn icon={Shapes} label="Busta" className="mobile-only" variant={editorMode === 'envelope' ? 'primary' : 'ghost'} onClick={() => { setEditorMode('envelope'); setSelectedLayerIds([]); setActiveMobileTab(null); setDisplayColorPicker(false); }} />
          <MobileIconBtn icon={Sparkles} label="Scenario" className="mobile-only" variant={editorMode === 'background' ? 'primary' : 'ghost'} onClick={() => { setEditorMode('background'); setActiveMobileTab(null); setDisplayColorPicker(false); setSelectedLayerIds([]); }} />
          <MobileIconBtn icon={PanelTop} label="Pagina" className="mobile-only" variant={editorMode === 'event_page' ? 'primary' : 'ghost'} onClick={() => { setEditorMode('event_page'); setActiveMobileTab(null); setDisplayColorPicker(false); setSelectedLayerIds([]); }} />
          <div style={{ flex: 1 }} className="desktop-only text-center"><h1 style={{ fontSize: '1.2rem', margin: 0 }}>{event.title}</h1></div>
          <MobileIconBtn icon={Undo2} label="Annulla" onClick={undo} disabled={history.length === 0} />
          <MobileIconBtn icon={autoSaving ? Save : (isDirty ? Save : Check)} label={autoSaving ? "..." : (isDirty ? "Bozza" : "Salvato")} disabled style={{ color: autoSaving ? "#f4c46b" : (isDirty ? "salmon" : "#3ae6b3") }} />
          <MobileIconBtn icon={Check} label="Finito!" variant="primary" onClick={handleSaveAndExit} />
      </div>

      <div className="editor-workspace">
        <DesktopSidebar 
          editorMode={editorMode} setEditorMode={setEditorMode}
          selectedLayer={selectedLayer} selectedLayerIds={selectedLayerIds} layers={layers}
          setSelectedLayerIds={setSelectedLayerIds} updateSelectedLayer={updateSelectedLayer}
          deleteSelectedLayers={deleteSelectedLayers} alignLayers={(type, ref) => alignLayers(type, ref, stageScale)}
          hoveredLayerId={hoveredLayerId} setHoveredLayerId={setHoveredLayerId}
          keyLayerId={keyLayerId} setKeyLayerId={setKeyLayerId}
          alignmentReference={alignmentReference} setAlignmentReference={setAlignmentReference}
          displayColorPicker={displayColorPicker} setDisplayColorPicker={setDisplayColorPicker}
          addTextLayer={addTextLayer} fileInputRef={fileInputRef} handleImageUpload={handleImageUpload}
          canvasProps={canvasProps} setCanvasProps={setCanvasProps} invitoBgInputRef={invitoBgInputRef}
          isEditingBackground={isEditingBackground} setIsEditingBackground={setIsEditingBackground}
          isEnvelopeOpen={isEnvelopeOpen} setIsEnvelopeOpen={setIsEnvelopeOpen}
          updateTheme={updateTheme} event={event} textureInputRef={textureInputRef}
          userLinerImages={userLinerImages} isEditingLiner={isEditingLiner} setIsEditingLiner={setIsEditingLiner}
          scenarioBgInputRef={scenarioBgInputRef} userScenarioBgImages={userScenarioBgImages}
          showMobileAnchorGrid={showMobileAnchorGrid} setShowMobileAnchorGrid={setShowMobileAnchorGrid}
        />
        <MobileToolbar 
           activeMobileTab={activeMobileTab} setActiveMobileTab={setActiveMobileTab}
           selectedLayer={selectedLayer} selectedLayerIds={selectedLayerIds} editorMode={editorMode}
           isEnvelopeOpen={isEnvelopeOpen} setIsEnvelopeOpen={setIsEnvelopeOpen}
           isEditingBackground={isEditingBackground} setIsEditingBackground={setIsEditingBackground}
           isEditingLiner={isEditingLiner} setIsEditingLiner={setIsEditingLiner}
           displayColorPicker={displayColorPicker} setDisplayColorPicker={setDisplayColorPicker}
           showMobileAnchorGrid={showMobileAnchorGrid} setShowMobileAnchorGrid={setShowMobileAnchorGrid}
           event={event} updateTheme={updateTheme} canvasProps={canvasProps} setCanvasProps={setCanvasProps}
           userScenarioBgImages={userScenarioBgImages} setUserScenarioBgImages={() => {}} userLinerImages={userLinerImages}
           envelopeScale={envelopeScale} isMobile={isMobile} updateSelectedLayer={updateSelectedLayer}
           deleteSelectedLayers={deleteSelectedLayers} addTextLayer={addTextLayer}
           isFontExpanded={isFontExpanded} setIsFontExpanded={setIsFontExpanded}
           scenarioBgInputRef={scenarioBgInputRef} invitoBgInputRef={invitoBgInputRef} textureInputRef={textureInputRef} fileInputRef={fileInputRef}
         />
        <EditorStage 
          stageRef={stageRef} canvasRef={canvasRef} editorMode={editorMode} isMobile={isMobile}
          isEditingBackground={isEditingBackground} canvasProps={canvasProps} setCanvasProps={setCanvasProps}
          stageScale={stageScale} layers={layers} setLayers={setLayers}
          selectedLayerIds={selectedLayerIds} setSelectedLayerIds={setSelectedLayerIds}
          editingLayerId={editingLayerId} setEditingLayerId={setEditingLayerId}
          hoveredLayerId={hoveredLayerId} setHoveredLayerId={setHoveredLayerId}
          selectionBox={selectionBox} setSelectionBox={setSelectionBox}
          selectionBoxRef={selectionBoxRef} setActiveMobileTab={setActiveMobileTab}
          setDisplayColorPicker={setDisplayColorPicker} event={event} updateTheme={updateTheme}
          isEnvelopeOpen={isEnvelopeOpen} setIsEnvelopeOpen={setIsEnvelopeOpen}
          envelopeScale={envelopeScale} isEditingLiner={isEditingLiner} setIsEditingLiner={setIsEditingLiner}
          scenarioScale={scenarioScale} handlePointerDown={handlePointerDown} handleResizePointerDown={handleResizePointerDown}
          bgNaturalSize={bgNaturalSize} setBgNaturalSize={setBgNaturalSize}
          snapGuides={snapGuides} setSnapGuides={setSnapGuides}
          pushToHistory={pushToHistory} setIsDirty={setIsDirty} setIsFontExpanded={setIsFontExpanded}
          stateBeforeActionRef={stateBeforeActionRef} latestStateRef={latestStateRef}
          blocks={blocks} setBlocks={setBlocks}
        />
        </div>
      </div>
  );
}
