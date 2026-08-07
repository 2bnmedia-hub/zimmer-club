export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/auth/'],
      },
    ],
    sitemap: 'https://www.zimmer.club/sitemap.xml',
  }
}
