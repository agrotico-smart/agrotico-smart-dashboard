# Manual Testing Guide: Market Prices Module

This guide provides step-by-step instructions for manually testing the Agricultural Market Prices module.

## Prerequisites

Before testing, ensure:
1. Database is running and accessible
2. Environment variables are configured in `.env.local`
3. Application is running (`npm run dev`)
4. You are logged in to the dashboard

## Test Cases

### 1. Navigation Test
**Objective:** Verify that the market prices page is accessible from the navigation menu.

**Steps:**
1. Login to the dashboard
2. Look for "Precios de Mercado" in the left sidebar
3. Click on "Precios de Mercado"
4. Verify the page loads without errors

**Expected Result:**
- Navigation link is visible with a TrendingUp icon
- Link is highlighted when on the market prices page
- Page loads successfully

---

### 2. Initial Data Loading Test
**Objective:** Verify that initial data is generated and displayed correctly.

**Steps:**
1. Navigate to `/precios-mercado`
2. Wait for the page to load completely
3. Observe the price cards displayed

**Expected Result:**
- Page displays price cards for all 7 products (Café, Arroz, Maíz, Frijol, Tomate, Papa, Caña de Azúcar)
- Each card shows:
  - Product name
  - Current price in Costa Rican Colones (₡)
  - Unit (kg or tonelada)
  - Trend icon (up, down, or stable)
  - Percentage change
  - Last update date
- Default region is "Nacional"

---

### 3. Region Filter Test
**Objective:** Verify that filtering by region works correctly.

**Steps:**
1. Navigate to `/precios-mercado`
2. Click on the "Región" dropdown
3. Select different regions (e.g., "GAM", "Pacífico Norte")
4. Observe the price cards update

**Expected Result:**
- Dropdown shows all 7 regions
- Price cards update to show prices for the selected region
- No errors occur during filter changes
- Price values change based on the region

---

### 4. Historical Chart Test
**Objective:** Verify that the historical price chart displays correctly.

**Steps:**
1. Navigate to `/precios-mercado`
2. Select a product from the "Producto (para gráfico)" dropdown
3. Select a region from the "Región" dropdown
4. Observe the chart display

**Expected Result:**
- Chart displays a line graph showing price trends
- X-axis shows dates
- Y-axis shows prices in Costa Rican Colones
- Chart has proper formatting and is responsive
- Hover over data points shows tooltips with exact values

---

### 5. Time Period Test
**Objective:** Verify that changing the time period updates the chart correctly.

**Steps:**
1. Navigate to `/precios-mercado`
2. Select a product and region
3. Change the "Período" dropdown to "Últimos 30 días"
4. Wait for chart to load
5. Change to "Últimos 60 días"
6. Change to "Últimos 90 días"

**Expected Result:**
- Chart updates each time the period changes
- More data points appear for longer periods
- Loading indicator appears briefly during updates
- No errors occur

---

### 6. Alert System Test
**Objective:** Verify that price change alerts are displayed correctly.

**Steps:**
1. Navigate to `/precios-mercado`
2. Scroll to the top of the page
3. Observe the alerts section

**Expected Result:**
- If there are significant price changes (>5%), alerts are displayed
- Each alert shows:
  - Product name and region
  - Trend icon (up or down)
  - Percentage change
  - Previous and current price
  - Date of change
- Alerts are color-coded (green for increases, red for decreases)
- If no significant changes, a message indicates "No hay cambios significativos"

---

### 7. Update Prices Test
**Objective:** Verify that the manual update function works.

**Steps:**
1. Navigate to `/precios-mercado`
2. Note the current "Última actualización" timestamp
3. Click the "Actualizar Precios" button
4. Wait for the update to complete
5. Observe changes in prices and timestamp

**Expected Result:**
- Button shows "Actualizando..." with a spinning icon during update
- Success message appears (toast notification)
- Page refreshes with new data
- Timestamp updates to current time
- Some prices may have changed slightly

---

### 8. Responsive Design Test
**Objective:** Verify that the page is responsive on different screen sizes.

**Steps:**
1. Navigate to `/precios-mercado`
2. Resize browser window to mobile size (< 768px)
3. Test all filters and interactions
4. Resize to tablet size (768px - 1024px)
5. Test on desktop size (> 1024px)

**Expected Result:**
- Mobile: Single column layout, filters stack vertically
- Tablet: 2-column grid for price cards
- Desktop: 3-4 column grid for price cards
- Chart remains readable on all screen sizes
- Navigation is accessible via mobile menu
- All interactive elements remain functional

---

### 9. Error Handling Test
**Objective:** Verify graceful error handling.

**Steps:**
1. Disconnect from the database (temporarily)
2. Navigate to `/precios-mercado`
3. Observe behavior

**Expected Result:**
- Page doesn't crash
- Error messages are user-friendly
- Page either shows cached data or empty state
- User can still interact with filters

---

### 10. Performance Test
**Objective:** Verify that the page loads and performs well.

**Steps:**
1. Open browser DevTools
2. Navigate to `/precios-mercado`
3. Check Network and Performance tabs
4. Change filters multiple times
5. Note loading times

**Expected Result:**
- Initial page load < 2 seconds
- Filter changes < 500ms
- Chart rendering < 1 second
- No memory leaks
- Smooth animations and transitions

---

## Database Verification

### Check Data in Database

Run these SQL queries to verify data:

```sql
-- Check if table exists
SHOW TABLES LIKE 'precios_mercado';

-- Check total records
SELECT COUNT(*) FROM precios_mercado;

-- Check products
SELECT DISTINCT producto FROM precios_mercado;

-- Check regions
SELECT DISTINCT region FROM precios_mercado;

-- Check recent prices
SELECT producto, region, precio_actual, fecha, tendencia
FROM precios_mercado
ORDER BY fecha DESC
LIMIT 20;

-- Check for alerts (significant changes)
SELECT producto, region, cambio_porcentual, precio_actual, fecha
FROM precios_mercado
WHERE ABS(cambio_porcentual) >= 5
ORDER BY fecha DESC
LIMIT 10;
```

---

## Known Issues and Limitations

### Current Implementation Notes:
1. **Data Source:** Currently uses generated mock data. In production, this should be replaced with actual data from CNP (Consejo Nacional de Producción) or MAG (Ministerio de Agricultura y Ganadería).

2. **Update Frequency:** Manual update button generates new random variations. In production, this should be automated to fetch real data weekly.

3. **Historical Data:** Initial data generation creates 90 days of history with random variations. Real implementation should use actual historical data.

4. **Currency:** Prices are displayed in Costa Rican Colones (CRC). Conversion to USD or other currencies is not currently implemented.

5. **Data Validation:** Prices are not validated against realistic market ranges. Production should include validation logic.

---

## Success Criteria

The market prices module is considered successful if:
- ✅ All 7 products are displayed
- ✅ All 7 regions can be selected
- ✅ Historical data for 30, 60, and 90 days is available
- ✅ Charts display correctly with proper formatting
- ✅ Alerts show significant price changes (>5%)
- ✅ Responsive design works on mobile, tablet, and desktop
- ✅ No security vulnerabilities (CodeQL passed)
- ✅ No TypeScript errors
- ✅ Linter passes with no new warnings
- ✅ Navigation is properly integrated

---

## Next Steps for Production

1. **Integrate Real Data Sources:**
   - Connect to CNP API or web scraping
   - Connect to MAG data feeds
   - Integrate with SICA (Sistema de Información de Comercio Exterior)

2. **Implement Automated Updates:**
   - Set up cron jobs or scheduled tasks
   - Implement webhook listeners for real-time updates

3. **Add More Features:**
   - Export data to CSV/Excel
   - Price comparison between regions
   - Historical price analysis and predictions
   - Email notifications for significant price changes
   - Mobile app push notifications

4. **Enhance Data Quality:**
   - Add data validation rules
   - Implement outlier detection
   - Add data quality indicators

5. **Improve User Experience:**
   - Add search functionality
   - Implement favorites/watchlist
   - Add price predictions using ML
   - Multi-language support (English/Spanish)
