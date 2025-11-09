# Features Documentation

## 🗞️ Agricultural News Module (Noticias Agrícolas)

### Overview
A newspaper-style news aggregator specifically designed for Costa Rican farmers. This module displays the latest agricultural news from trusted Costa Rican sources in a familiar newspaper format that inspires confidence.

### Features
- **📰 RSS Feed Aggregation**: Automatically fetches news from multiple Costa Rican agricultural sources
- **🔄 Auto-Refresh**: Daily automatic updates (24-hour revalidation)
- **💾 Offline Support**: In-memory caching allows viewing last fetched news even when offline
- **📱 Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **🎨 Newspaper Style**: Professional layout mimicking national newspapers (La Nación, CRHoy)
- **⚡ Performance Optimized**: Lazy loading for images, efficient caching
- **🔍 SEO Optimized**: Proper metadata for search engines

### News Sources
Currently aggregating from:
- **La Nación** - Costa Rica's leading newspaper (RSS feed)
- **CRHoy** - Popular Costa Rican news portal (RSS feed)

> **Note**: Additional sources can be easily added by editing `src/app/api/noticias/route.ts`

### Technical Details

#### Architecture
```
/noticias (page)
  ├── Server Component (page.tsx)
  │   └── Fetches initial news on page load
  ├── Client Component (NoticiasClient.tsx)
  │   ├── Manages state and refresh
  │   ├── NewsHeader (Header with refresh button)
  │   └── NewsList (Grid of news cards)
  │       └── NewsCard (Individual article card)
  └── API Route (/api/noticias)
      ├── RSS parsing with rss-parser
      ├── In-memory caching (24h)
      └── Error handling with fallback to cache
```

#### Files Added
- `src/app/api/noticias/route.ts` - API endpoint for news aggregation
- `src/app/noticias/page.tsx` - News page (server component)
- `src/actions/noticias.ts` - Server action for fetching news
- `src/components/noticias/NoticiasClient.tsx` - Client wrapper component
- `src/components/noticias/NewsHeader.tsx` - Header with refresh button
- `src/components/noticias/NewsList.tsx` - Grid layout for news cards
- `src/components/noticias/NewsCard.tsx` - Individual news article card
- `src/lib/types.ts` - Added NewsArticle and NewsResponse types

#### Caching Strategy
- **Server-side**: Next.js revalidation every 24 hours
- **API-side**: In-memory cache with 24-hour expiration
- **Offline mode**: Serves cached news when fresh fetch fails
- **Client-side**: Manual refresh button for users who want latest news

#### Security
- ✅ HTML entity escaping handled by React (prevents XSS)
- ✅ External links open in new tab with `noopener,noreferrer`
- ✅ Image loading errors handled gracefully
- ✅ CodeQL security scan passed with 0 alerts
- ✅ User-Agent header for ethical RSS scraping

### Usage

#### Accessing the News Section
1. Navigate to the main dashboard
2. Click on "Noticias" in the sidebar (📰 icon)
3. View the latest agricultural news from Costa Rica

#### Refreshing News
- Click the "Actualizar" button in the header
- News will automatically refresh daily

#### Reading Full Articles
- Click anywhere on a news card
- Article opens in a new tab on the source website

### Configuration

#### Adding New News Sources
Edit `src/app/api/noticias/route.ts` and add to the `NEWS_SOURCES` array:

```typescript
const NEWS_SOURCES = [
  {
    name: "Source Name",
    url: "https://example.com/rss.xml",
    category: "Category Name",
  },
  // ... more sources
];
```

#### Adjusting Cache Duration
Modify the constants in `src/app/api/noticias/route.ts`:

```typescript
export const revalidate = 86400; // Next.js revalidation (seconds)
const CACHE_DURATION = 86400000; // In-memory cache (milliseconds)
```

#### Adjusting Number of Articles
In `src/app/api/noticias/route.ts`, modify:

```typescript
return feed.items.slice(0, 5).map((item, index) => {
  // Change '5' to desired number per source
});

// And for total articles displayed:
.slice(0, 10); // Change '10' to desired total
```

### Styling

The news module uses a newspaper-inspired design:
- **Typography**: Bold headlines with clear hierarchy
- **Layout**: Responsive grid (1 column mobile, 2 tablet, 3 desktop)
- **Colors**: Professional blue accents (#0057a3 brand color)
- **Images**: Card-style with hover effects
- **Borders**: Clean separators mimicking newspaper sections

### Dependencies
- `rss-parser` (^3.13.0) - RSS feed parsing
- `date-fns` (^4.1.0) - Date formatting with Spanish locale
- `lucide-react` (^0.294.0) - Icons

### Future Enhancements
Potential improvements for future versions:
- [ ] Add more Costa Rican agricultural news sources (MAG, INTA, CNP)
- [ ] Category filtering (policies, weather, pests, events)
- [ ] Search functionality
- [ ] Bookmark/save articles
- [ ] Push notifications for important news
- [ ] Sentiment analysis for news impact
- [ ] AI summarization of long articles
- [ ] Share to social media
- [ ] Database persistence for news history

### Troubleshooting

#### No news displayed
- Check internet connection
- Verify RSS feeds are accessible
- Check browser console for errors
- Wait 24 hours for cache to clear if stale

#### Images not loading
- Normal behavior for some RSS feeds without images
- Check if source website blocks hotlinking
- Error handling will hide broken images

#### Outdated news
- Click "Actualizar" button to force refresh
- Check if RSS feeds are still active
- Verify cache duration settings

### Accessibility
- Semantic HTML structure
- ARIA labels for buttons and links
- Keyboard navigation support
- Screen reader friendly
- High contrast text for readability

### Performance
- Lazy loading for images
- Efficient caching (reduces API calls)
- Optimized bundle size
- Server-side rendering for fast initial load
- Client-side state management for smooth interactions
