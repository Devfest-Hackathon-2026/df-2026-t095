// ボタンを押したあと、次に見る・操作する欄まで画面を動かす。
// フォーカスも移す場合は、移動先に tabIndex={-1} を付け、読み上げ環境でも移動先から読めるようにする。
// 入力の途中（チェックボックスなど）では focus: null にして、フォーカスは動かさない。
export function revealSection(
  target: Element | null | undefined,
  {
    focus = target instanceof HTMLElement ? target : null,
    block = 'start',
  }: { focus?: HTMLElement | null; block?: ScrollLogicalPosition } = {},
) {
  if (!target) return;
  // 先にフォーカスを移す。Chrome では、なめらかなスクロールの途中で focus() を呼ぶとスクロールが止まる。
  focus?.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block,
  });
}
