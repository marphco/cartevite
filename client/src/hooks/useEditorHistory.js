import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../utils/apiFetch';

export const useEditorHistory = (slug, event, setEvent, layers, setLayers, blocks, setBlocks, canvasProps, setCanvasProps, navigate) => {
  const [history, setHistory] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [draftRestored, setDraftRestored] = useState(false);
  
  const latestStateRef = useRef(null);
  const DRAFT_KEY = `cartevite:draft:${slug}`;

  // Helper per catturare lo stato corrente
  const captureState = useCallback(() => {
    if (!event) return null;
    return {
      layers: JSON.parse(JSON.stringify(layers)),
      blocks: JSON.parse(JSON.stringify(blocks)),
      canvas: JSON.parse(JSON.stringify(canvasProps)),
      theme: JSON.parse(JSON.stringify(event.theme))
    };
  }, [event, layers, blocks, canvasProps]);

  // Aggiorna lo stato "più recente" ad ogni cambiamento
  useEffect(() => {
    if (event) {
      latestStateRef.current = captureState();
    }
  }, [layers, blocks, canvasProps, event, captureState]);

  // Aggiunge uno stato alla cronologia
  const pushToHistory = useCallback((specificState = null) => {
    const currentState = specificState || captureState();
    setHistory(prev => [...prev.slice(-49), currentState]);
  }, [captureState]);

  // Annulla l'ultima azione
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setLayers(last.layers);
    setBlocks(last.blocks);
    setCanvasProps(last.canvas);
    if (last.theme) {
      setEvent(prev => ({ ...prev, theme: last.theme }));
    }
    setHistory(prev => prev.slice(0, -1));
    setIsDirty(true);
  }, [history, setLayers, setBlocks, setCanvasProps, setEvent]);

  // --- GESTIONE BOZZE (LOCAL STORAGE) ---
  const loadDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { 
      console.error("Errore caricamento bozza:", e);
      return null; 
    }
  }, [DRAFT_KEY]);

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ blocks, layers, canvas: canvasProps, event, savedAt: Date.now() }));
    } catch (e) {
      console.error("Errore salvataggio bozza locale:", e);
    }
  }, [DRAFT_KEY, blocks, layers, canvasProps, event]);

  const clearDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) {
      console.error("Errore pulizia bozza:", e);
    }
  }, [DRAFT_KEY]);

  // Salva bozza locale ogni volta che cambia qualcosa
  useEffect(() => {
    if (!draftRestored || !isDirty) return;
    saveDraft();
  }, [blocks, layers, canvasProps, event, draftRestored, isDirty, saveDraft]);

  // --- SALVATAGGIO SERVER ---
  const saveToServer = useCallback(async () => {
    if (!event || slug === 'demo') {
      if (slug === 'demo') {
        setIsDirty(false);
        setLastSavedAt(Date.now());
      }
      return;
    }
    setAutoSaving(true);
    try {
      const res = await apiFetch(`/api/events/${slug}`, {
        method: "PUT",
        body: JSON.stringify({
          title: event.title, status: event.status, theme: event.theme,
          blocks, layers, canvas: canvasProps
        }),
      });
      if (!res.ok) throw new Error("Errore salvataggio evento");
      setIsDirty(false);
      setLastSavedAt(Date.now());
      clearDraft();
    } catch (err) {
      console.error("Errore salvataggio server:", err);
    } finally {
      setAutoSaving(false);
    }
  }, [slug, event, blocks, layers, canvasProps, clearDraft]);

  // Autosave a intervalli
  useEffect(() => {
    if (!draftRestored || !isDirty || autoSaving) return;
    const t = setTimeout(() => {
      saveToServer();
    }, 1500);
    return () => clearTimeout(t);
  }, [isDirty, autoSaving, draftRestored, saveToServer]);

  const handleSaveAndExit = useCallback(async () => {
    try {
      setAutoSaving(true);
      const res = await apiFetch(`/api/events/${slug}`, {
        method: "PUT",
        body: JSON.stringify({
          title: event.title, status: 'published', theme: event.theme,
          blocks, layers, canvas: canvasProps
        }),
      });
      if (!res.ok) throw new Error("Errore salvataggio finale");
      clearDraft();
      navigate('/dashboard');
    } catch (err) {
      console.error("Errore salvataggio finale:", err);
      alert("Errore durante il salvataggio finale.");
    } finally {
      setAutoSaving(false);
    }
  }, [slug, event, blocks, layers, canvasProps, clearDraft, navigate]);

  return {
    isDirty,
    setIsDirty,
    autoSaving,
    lastSavedAt,
    draftRestored,
    setDraftRestored,
    undo,
    pushToHistory,
    saveToServer,
    handleSaveAndExit,
    loadDraft,
    clearDraft,
    latestStateRef,
    history
  };
};
