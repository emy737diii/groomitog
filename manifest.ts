import type { MetadataRoute } from 'next';
import { getSettings } from '@/lib/settings';

// читается из базы при запросе, а не при сборке (база при сборке может быть недоступна)
export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.name, short_name: s.name, start_url: '/', display: 'standalone', lang: 'ru',
    background_color: '#FAF8FF', theme_color: '#1E1A3A',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
