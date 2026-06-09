import { mediaUrl } from '../utils/mediaCdn';

/** Marcos PNG en `public/Polaroids/` (también en Supabase: `Spiral/Polaroids/`). */
export const POLAROID_FRAME_SRC = {
  one: mediaUrl('/Polaroids/1.png'),
  two: mediaUrl('/Polaroids/2.png'),
  three: mediaUrl('/Polaroids/3.png'),
  four: mediaUrl('/Polaroids/4.png'),
  five: mediaUrl('/Polaroids/5.png'),
  six: mediaUrl('/Polaroids/6.png'),
  seven: mediaUrl('/Polaroids/7.png'),
} as const;
