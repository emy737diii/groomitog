import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const site = process.env.SITE_URL ?? '';
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/r/', '/api/'] }], sitemap: site ? `${site}/sitemap.xml` : undefined };
}
