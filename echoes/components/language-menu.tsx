'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { setLocale, t, type Locale } from '@/lib/i18n';
import { Icon } from '@/components/icons';

// 言語名は、その言語そのもので表示する。
const languages: { locale: Locale; label: string; code: string }[] = [
  { locale: 'ja', label: '日本語', code: 'JA' },
  { locale: 'en', label: 'English', code: 'EN' },
];

// 言語を変えると画面全体が作り直されるので、切り替えたあとにボタンへフォーカスを戻す。
let refocusPending = false;
const switchLocale = (next: Locale) => {
  refocusPending = true;
  setLocale(next);
};
const takeRefocus = () => {
  const pending = refocusPending;
  refocusPending = false;
  return pending;
};

/** ヘッダー右上の言語メニュー。 */
export function LanguageMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const current = languages.find(language => language.locale === locale) ?? languages[0];

  useEffect(() => {
    if (takeRefocus()) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const choose = (next: Locale) => {
    if (next === locale) return close();
    setOpen(false);
    switchLocale(next);
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
    );
    const index = items.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => {
      event.preventDefault();
      items[(to + items.length) % items.length]?.focus();
    };
    if (event.key === 'ArrowDown') move(index + 1);
    else if (event.key === 'ArrowUp') move(index - 1);
    else if (event.key === 'Home') move(0);
    else if (event.key === 'End') move(items.length - 1);
    else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') setOpen(false);
  };

  return (
    <div className="language-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="language-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t('表示言語: {name}', { name: current.label })}
        title={t('表示言語: {name}', { name: current.label })}
        onClick={() => setOpen(value => !value)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Icon name="Translate" size={19} />
        <span className="language-trigger-code" aria-hidden="true">
          {current.code}
        </span>
        <Icon name="CaretDown" size={14} weight="bold" className="language-trigger-caret" />
      </button>
      {open && (
        <div
          id={menuId}
          className="language-options"
          role="menu"
          aria-label={t('表示言語')}
          onKeyDown={onMenuKeyDown}
        >
          {languages.map(language => (
            <button
              key={language.locale}
              type="button"
              role="menuitemradio"
              aria-checked={language.locale === locale}
              className="language-option"
              lang={language.locale}
              tabIndex={-1}
              onClick={() => choose(language.locale)}
            >
              {language.label}
              {language.locale === locale && <Icon name="Check" size={16} weight="bold" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
