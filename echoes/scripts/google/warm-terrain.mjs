import { refreshTerrainCatalog } from '../../lib/terrain-catalog.ts';
const data = await refreshTerrainCatalog();
console.log('prepared regions', data.length);
