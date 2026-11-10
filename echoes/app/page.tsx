'use client';
import { numberLocale, setLocale, syncDocumentLanguage, t } from '@/lib/i18n';
import { SceneryEvidence } from '@/components/scenery-evidence';
import { PlaceFactors } from '@/components/place-factors';
import { PlaceLocale } from '@/components/place-locale';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import photoCredits from '@/lib/photo-credits.json';
import { defaultSource, places, qualities } from '@/lib/places';
import { distanceKm } from '@/lib/discovery';
import { useDiscovery } from '@/lib/use-discovery';
import { Icon, type IconName } from '@/components/icons';
import { MapView } from '@/components/map-view';
import { Dialog } from '@/components/dialog';
import { PlaceImage } from '@/components/place-image';
import { PlaceDetail } from '@/components/place-detail';
import { FilterDisclosure, SearchFilters } from '@/components/search-filters';
import { activeFilterCount } from '@/lib/climate-types';
import { DestinationSearch } from '@/components/destination-search';
import { GlobeView } from '@/components/globe-view';
import { PhotoUpload } from '@/components/photo-upload';
import { TerrainExplorer } from '@/components/terrain-explorer';
import { CommonsCredit } from '@/components/commons-credit';
import { SourceSearch } from '@/components/source-search';
import { AccountControl, AccountPanel } from '@/components/account';
import { LanguageMenu } from '@/components/language-menu';
import { revealSection } from '@/lib/reveal-section';
const regionLabels: Record<string, string> = {
  world: '世界中',
  Asia: 'アジア',
  Europe: 'ヨーロッパ',
  Africa: 'アフリカ',
  'North America': '北アメリカ',
  'South America': '南アメリカ',
  Oceania: 'オセアニア',
};
// 結果の欄へ移動する。狭い画面では見出しへ、広い画面では結果の欄の先頭へ。
function revealResults() {
  const heading = document.getElementById('results-heading');
  if (!heading) return;
  const target =
    window.innerWidth < 900 ? heading : document.getElementById('discovery-area') || heading;
  revealSection(target, { focus: heading });
}
// 出発点を選ぶ欄へ戻る。地名の入力欄にはフォーカスしない（候補の一覧が開くため）。
function revealSearch() {
  revealSection(
    document.getElementById('search-methods') || document.getElementById('search-form'),
    { focus: null },
  );
}
export default function Home() {
  const app = useDiscovery();
  const [expanded, setExpanded] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const savedView = app.view === 'saved';
  const activePlace = app.displayed.find(p => p.id === app.activeId);
  // 検索を始めたら結果の場所へ移動する。スマートフォンでは結果が2画面以上下にあり、押しても何も起きないように見えるため。
  useEffect(() => syncDocumentLanguage(), [app.locale]);
  useEffect(() => {
    if (app.searchRevision) revealResults();
  }, [app.searchRevision]);
  // 画面の切り替えを伴うボタンは、描画が終わってから次の欄へ移動する。
  const [jump, setJump] = useState<{ to: 'results' | 'search'; n: number } | null>(null);
  const jumpTo = (to: 'results' | 'search') => setJump(j => ({ to, n: (j?.n || 0) + 1 }));
  useEffect(() => {
    if (jump?.to === 'results') revealResults();
    else if (jump?.to === 'search') revealSearch();
  }, [jump]);
  // 地形モードで出発点を更新したら、次に操作する地形の欄へ移動する。
  useEffect(() => {
    if (!app.sourceRevision) return;
    revealSection(document.getElementById('terrain-heading'));
  }, [app.sourceRevision]);
  useEffect(() => {
    if (app.error)
      document
        .getElementById('search-error')
        ?.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, [app.error]);
  const activeFilters = activeFilterCount(app.filters);
  // 絞り込み条件は「どんなところが好きですか？」の欄に、ふだんは閉じて置く。
  // 開いてから移動する。スマートフォンでは欄そのものも開く。
  const showFilters = () => {
    setExpanded(true);
    setFiltersOpen(true);
    requestAnimationFrame(() => {
      const first = document.querySelector<HTMLElement>('#search-filters select');
      first?.focus();
      first?.scrollIntoView({ block: 'center' });
    });
  };
  const selectResult = (id: string) => {
    app.setActiveId(id);
    if (window.innerWidth < 900)
      document
        .getElementById(`place-${id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const storageText =
    app.storageStatus === 'cloud'
      ? app.account
        ? t('Google アカウントに保存')
        : t('Firestore に保存')
      : app.storageStatus === 'connecting'
        ? t('保存先を接続中')
        : app.storageStatus === 'error'
          ? t('保存先の接続を確認してください')
          : t('このブラウザーに保存');
  // 言語の切り替えボタンは、切り替え先の言語で表示する。
  const languageButton = (
    <button
      className="text-button language-button"
      lang={app.locale === 'ja' ? 'en' : 'ja'}
      onClick={() => setLocale(app.locale === 'ja' ? 'en' : 'ja')}
    >
      {app.locale === 'ja' ? 'English' : '日本語'}
    </button>
  );
  return (
    // 言語を変えたら地図や地球儀の表示も作り直す。検索の状態は useDiscovery に残る。
    <Fragment key={app.locale}>
      <a href="#main" className="skip-link">
        {t('場所を探す画面へ移動')}
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label={t('Elsewhere のホーム')}>
            <span className="brand-symbol">
              <Icon name="Compass" size={28} weight="bold" />
            </span>
            elsewhere<span className="brand-period">.</span>
          </Link>
          <nav className="main-nav" aria-label={t('メインメニュー')}>
            <button
              className={`nav-item ${!savedView ? 'selected' : ''}`}
              aria-current={!savedView ? 'page' : undefined}
              onClick={() => app.setView('discover')}
            >
              <Icon name="GlobeHemisphereWest" size={18} />
              {t('見つける')}
            </button>
            <button
              className={`nav-item ${savedView ? 'selected' : ''}`}
              aria-current={savedView ? 'page' : undefined}
              onClick={() => {
                app.setView('saved');
                jumpTo('results');
              }}
            >
              <Icon name="BookmarkSimple" size={18} />
              {t('保存した場所')}
              {app.saved.length > 0 && <span className="nav-count">{app.saved.length}</span>}
            </button>
          </nav>
          <div className="header-end">
            <div className="header-actions">
              <button className="text-button how-button" onClick={() => app.setModal('how')}>
                <Icon name="Info" size={18} />
                {t('使い方')}
              </button>
              <button
                className="profile-mark"
                aria-label={storageText}
                title={storageText}
                onClick={() => app.setModal('privacy')}
              >
                <Icon name="Leaf" size={19} />
              </button>
            </div>
            <LanguageMenu locale={app.locale} />
            {(app.account || app.config?.googleSignIn) && (
              <AccountControl
                account={app.account}
                disabled={app.authBusy || app.storageStatus === 'connecting'}
                onSignIn={() => void app.signIn()}
                onOpen={() => app.setModal('account')}
              />
            )}
          </div>
        </div>
      </header>
      <main id="main" className="app-main">
        <section className="intro">
          <div>
            <h1>
              {savedView ? (
                <>
                  {t('次に行きたい場所を、')}
                  <br className="mobile-break" />
                  {t('少しずつ。')}
                </>
              ) : (
                <>
                  {t('好きな場所の、')}
                  <br className="mobile-break" />
                  {t('その先へ。')}
                </>
              )}
            </h1>
            <p>
              {savedView
                ? t('気になる場所を残して、次の散歩や旅のきっかけに。')
                : t('あの場所の好きなところを、まだ知らない街で見つけよう。')}
            </p>
          </div>
          <div className="intro-note">
            <span className="little-orbit">
              <Icon name="GlobeHemisphereWest" size={26} />
            </span>
            <span>
              {t('川辺の風景、木陰、街並み。')}
              <br />
              {t('好きな過ごし方から、行き先を探す。')}
            </span>
          </div>
        </section>
        {!savedView && app.liveAvailable && (
          <div
            id="search-methods"
            className="search-methods"
            role="group"
            aria-label={t('似た場所の探し方')}
          >
            {(
              [
                { id: 'atmosphere', label: t('雰囲気から'), icon: 'Wind' },
                { id: 'visual', label: t('写真の風景から'), icon: 'Image' },
                { id: 'terrain', label: t('地形から'), icon: 'Mountains' },
              ] as const
            ).map(m => (
              <button
                key={m.id}
                aria-pressed={app.searchKind === m.id}
                onClick={() => app.setSearchKind(m.id)}
              >
                <Icon name={m.icon as IconName} size={18} />
                {m.label}
              </button>
            ))}
          </div>
        )}
        {!savedView && app.searchKind === 'visual' && (
          <section className="visual-settings" aria-label={t('写真の比較条件')}>
            <div>
              <strong>
                {app.uploadFile ? t('選んだ写真から風景を比べます') : t('写真はアプリが探します')}
              </strong>
              <p>
                {app.config
                  ? t('登録済みの Commons 写真 {v0} 地点を比較します。', {
                      v0: app.config.photoCount,
                    })
                  : t('登録済みの Commons 写真を比較します。')}
                {app.config?.saveCosts
                  ? t('節約モードでは登録写真を優先します。')
                  : t('検索時に新しい候補の写真も探します。')}
              </p>
              <label className="fast-search-toggle">
                <input
                  type="checkbox"
                  checked={app.fastSearch}
                  onChange={e => app.setFastSearch(e.target.checked)}
                />
                <span>{t('高速検索')}</span>
              </label>
            </div>
            <details className="visual-weight-details">
              <summary>
                {t('比重を調整（写真 {v0}：特徴 {v1}）', {
                  v0: Math.round(app.visualWeight * 10),
                  v1: 10 - Math.round(app.visualWeight * 10),
                })}
              </summary>
              <label htmlFor="visual-weight">
                {t('写真の近さ {v0}：選んだ特徴 {v1}', {
                  v0: Math.round(app.visualWeight * 10),
                  v1: 10 - Math.round(app.visualWeight * 10),
                })}
                <input
                  id="visual-weight"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={app.visualWeight}
                  onChange={e => app.setVisualWeight(Number(e.target.value))}
                />
              </label>
            </details>
          </section>
        )}
        {!savedView && app.liveMode && app.searchKind === 'visual' && (
          <PhotoUpload
            file={app.uploadFile}
            candidateCount={app.config?.photoCount}
            findsNewCandidates={app.config?.saveCosts === false}
            confirmed={app.uploadRights}
            onFile={app.selectUpload}
            onConfirm={app.setUploadRights}
            // 写真と権利の確認がそろったら、次に押す検索ボタンを画面に入れる。
            onReady={() =>
              revealSection(document.getElementById('search-submit'), {
                focus: null,
                block: 'nearest',
              })
            }
          />
        )}
        {!savedView && (
          <form
            id="search-form"
            className={`search-form ${app.searchKind === 'terrain' ? 'terrain-search' : ''}`}
            onSubmit={e => {
              e.preventDefault();
              void app.search();
            }}
          >
            {app.uploadFile ? (
              <div className="upload-source-label">
                <Icon name="Image" size={24} />
                <div>
                  <strong>{t('アップロードした写真から比較')}</strong>
                  <p>{t('撮影場所は未指定です。候補の場所だけを地図に表示します。')}</p>
                </div>
              </div>
            ) : (
              <SourceSearch
                query={app.query}
                setQuery={app.setQuery}
                source={app.source}
                live={app.placesReady && app.liveMode}
                resolving={app.resolving}
                onChoose={app.chooseSource}
                onPrediction={app.choosePlaceId}
              />
            )}
            <DestinationSearch
              value={t(regionLabels[app.destination] || app.destination)}
              onChange={value => {
                const match = Object.entries(regionLabels).find(
                  ([, label]) => label === value || t(label) === value,
                );
                app.setDestination(match?.[0] || value);
              }}
            />
            <button
              id="search-submit"
              className="primary-button search-button"
              disabled={app.loading || app.resolving}
              type="submit"
            >
              {app.resolving
                ? t('出発点を確認中…')
                : app.loading
                  ? t('似た場所を探しています…')
                  : app.searchKind === 'terrain'
                    ? t('出発点を更新')
                    : t('似た場所を探す')}
              <Icon name="ArrowRight" size={20} />
            </button>
          </form>
        )}
        {!savedView && app.liveMode && app.searchKind === 'terrain' && (
          <FilterDisclosure
            searchKind={app.searchKind}
            value={app.filters}
            onChange={app.setFilters}
            sourceClimate={null}
            unknownSource={app.source.locationUnknown}
          />
        )}
        {app.error && (
          <div id="search-error" className="error-message" role="alert">
            <Icon name="Info" size={20} />
            <p>{t(app.error)}</p>
          </div>
        )}
        <div
          className={`workspace ${app.searchKind === 'terrain' && !savedView ? 'terrain-workspace' : ''}`}
        >
          <aside className="preferences-sidebar">
            <div className="source-heading">
              <span>{t('出発点にした場所')}</span>
              <Icon name="MapPin" size={17} />
            </div>
            <article className="source-card">
              <div className="source-photo">
                <PlaceImage place={app.source} />
                <span className="photo-caption">
                  <Icon name="MapPin" size={14} />
                  {app.source.city || t('地図で選んだ場所')}
                </span>
              </div>
              <div className="source-copy">
                <h2>{app.source.name}</h2>
                <p>{app.source.description}</p>
                {app.source.placeId && app.source.sources[0] && (
                  <a
                    className="source-map-link"
                    href={app.source.sources[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Maps
                    <Icon name="ArrowUpRight" size={12} />
                  </a>
                )}
                {!app.source.locationUnknown && (
                  <div className="source-coordinates">
                    {Math.abs(app.source.lat).toFixed(4)}°{' '}
                    {app.source.lat >= 0 ? t('北緯') : t('南緯')}
                    <span />
                    {Math.abs(app.source.lng).toFixed(4)}°{' '}
                    {app.source.lng >= 0 ? t('東経') : t('西経')}
                  </div>
                )}
              </div>
            </article>
            {app.source.commonsPhoto && (
              <div className="source-photo-credit">
                <CommonsCredit photo={app.source.commonsPhoto} />
              </div>
            )}
            <section className="preferences-section">
              <div className="preference-heading">
                <h2>{t('どんなところが好きですか？')}</h2>
                <Icon name="SlidersHorizontal" size={19} />
                <button
                  className="mobile-preferences-button"
                  aria-expanded={expanded}
                  aria-controls={
                    app.liveMode && !savedView ? 'qualities search-filters' : 'qualities'
                  }
                  onClick={() => setExpanded(x => !x)}
                >
                  {expanded ? t('閉じる') : t('変更')}
                </button>
              </div>
              <p>{t('次の場所でも大切にしたい特徴を選んでください。')}</p>
              <div className={`mobile-quality-summary ${expanded ? 'is-hidden' : ''}`}>
                {app.preferences.map(q => (
                  <span key={q}>{t(qualities.find(x => x.id === q)!.label)}</span>
                ))}
                {app.liveMode && !savedView && activeFilters > 0 && (
                  <span>{t('絞り込み {v0}件', { v0: activeFilters })}</span>
                )}
              </div>
              <div
                id="qualities"
                className={`quality-options ${expanded ? 'mobile-expanded' : 'mobile-collapsed'}`}
              >
                {qualities.map(q => (
                  <button
                    key={q.id}
                    className={`quality-button ${app.preferences.includes(q.id) ? 'quality-selected' : ''}`}
                    aria-pressed={app.preferences.includes(q.id)}
                    disabled={app.preferences.length === 1 && app.preferences.includes(q.id)}
                    title={
                      app.preferences.length === 1 && app.preferences.includes(q.id)
                        ? t('特徴は一つ以上選んでください。')
                        : t(q.description)
                    }
                    onClick={() => app.togglePreference(q.id)}
                  >
                    <Icon name={q.icon as IconName} size={21} />
                    <span>{t(q.label)}</span>
                    <span className="quality-check">
                      {app.preferences.includes(q.id) && (
                        <Icon name="Check" size={13} weight="bold" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
              <div className="preference-hint">
                <Icon name="Sparkle" size={16} />
                <span>
                  {app.results.length
                    ? app.searchKind === 'visual'
                      ? t('特徴を変えたら、もう一度検索してください。')
                      : t('特徴を変えると、候補の並び順も変わります。')
                    : t('好きな特徴を選んで、検索してみてください。')}
                </span>
              </div>
              {!savedView && app.liveMode && (
                <details
                  id="search-filters"
                  className={`preference-filters ${expanded ? 'mobile-expanded' : 'mobile-collapsed'}`}
                  open={filtersOpen}
                  onToggle={e => setFiltersOpen(e.currentTarget.open)}
                >
                  <summary className="preference-filters-heading">
                    <h3>{t('条件で絞り込む')}</h3>
                    {activeFilters > 0 && (
                      <span className="filter-count">
                        {t('{v0}件選択中', { v0: activeFilters })}
                      </span>
                    )}
                    <Icon name="CaretDown" size={16} />
                  </summary>
                  <SearchFilters
                    searchKind={app.searchKind}
                    value={app.filters}
                    onChange={app.setFilters}
                    sourceClimate={app.sourceClimate}
                    unknownSource={app.source.locationUnknown}
                  />
                </details>
              )}
            </section>
            <div className="storage-note">
              <Icon name={app.storageStatus === 'cloud' ? 'Check' : 'BookmarkSimple'} size={16} />
              <span>{storageText}</span>
            </div>
            <div className="sidebar-note">
              <Icon name="Compass" size={24} />
              <p>
                {t('似ているところも、違うところも。')}
                <br />
                {t('その街らしさを楽しむきっかけに。')}
              </p>
            </div>
          </aside>
          {app.searchKind === 'terrain' && !savedView ? (
            <TerrainExplorer
              key={`${app.source.id}-${app.source.lat}-${app.source.lng}`}
              source={app.source}
              mapsKey={app.mapsKey}
              filters={app.filters}
              destination={app.destination}
              onPickLocation={p => void app.chooseLocation(p)}
              onPickPlace={id => void app.choosePlaceId(id)}
            />
          ) : (
            <section
              id="discovery-area"
              className="discovery-area"
              aria-label={savedView ? t('保存した場所の一覧') : t('似た場所の候補')}
            >
              <div className="results-toolbar">
                <div className="result-context">
                  <span className="status-dot" />
                  {app.searchKind === 'visual' && app.liveMode
                    ? app.uploadFile
                      ? t('選んだ写真と Commons の写真を比較')
                      : t('Commons の写真から比較')
                    : app.liveMode
                      ? t('Google Maps の情報から検索')
                      : t('使い方を試せるサンプル')}
                  <button
                    className="tiny-info"
                    aria-label={t('検索結果について')}
                    onClick={() => app.setModal('how')}
                  >
                    <Icon name="Info" size={16} />
                  </button>
                </div>
                <div className="view-switch" aria-label={t('結果の表示方法')}>
                  <button
                    aria-pressed={app.layout === 'globe' && Boolean(app.mapsKey)}
                    disabled={!app.mapsKey}
                    onClick={() => app.setLayout('globe')}
                  >
                    <Icon name="GlobeHemisphereWest" size={16} />
                    {t('地球儀')}
                  </button>
                  <button
                    aria-pressed={app.layout === 'map' || (app.layout === 'globe' && !app.mapsKey)}
                    onClick={() => app.setLayout('map')}
                  >
                    <Icon name="MapTrifold" size={16} />
                    {t('地図')}
                  </button>
                  <button
                    aria-pressed={app.layout === 'list'}
                    onClick={() => app.setLayout('list')}
                  >
                    <Icon name="ListBullets" size={16} />
                    {t('一覧')}
                  </button>
                </div>
              </div>
              {app.layout === 'globe' && app.mapsKey && (
                <GlobeView
                  source={app.source}
                  places={app.displayed}
                  activeId={app.activeId}
                  onSelect={selectResult}
                  mapsKey={app.mapsKey}
                />
              )}
              {(app.layout === 'map' || (app.layout === 'globe' && !app.mapsKey)) && (
                <MapView
                  source={app.source}
                  places={app.displayed}
                  activeId={app.activeId}
                  onSelect={selectResult}
                  mapsKey={app.mapsKey}
                  live={app.liveMode}
                  busy={app.resolving}
                  onPickLocation={app.placesReady ? p => void app.chooseLocation(p) : undefined}
                  onPickPlace={app.placesReady ? id => void app.choosePlaceId(id) : undefined}
                />
              )}
              {activePlace && (
                <div className="map-selection">
                  <span>
                    <Icon name="MapPin" size={16} />
                    {activePlace.name}
                  </span>
                  <button
                    className="text-button"
                    onClick={() => {
                      app.setRoute(null);
                      app.setDetail(activePlace);
                    }}
                  >
                    {t('この場所を詳しく')}
                    <Icon name="ArrowUpRight" size={15} />
                  </button>
                </div>
              )}
              {app.sharedResults && (
                <div className="visual-summary" role="status">
                  <strong>{t('共有された検索結果です')}</strong>
                  <p>
                    {t(
                      '共有した人の写真検索の結果を表示しています。写真で比べた理由を見るには、「似た場所を探す」でもう一度検索してください。同じ条件の結果が残っていれば、すぐに表示されます。',
                    )}
                  </p>
                </div>
              )}
              {app.visualSearch && (
                <div
                  className={`visual-summary ${app.visualSearch.mode === 'fallback' ? 'is-fallback' : ''}`}
                  role="status"
                >
                  <strong>
                    {app.visualSearch.mode === 'visual'
                      ? t('写真の近さを順位に反映しています')
                      : t('今回は、場所の特徴から比較しています')}
                  </strong>
                  <p>
                    {app.visualSearch.reason ||
                      t('写真 {v0} 地点を比較。写真の近さ {v1}：選んだ特徴 {v2}。', {
                        v0: app.visualSearch.comparedCount,
                        v1: Math.round(app.visualSearch.visualWeight * 10),
                        v2: 10 - Math.round(app.visualSearch.visualWeight * 10),
                      })}
                  </p>
                  {typeof app.visualSearch.discoveredComparedCount === 'number' && (
                    <p>
                      {t('新しく見つけた {v0} 地点のうち、写真を比較できたのは {v1} 地点です。', {
                        v0: app.visualSearch.discoveredCount || 0,
                        v1: app.visualSearch.discoveredComparedCount,
                      })}
                    </p>
                  )}
                  {app.visualSearch.discoveryNote && <p>{app.visualSearch.discoveryNote}</p>}
                  <p>
                    {app.visualSearch.scope} {t('似ている度合いは、実測の一致率ではありません。')}
                  </p>
                  {app.visualSearch.cached && (
                    <p>{t('24時間以内の同じ条件の検索結果を再利用しました。')}</p>
                  )}
                  {typeof app.visualSearch.rerankedCount === 'number' && (
                    <p>
                      {t('写真の地形や構図を {v0} 候補で見比べています。', {
                        v0: app.visualSearch.rerankedCount,
                      })}
                      {app.visualSearch.visionCompared
                        ? t('被写体の補助情報も {v0} 候補に使用しました。', {
                            v0: app.visualSearch.visionCompared,
                          })
                        : t(
                            '被写体の補助情報が不足する場合は、埋め込みと写真の見比べで比較します。',
                          )}
                    </p>
                  )}
                  {app.visualSearch.catalog && (
                    <small>
                      {app.visualSearch.catalog === 'bigquery'
                        ? t('登録候補は BigQuery から取得')
                        : t('登録候補はローカルから取得')}
                    </small>
                  )}
                </div>
              )}
              <div id="results-heading" tabIndex={-1} className="results-heading">
                <div>
                  <h2>{savedView ? t('気になっている場所') : t('あの場所に通じる、別の場所')}</h2>
                  <p>
                    {savedView
                      ? t('{v0} 件の場所を保存しています。', { v0: app.saved.length })
                      : app.loading
                        ? app.searchKind === 'visual'
                          ? t('Commons の写真を比べ、共通点と違いを調べています。')
                          : t('Google Maps を参照して、共通点と違いを調べています。')
                        : t('共通する特徴と、その場所ならではの違いを比べてみてください。')}
                  </p>
                </div>
                <button
                  className="share-button"
                  aria-label={t('検索のリンクをコピー')}
                  onClick={() => void app.share()}
                >
                  <Icon name="ShareNetwork" size={18} />
                  <span>{t('検索を共有')}</span>
                </button>
              </div>
              {app.shareUrl && (
                <div className="share-link-panel">
                  <label htmlFor="share-url">{t('この検索の共有リンク')}</label>
                  <input
                    id="share-url"
                    readOnly
                    value={app.shareUrl}
                    onFocus={e => e.target.select()}
                  />
                  <a href={app.shareUrl} target="_blank" rel="noopener noreferrer">
                    {t('この検索を開く')}
                    <Icon name="ArrowUpRight" size={14} />
                  </a>
                </div>
              )}
              {app.loading ? (
                <>
                  <div className="search-progress" role="status">
                    <span>{t('場所を調べています。少し時間がかかることがあります。')}</span>
                    <button className="text-button" onClick={app.cancelSearch}>
                      {t('検索を中止')}
                    </button>
                  </div>
                  <div className="result-grid" aria-label={t('検索中')}>
                    {[1, 2, 3].map(n => (
                      <div key={n} className="result-skeleton">
                        <div />
                        <span />
                        <span />
                        <span />
                      </div>
                    ))}
                  </div>
                </>
              ) : app.displayed.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">
                    <Icon name={savedView ? 'BookmarkSimple' : 'Compass'} size={36} />
                  </span>
                  <h3>
                    {savedView
                      ? t('気になる場所を、ここに。')
                      : app.visualSearch
                        ? t('条件に合う写真の候補がありません。')
                        : app.liveMode
                          ? t('まずは、好きな場所から。')
                          : t('探す範囲を広げてみませんか。')}
                  </h3>
                  <p>
                    {savedView
                      ? t('候補のしおりを押すと、あとで見返せます。')
                      : app.visualSearch
                        ? app.visualSearch.reason ||
                          t(
                            '比較した候補の中に、条件に合う写真がありません。気候や国の条件を見直してみてください。',
                          )
                        : app.liveMode
                          ? t(
                              '出発点と残したい特徴を選び、「似た場所を探す」を押してください。地図から出発点を選ぶこともできます。',
                            )
                          : t(
                              'この地域には、ほかのサンプルがありません。世界中から探すか、別の街を選んでみてください。',
                            )}
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => {
                      app.setView('discover');
                      if (savedView) {
                        jumpTo('search');
                        return;
                      }
                      if (app.visualSearch) {
                        showFilters();
                        return;
                      }
                      if (app.liveMode) void app.search();
                      else app.setDestination('world');
                    }}
                  >
                    {savedView
                      ? t('場所を探す')
                      : app.visualSearch
                        ? t('絞り込み条件を確認')
                        : app.liveMode
                          ? t('似た場所を探す')
                          : t('世界中から探す')}
                    <Icon name="ArrowRight" size={18} />
                  </button>
                </div>
              ) : (
                <div className={`result-grid ${app.layout === 'list' ? 'list-layout' : ''}`}>
                  {app.displayed.map((p, index) => {
                    const shared = app.preferences.filter(
                      q => app.source.features[q] >= 3 && p.features[q] >= 3,
                    );
                    const open = () => {
                      app.setActiveId(p.id);
                      app.setRoute(null);
                      app.setDetail(p);
                    };
                    return (
                      <article
                        id={`place-${p.id}`}
                        className={`result-card ${app.activeId === p.id ? 'card-active' : ''}`}
                        key={p.id}
                      >
                        <div className="result-photo">
                          <button
                            className="photo-action"
                            aria-label={t('{v0}を詳しく見る', { v0: p.name })}
                            onClick={open}
                          >
                            <PlaceImage place={p} attribution={false} />
                          </button>
                          {p.photoAuthors?.length ? (
                            <div className="image-attribution">
                              {p.photoAuthors.map(a => (
                                <a
                                  key={a.url}
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {a.name}
                                </a>
                              ))}
                            </div>
                          ) : null}
                          <span className="result-number">{index + 1}</span>
                          <button
                            className={`save-button ${app.isSaved(p) ? 'is-saved' : ''}`}
                            aria-label={
                              app.isSaved(p)
                                ? t('{v0}の保存を取り消す', { v0: p.name })
                                : t('{v0}を保存する', { v0: p.name })
                            }
                            aria-pressed={app.isSaved(p)}
                            disabled={app.savingIds.includes(p.id)}
                            onClick={() => void app.toggleSaved(p)}
                          >
                            <Icon
                              name="BookmarkSimple"
                              size={19}
                              weight={app.isSaved(p) ? 'fill' : 'regular'}
                            />
                          </button>
                          {!app.source.locationUnknown && (
                            <span className="distance-label">
                              {t('出発点から約 {v0} km', {
                                v0: distanceKm(app.source, p).toLocaleString(numberLocale()),
                              })}
                            </span>
                          )}
                        </div>
                        <div className="result-copy">
                          <p className="result-location">
                            <Icon name="MapPin" size={13} />
                            {[p.city, p.country].filter(Boolean).join(t('・'))}
                          </p>
                          <h3>
                            <button onClick={open}>
                              {p.name}
                              <Icon name="ArrowUpRight" size={16} />
                            </button>
                          </h3>
                          <PlaceLocale place={p} />
                          <div className="environment-tags">
                            {p.climate && (
                              <span title={t('{v0}年の気候区分', { v0: p.climate.period })}>
                                {p.climate.code} · {p.climate.label}
                              </span>
                            )}
                            {app.filters.lessVisited && p.tourism && (
                              <span>
                                {t('国際観光客 約{man}万人（{year}年）', {
                                  man: (p.tourism.arrivals / 10000).toLocaleString('ja-JP', {
                                    maximumFractionDigits: 1,
                                  }),
                                  millions: (p.tourism.arrivals / 1000000).toLocaleString('en-US', {
                                    maximumFractionDigits: 2,
                                  }),
                                  year: p.tourism.year,
                                })}
                              </span>
                            )}
                          </div>
                          <SceneryEvidence place={p} compact />
                          <PlaceFactors place={p} compact />
                          <p className="result-description">
                            {p.visual?.observations[0] || p.description}
                          </p>
                          {p.visual && (
                            <span className="visual-ranking-label">
                              {t('写真の比較を含む順位')}
                            </span>
                          )}
                          {p.placeId && p.sources[0] && (
                            <div className="card-sources">
                              <span>Google Maps</span>
                              <a href={p.sources[0].url} target="_blank" rel="noopener noreferrer">
                                {p.sources[0].title}
                                <Icon name="ArrowUpRight" size={12} />
                              </a>
                              {p.sources.length > 1 && (
                                <button onClick={open}>
                                  {t('ほか {v0} 件', { v0: p.sources.length - 1 })}
                                </button>
                              )}
                            </div>
                          )}
                          <div className="match-qualities">
                            {shared.slice(0, 2).map(q => {
                              const v = qualities.find(i => i.id === q)!;
                              return (
                                <span key={q}>
                                  <Icon name={v.icon as IconName} size={14} />
                                  {t(v.label)}
                                </span>
                              );
                            })}
                            {shared.length > 2 && (
                              <span
                                className="more-quality"
                                title={shared
                                  .slice(2)
                                  .map(q => t(qualities.find(x => x.id === q)!.label))
                                  .join('、')}
                              >
                                ＋{shared.length - 2}
                              </span>
                            )}
                          </div>
                          <div className="card-bottom">
                            <span>
                              <span className="match-dot" />
                              {app.source.locationUnknown
                                ? t('選んだ特徴を考慮')
                                : p.profiled === false
                                  ? t('風景の比較候補')
                                  : t('共通する特徴 {v0} 件', { v0: shared.length })}
                            </span>
                            <button className="text-button" onClick={open}>
                              {p.profiled === false ? t('詳しく見る') : t('共通点と違い')}
                              <Icon name="ArrowRight" size={14} />
                            </button>
                          </div>
                          {p.commonsPhoto && <CommonsCredit photo={p.commonsPhoto} />}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              <div className="results-footnote">
                <Icon name={app.liveMode ? 'Sparkle' : 'Leaf'} size={16} />
                <span>
                  {app.liveMode
                    ? t('雰囲気や共通点は AI の解釈です。静かさや混雑は、訪れる時期で変わります。')
                    : t(
                        'サンプルの比較は紹介用のものです。現地の混雑や天候を示す情報ではありません。',
                      )}
                </span>
              </div>
              {app.liveAvailable && (
                <label className="live-switch">
                  <input
                    type="checkbox"
                    checked={app.liveMode}
                    onChange={e => {
                      app.setLiveMode(e.target.checked);
                      app.chooseSource(defaultSource);
                    }}
                  />
                  <span>{t('Google Maps と Gemini で検索する')}</span>
                </label>
              )}
            </section>
          )}
        </div>
        <footer className="site-footer">
          <span className="footer-brand">
            <Icon name="Compass" size={18} />
            {t('好きな過ごし方から、次の行き先へ。')}
          </span>
          <div>
            <button onClick={() => app.setModal('how')}>{t('使い方')}</button>
            <button onClick={() => app.setModal('credits')}>{t('写真の出典')}</button>
            <button onClick={() => app.setModal('privacy')}>{t('プライバシー')}</button>
            <button onClick={() => app.setModal('terms')}>{t('利用について')}</button>
            {languageButton}
          </div>
        </footer>
      </main>
      {app.toast && (
        <div className="toast" role="status">
          <span>
            <Icon name="Check" size={16} />
          </span>
          {t(app.toast)}
        </div>
      )}
      {app.detail && (
        <PlaceDetail
          place={app.detail}
          source={app.source}
          preferences={app.preferences}
          searchKind={app.searchKind}
          feedbackSharing={app.feedbackSharing}
          saved={app.isSaved(app.detail)}
          saving={app.savingIds.includes(app.detail.id)}
          onSave={() => void app.toggleSaved(app.detail!)}
          onClose={() => app.setDetail(null)}
          route={app.route}
          onRoute={() => void app.getRoute(app.detail!)}
        />
      )}
      {app.modal === 'account' && app.account && (
        <Dialog title={t('アカウント')} onClose={() => app.setModal(null)}>
          <AccountPanel
            account={app.account}
            busy={app.authBusy}
            onSignOut={() => void app.signOutAccount()}
          />
        </Dialog>
      )}
      {app.modal && app.modal !== 'account' && (
        <Dialog
          title={
            {
              how: t('使い方'),
              privacy: t('プライバシー'),
              credits: t('写真の出典'),
              terms: t('利用について'),
            }[app.modal]
          }
          onClose={() => app.setModal(null)}
        >
          <div className="info-content">
            <span className="info-symbol">
              <Icon name={app.modal === 'how' ? 'Compass' : 'Info'} size={32} />
            </span>
            {app.modal === 'how' ? (
              <>
                <h2>
                  {t('好きな場所を、')}
                  <br />
                  {t('次の旅の手がかりに。')}
                </h2>
                <p>
                  {t(
                    'Elsewhere は、好きな場所の雰囲気や過ごし方から、別の行き先を探すアプリです。',
                  )}
                </p>
                <ol className="how-steps">
                  <li>
                    <span>1</span>
                    <div>
                      <h3>{t('出発点を選ぶ')}</h3>
                      <p>{t('地名を入力するか、地図の気になる地点を押してください。')}</p>
                    </div>
                  </li>
                  <li>
                    <span>2</span>
                    <div>
                      <h3>{t('好きなところを選ぶ')}</h3>
                      <p>{t('水辺、緑、カフェなど、次の場所でも大切にしたい特徴を選びます。')}</p>
                    </div>
                  </li>
                  <li>
                    <span>3</span>
                    <div>
                      <h3>{t('共通点と違いを比べる')}</h3>
                      <p>
                        {t(
                          '検索結果から、似ている理由と違いを確認できます。気になる場所は保存しておきましょう。',
                        )}
                      </p>
                    </div>
                  </li>
                </ol>
                <div className="collection-note">
                  <Icon name="Leaf" size={22} />
                  <div>
                    <strong>{t('場所の情報と AI の解釈を分けて表示します')}</strong>
                    <p>
                      {t(
                        'Google Maps で確認できる場所を候補にし、Gemini が共通点と違いを整理します。類似率の実測値や、現在の混雑を表すものではありません。サンプルでは {v0} 件の紹介用データを使います。',
                        { v0: places.length },
                      )}
                    </p>
                  </div>
                </div>
                <button
                  className="primary-button"
                  onClick={() => {
                    app.setModal(null);
                    jumpTo('search');
                  }}
                >
                  {t('場所を探す')}
                  <Icon name="ArrowRight" size={18} />
                </button>
              </>
            ) : app.modal === 'privacy' ? (
              <>
                <h2>
                  {t('保存するもの、')}
                  <br />
                  {t('使う情報。')}
                </h2>
                <p>
                  {t(
                    '保存した場所は、場所の ID と保存日時を Firestore に記録します。検索条件も、このブラウザーにひもづく匿名のユーザー ID で保存します。Google Maps の写真や説明を、保存用のデータベースに複製しません。',
                  )}
                </p>
                <p>
                  {t(
                    'Google でログインすると、名前、メールアドレス、プロフィール画像を受け取り、この画面の表示に使います。保存した場所と検索条件は Google アカウントにひもづき、別の端末でも使えます。ログアウトすると、このブラウザーの保存情報は消去します。',
                  )}
                </p>
                <p>
                  {t(
                    '検索時は、選んだ出発点、地域、特徴を Google のサービスに送ります。共有リンクには、出発点の ID と検索条件を記録します。',
                  )}
                </p>
                <p>
                  {t(
                    '「現在地から調べる」を押したときだけ位置情報の許可を求め、取得した位置を Google の経路検索に送ります。現在地は保存しません。',
                  )}
                </p>
                <p>
                  {t(
                    '写真の比較では、利用条件を確認した Commons の写真だけを Google の画像解析に送ります。埋め込みと写真の出典をサーバーに保存して再利用します。Google Maps の写真から埋め込みを作ることはありません。',
                  )}
                </p>
                <p>
                  {t(
                    'アップロード写真は位置情報などを除去して Google の解析へ送ります。元の画像と、その画像の埋め込みはサーバーや Firestore に保存せず、共有リンクにも含めません。',
                  )}
                </p>
                <p>
                  {t(
                    '候補の評価は、このブラウザーに保存します。「評価を匿名で送って、検索の改善に使う」を選んだときだけ、場所の ID、選んだ特徴、評価、検索方法、送信日時を Firestore に記録します。アカウントの ID や写真は含めません。住所を出発点にした評価と、撮影場所が不明な写真からの評価は送りません。選択を外すと、このブラウザーに記録が残っている評価を Firestore からも削除します。',
                  )}
                </p>
                <p>
                  {t(
                    '広告やアクセス解析のコードは入れていません。サンプルで Google Maps が未設定の場合に限り、OpenStreetMap の地図を表示します。',
                  )}
                </p>
                <button className="secondary-button" onClick={() => app.setModal(null)}>
                  {t('場所を探す画面に戻る')}
                </button>
              </>
            ) : app.modal === 'credits' ? (
              <>
                <h2>{t('写真の出典')}</h2>
                <p>
                  {t(
                    '写真から比較した結果には Commons の出典、撮影者、ライセンスを表示します。雰囲気から探した結果の写真は Google Places から取得し、撮影者のリンクを表示しています。サンプルの写真は Wikimedia Commons のものを、表示に合わせてトリミングしています。',
                  )}
                </p>
                <ul className="photo-credit-list">
                  {Object.entries(photoCredits).map(([id, c]) => (
                    <li key={id}>
                      <strong>
                        {places.find(p => p.image === `/images/${id}.jpg`)?.name || id}
                      </strong>
                      <a
                        href={
                          c.creditUrl ||
                          places.find(p => p.image === `/images/${id}.jpg`)?.imagePage
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {c.author || t('元の写真を確認する')}
                        <Icon name="ArrowUpRight" size={12} />
                      </a>
                      {c.licenseUrl && (
                        <a href={c.licenseUrl} target="_blank" rel="noopener noreferrer">
                          {c.license}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h2>
                  {t('訪ねる前に、')}
                  <br />
                  {t('もう一度確認を。')}
                </h2>
                <p>
                  {t(
                    'このアプリは、次に行く場所を考えるための試作版です。場所の雰囲気や似ている理由には、AI による解釈が含まれます。',
                  )}
                </p>
                <p>
                  {t(
                    '現地の混雑、天候、立ち入りの条件は変わります。訪ねる前に、公式の案内や Google Maps で最新の情報を確認してください。',
                  )}
                </p>
                <p>
                  {t('写真や地図、参照元の情報には、それぞれの提供元の利用条件が適用されます。')}
                </p>
                <button className="secondary-button" onClick={() => app.setModal(null)}>
                  {t('場所を探す画面に戻る')}
                </button>
              </>
            )}
          </div>
        </Dialog>
      )}
    </Fragment>
  );
}
