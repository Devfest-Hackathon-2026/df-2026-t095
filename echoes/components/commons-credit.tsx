import type {CommonsPhoto} from '@/lib/visual-types';
export function CommonsCredit({photo}:{photo:CommonsPhoto}){return <div className="commons-credit"><span>Wikimedia Commons</span><a href={photo.sourcePage} target="_blank" rel="noopener noreferrer">{photo.author}</a><a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">{photo.license}</a><span>縮小・トリミングあり</span></div>;}
