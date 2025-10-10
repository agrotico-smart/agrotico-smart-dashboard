import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agrotico Smart Dashboard',
    short_name: 'Agrotico',
    description: 'Sistema de Monitoreo Agrícola Inteligente con IA',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0057a3',
    icons: [
      {
        src: '/favicon.png',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    categories: ['agriculture', 'productivity', 'business'],
    lang: 'es',
    orientation: 'portrait',
  }
}
