import type { Quality } from './places';

/**
 * 以前は、利用者が触っていなくても既定の特徴をこの並びのまま自動保存していた。
 * 既定値を変えても古い値が優先されないよう、この並びは「選ばれていない」として扱う。
 */
const autoSavedDefaults: readonly Quality[] = ['water', 'green', 'quiet'];

/** 保存するときはアルファベット順にそろえ、利用者の選択が自動保存の並びと重ならないようにする。 */
export const preferencesToStore = (preferences: Quality[]): Quality[] => [...preferences].sort();

/** 保存されていた特徴のうち、利用者が選んだものだけを返す。自動保存の旧既定値なら空にする。 */
export const chosenPreferences = (preferences: Quality[]): Quality[] =>
  preferences.join() === autoSavedDefaults.join() ? [] : preferences;
