export type GeoRegion = { north: number; south: number; east: number; west: number };
export function regionMetrics(region: GeoRegion) {
  const lat = (region.north + region.south) / 2;
  const heightKm = (region.north - region.south) * 111.32;
  const widthKm = (region.east - region.west) * 111.32 * Math.cos((lat * Math.PI) / 180);
  return {
    lat,
    lng: (region.east + region.west) / 2,
    widthKm,
    heightKm,
    areaKm2: widthKm * heightKm,
  };
}
export function validateRegion(value: unknown): GeoRegion {
  if (!value || typeof value !== 'object')
    throw new Error('地図上で範囲の対角となる2点を選んでください。');
  const r = value as GeoRegion;
  if (
    ![r.north, r.south, r.east, r.west].every(v => typeof v === 'number' && Number.isFinite(v)) ||
    r.north > 80 ||
    r.south < -80 ||
    r.east > 180 ||
    r.west < -180 ||
    r.north <= r.south ||
    r.east <= r.west
  )
    throw new Error(
      '緯度・経度と範囲を確認してください。日付変更線をまたぐ場合は、範囲を分けてください。',
    );
  const m = regionMetrics(r);
  if (m.widthKm < 0.1 || m.heightKm < 0.1)
    throw new Error('縦・横とも100 m以上の範囲を選んでください。');
  if (m.widthKm > 40 || m.heightKm > 40 || m.areaKm2 > 900)
    throw new Error('参照範囲は一辺40 km以内、面積900 km²以内にしてください。');
  return { north: r.north, south: r.south, east: r.east, west: r.west };
}
export function regionAround(lat: number, lng: number, halfKm = 1): GeoRegion {
  const dy = halfKm / 111.32,
    dx = halfKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return { north: lat + dy, south: lat - dy, east: lng + dx, west: lng - dx };
}
export function moveRegion(region: GeoRegion, lat: number, lng: number): GeoRegion {
  const m = regionMetrics(region),
    dy = m.heightKm / 2 / 111.32,
    dx = m.widthKm / 2 / (111.32 * Math.cos((lat * Math.PI) / 180));
  return validateRegion({ north: lat + dy, south: lat - dy, east: lng + dx, west: lng - dx });
}
