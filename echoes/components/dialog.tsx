"use client";
import { useEffect, useRef } from "react";
import { Icon } from "./icons";
export function Dialog({ children, title, onClose, wide = false }: {children: React.ReactNode; title:string; onClose:()=>void; wide?:boolean}) {
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog=ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return <dialog ref={ref} className={`dialog ${wide ? "dialog-wide" : ""}`} aria-label={title} onCancel={onClose} onClick={e => { if(e.target===ref.current) { const r=ref.current.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom) onClose(); } }}><button className="icon-button dialog-close" aria-label="閉じる" onClick={onClose}><Icon name="X" /></button>{children}</dialog>;
}
