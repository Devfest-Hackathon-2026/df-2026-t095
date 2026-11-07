"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { defaultPreferences, places, type Place, type Quality } from "./places";
import { diverseResults, isQuality, rankPlaces } from "./discovery";

export function useDiscovery() {
  const [source, setSource] = useState<Place>(places[0]);
  const [query, setQuery] = useState(places[0].name);
  const [preferences, setPreferences] = useState<Quality[]>(defaultPreferences);
  const [destination, setDestination] = useState("world");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedLive, setSavedLive] = useState<Place[]>([]);
  const [view, setView] = useState<"discover" | "saved">("discover");
  const [layout, setLayout] = useState<"map" | "list">("map");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modal, setModal] = useState<"how" | "privacy" | "terms" | "credits" | null>(null);
  const [detail, setDetail] = useState<Place | null>(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapsKey, setMapsKey] = useState("");
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [livePlaces, setLivePlaces] = useState<Place[]>([]);
  const [livePreferences, setLivePreferences] = useState<Quality[]>(defaultPreferences);
  const hydrated = useRef(false);
  const request = useRef<AbortController | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = places.find(p => p.id === params.get("source"));
    if (p) { setSource(p); setQuery(p.name); }
    const prefs = params.get("qualities")?.split(",").filter(isQuality);
    if (prefs?.length) setPreferences([...new Set(prefs)]);
    const dest = params.get("destination");
    if (dest && (dest === "world" || places.some(p => p.city === dest || p.continent === dest))) setDestination(dest);
    try {
      const stored = JSON.parse(localStorage.getItem("elsewhere:saved") || "[]");
      if (Array.isArray(stored)) setSavedIds(stored.filter((id: unknown) => typeof id === "string" && places.some(p => p.id === id)));
    } catch { /* A damaged or blocked browser store must not block discovery. */ }
    hydrated.current = true;
    fetch("/api/config").then(async r => r.ok ? await r.json() as {mapsKey?:string;liveSearch?:boolean} : null).then(config => {
      if (config) { setMapsKey(config.mapsKey || ""); setLiveAvailable(Boolean(config.liveSearch)); }
    }).catch(() => { /* The curated collection still works when configuration is unavailable. */ });
    return () => request.current?.abort();
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem("elsewhere:saved", JSON.stringify(savedIds)); }
    catch { setToast("Browser storage is unavailable. Your saves will last for this visit."); }
  }, [savedIds]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); } }, [toast]);

  const ranked = useMemo(() => rankPlaces(source, preferences, destination, liveMode ? livePlaces : places), [source, preferences, destination, liveMode, livePlaces]);
  const results = useMemo(() => diverseResults(ranked), [ranked]);
  const saved = useMemo(() => [...places.filter(p => savedIds.includes(p.id)), ...savedLive], [savedIds, savedLive]);
  const displayed = view === "saved" ? saved : results;

  const toggleSaved = useCallback((place: Place) => {
    if (place.id.startsWith("live-")) {
      setSavedLive(prev => prev.some(p => p.id === place.id) ? prev.filter(p => p.id !== place.id) : [...prev, place]);
      setToast("Live place saves last for this visit.");
    } else {
      const wasSaved = savedIds.includes(place.id);
      setSavedIds(prev => prev.includes(place.id) ? prev.filter(id => id !== place.id) : [...prev, place.id]);
      setToast(wasSaved ? "Place removed from your collection" : "A little inspiration, saved for later");
    }
  }, [savedIds]);
  const isSaved = (place: Place) => savedIds.includes(place.id) || savedLive.some(p => p.id === place.id);
  const togglePreference = (quality: Quality) => {
    setPreferences(prev => prev.includes(quality) ? prev.length > 1 ? prev.filter(q => q !== quality) : prev : [...prev, quality]);
    setActiveId(null);
  };
  const chooseSource = (place: Place) => { request.current?.abort(); setLoading(false); setSource(place); setQuery(place.name); setError(""); setActiveId(null); setLivePlaces([]); setView("discover"); };
  const search = async () => {
    setError(""); setView("discover"); setActiveId(null);
    let matched = places.find(p => p.name.toLowerCase() === query.trim().toLowerCase() || `${p.name}, ${p.city}`.toLowerCase() === query.trim().toLowerCase());
    if (!liveMode) {
      if (!matched) { setError("Choose a starting point from the collection below the search field."); return; }
      setSource(matched); setToast("Your next familiar feeling is out there"); return;
    }
    if(query.trim().length < 2) { setError("Enter the name of a place to begin."); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setLoading(true);
    try {
      if (!matched) {
        if (source.id.startsWith("live-") && source.name.toLowerCase() === query.trim().toLowerCase()) matched = source;
        else {
          const resolved = await fetch("/api/resolve", {method:"POST", headers:{"Content-Type":"application/json"}, signal:controller.signal, body:JSON.stringify({query:query.trim()})});
          const profile = await resolved.json() as {place?:Place;error?:string};
          if(!resolved.ok || !profile.place) throw new Error(profile.error || "That place could not be identified. Add its city and try again.");
          matched = profile.place;
        }
      }
      setSource(matched); setQuery(matched.name);
      const response = await fetch("/api/discover", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ source: `${matched.name}, ${matched.city}, ${matched.country}`, preferences, destination }) });
      const data = await response.json() as {places?:Place[];error?:string};
      if (!response.ok) throw new Error(data.error || "Discovery could not finish. Please try again.");
      if (!Array.isArray(data.places)) throw new Error("The search returned an incomplete comparison. Please try again.");
      setLivePlaces(data.places); setLivePreferences([...preferences]);
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Discovery could not finish. Please try again."); }
    finally { if (request.current === controller) setLoading(false); }
  };
  const share = async () => {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("source", source.id); url.searchParams.set("qualities", preferences.join(",")); url.searchParams.set("destination", destination);
    try { await navigator.clipboard.writeText(url.toString()); setToast("Discovery link copied. Share a little elsewhere."); }
    catch { window.history.replaceState(null, "", url); setToast("Your discovery is in the address bar. Copy the URL to share it."); }
  };
  return { source, query, setQuery, preferences, togglePreference, destination, setDestination, view, setView, layout, setLayout, activeId, setActiveId, modal, setModal, detail, setDetail, toast, error, loading, mapsKey, liveAvailable, liveMode, setLiveMode, results, displayed, saved, isSaved, toggleSaved, chooseSource, search, share, livePreferences };
}
