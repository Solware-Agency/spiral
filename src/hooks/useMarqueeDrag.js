import { useCallback, useMemo, useRef, useState } from 'react';

const DRAG_START_PX = 10;
const BLOCK_CLICK_AFTER_DRAG_MS = 450;

export default function useMarqueeDrag() {
  const contentRef = useRef(null);
  const cycleWidthRef = useRef(null);

  const [dragX, setDragX] = useState(0);
  const dragXRef = useRef(0);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  const isPointerDownRef = useRef(false);
  const pointerIdRef = useRef(null);
  const captureElRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0, offset: 0 });
  const didDragRef = useRef(false);
  const lastDragAtRef = useRef(-Infinity);
  const rafRef = useRef(0);

  const updateCycleWidth = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const sw = el.scrollWidth || 0;
    // Our markup duplicates the group twice, so half is one full cycle.
    const cycle = sw > 0 ? sw / 2 : 0;
    if (Number.isFinite(cycle) && cycle > 0) cycleWidthRef.current = cycle;
  }, []);

  const commit = useCallback((nextX) => {
    if (cycleWidthRef.current == null) updateCycleWidth();
    const cycle = cycleWidthRef.current;
    let clamped = nextX;
    if (Number.isFinite(cycle) && cycle > 0) {
      const min = -cycle;
      if (clamped < min) clamped = min;
      if (clamped > 0) clamped = 0;
    }

    dragXRef.current = clamped;
    if (rafRef.current) return;
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      setDragX(dragXRef.current);
    });
  }, [updateCycleWidth]);

  const onPointerDown = useCallback((e) => {
    if (e.button != null && e.button !== 0) return;
    isPointerDownRef.current = true;
    isDraggingRef.current = false;
    setIsDragging(false);
    didDragRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY, offset: dragXRef.current };
    pointerIdRef.current = e.pointerId;
    captureElRef.current = e.currentTarget ?? null;
    updateCycleWidth();
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (!isPointerDownRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;

      if (!didDragRef.current) {
        if (Math.abs(dx) >= DRAG_START_PX) {
          didDragRef.current = true;
          isDraggingRef.current = true;
          setIsDragging(true);
          // Only capture once we know it's a drag (so normal clicks still work).
          const el = captureElRef.current;
          const pid = pointerIdRef.current;
          if (el?.setPointerCapture && pid != null) {
            try {
              el.setPointerCapture(pid);
            } catch {
              // ignore
            }
          }
        }
        else if (Math.abs(dy) > Math.abs(dx)) return;
      }

      if (!didDragRef.current) return;
      e.preventDefault();
      commit(startRef.current.offset + dx);
    },
    [commit]
  );

  const endDrag = useCallback((e) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    if (isDraggingRef.current) {
      lastDragAtRef.current = performance.now();
    }
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      const el = captureElRef.current ?? e.currentTarget;
      const pid = pointerIdRef.current ?? e.pointerId;
      el?.releasePointerCapture?.(pid);
    } catch {
      // ignore
    }
    pointerIdRef.current = null;
    captureElRef.current = null;
  }, []);

  const onClickCapture = useCallback((e) => {
    const now = performance.now();
    if (now - lastDragAtRef.current > BLOCK_CLICK_AFTER_DRAG_MS) return;
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const bind = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
    }),
    [endDrag, onClickCapture, onPointerDown, onPointerMove]
  );

  const dragStyle = useMemo(() => ({ '--marquee-drag-x': `${dragX}px` }), [dragX]);

  return { bind, dragStyle, isDragging, contentRef };
}

