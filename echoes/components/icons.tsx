'use client';
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';
import { ArrowUpRight } from '@phosphor-icons/react/dist/csr/ArrowUpRight';
import { BookmarkSimple } from '@phosphor-icons/react/dist/csr/BookmarkSimple';
import { Buildings } from '@phosphor-icons/react/dist/csr/Buildings';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Check } from '@phosphor-icons/react/dist/csr/Check';
import { Coffee } from '@phosphor-icons/react/dist/csr/Coffee';
import { Compass } from '@phosphor-icons/react/dist/csr/Compass';
import { Crosshair } from '@phosphor-icons/react/dist/csr/Crosshair';
import { GlobeHemisphereWest } from '@phosphor-icons/react/dist/csr/GlobeHemisphereWest';
import { Heart } from '@phosphor-icons/react/dist/csr/Heart';
import { Info } from '@phosphor-icons/react/dist/csr/Info';
import { Leaf } from '@phosphor-icons/react/dist/csr/Leaf';
import { ListBullets } from '@phosphor-icons/react/dist/csr/ListBullets';
import { MapPin } from '@phosphor-icons/react/dist/csr/MapPin';
import { MapTrifold } from '@phosphor-icons/react/dist/csr/MapTrifold';
import { Minus } from '@phosphor-icons/react/dist/csr/Minus';
import { NavigationArrow } from '@phosphor-icons/react/dist/csr/NavigationArrow';
import { Plus } from '@phosphor-icons/react/dist/csr/Plus';
import { ShareNetwork } from '@phosphor-icons/react/dist/csr/ShareNetwork';
import { Sparkle } from '@phosphor-icons/react/dist/csr/Sparkle';
import { Tree } from '@phosphor-icons/react/dist/csr/Tree';
import { Waves } from '@phosphor-icons/react/dist/csr/Waves';
import { Wind } from '@phosphor-icons/react/dist/csr/Wind';
import { X } from '@phosphor-icons/react/dist/csr/X';
import { Footprints } from '@phosphor-icons/react/dist/csr/Footprints';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { SlidersHorizontal } from '@phosphor-icons/react/dist/csr/SlidersHorizontal';
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { Image } from '@phosphor-icons/react/dist/csr/Image';
import { Mountains } from '@phosphor-icons/react/dist/csr/Mountains';
import { Translate } from '@phosphor-icons/react/dist/csr/Translate';
import { Coins } from '@phosphor-icons/react/dist/csr/Coins';
const icons = {
  Image,
  Mountains,
  ArrowRight,
  ArrowUpRight,
  BookmarkSimple,
  Buildings,
  CaretDown,
  Check,
  Coffee,
  Compass,
  Crosshair,
  GlobeHemisphereWest,
  Heart,
  Info,
  Leaf,
  ListBullets,
  MapPin,
  MapTrifold,
  Minus,
  NavigationArrow,
  Plus,
  ShareNetwork,
  Sparkle,
  Tree,
  Waves,
  Wind,
  X,
  Footprints,
  MagnifyingGlass,
  SlidersHorizontal,
  ArrowLeft,
  Translate,
  Coins,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 20,
  weight = 'regular',
  className = '',
}: {
  name: IconName;
  size?: number;
  weight?: 'regular' | 'fill' | 'bold';
  className?: string;
}) {
  const Component = icons[name];
  return <Component size={size} weight={weight} className={className} aria-hidden="true" />;
}
