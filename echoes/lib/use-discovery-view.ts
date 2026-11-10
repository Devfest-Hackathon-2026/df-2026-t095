'use client';
import { useState } from 'react';
import type { Place } from './places';

type Modal = 'how' | 'privacy' | 'terms' | 'credits' | 'account';

/** 表示の切り替えだけを扱う状態。 */
export function useDiscoveryView() {
  const [view, setView] = useState<'discover' | 'saved'>('discover');
  const [layout, setLayout] = useState<'map' | 'list' | 'globe'>('globe');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Place | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  return {
    view,
    setView,
    layout,
    setLayout,
    activeId,
    setActiveId,
    detail,
    setDetail,
    modal,
    setModal,
  };
}
