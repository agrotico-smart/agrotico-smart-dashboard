# Agrotico Smart Dashboard

Sistema de Monitoreo Agrícola Inteligente con Next.js

## Características Principales

### 🤖 Dashboard de Robots
Monitorea y gestiona tus robots agrícolas en tiempo real. Visualiza datos de sensores, métricas de rendimiento y obtén insights inteligentes.

### 🌤️ Clima
Consulta información meteorológica en tiempo real para diferentes regiones de Costa Rica.

### 📊 Precios de Mercado Agrícola
Módulo para consultar los precios actualizados de los principales productos agrícolas de Costa Rica.

#### Productos Soportados:
- ☕ Café
- 🌾 Arroz
- 🌽 Maíz
- 🫘 Frijol
- 🍅 Tomate
- 🥔 Papa
- 🎋 Caña de Azúcar

#### Regiones de Costa Rica:
- Nacional (promedio)
- GAM (Gran Área Metropolitana)
- Pacífico Norte
- Huetar Norte
- Pacífico Central
- Brunca
- Huetar Caribe

#### Funcionalidades del Módulo de Precios:
- ✅ Precios actuales por producto y región
- ✅ Tendencias históricas (30, 60, 90 días)
- ✅ Alertas de cambios significativos (>5%)
- ✅ Gráficos interactivos de evolución de precios
- ✅ Filtros por región y período
- ✅ Actualización manual de precios
- ✅ Datos cacheados para funcionamiento sin conexión

### 🤖 Asistente de IA
Chat interactivo con IA para consultas agrícolas y análisis de datos.

### ⚙️ Configuración
Gestiona tu cuenta, robots vinculados y preferencias.

---

## Directrices de Diseño

**Responsive**
• La interfaz debe adaptarse a celular, tableta y computadora.

**Simplicidad**
• Diseño limpio y fácil de entender.
• Uso de íconos y flujos intuitivos para mejorar la experiencia del usuario.

**Intuitiva**
• Integrar todos los elementos de forma coherente para maximizar la eficiencia y la usabilidad.

**Autenticación / Vinculación**
• Implementar un sistema de inicio de sesión.
• El usuario deberá ingresar el UUID del robot para vincularlo con su cuenta y acceder a sus datos.

**Identidad visual**
• Utilizar la paleta de colores oficial de Agrotico para mantener coherencia de marca.

**Plataforma Web**
• Todo debe funcionar en la web.
• Usar Server Actions de Next.js para la comunicación entre la base de datos y la aplicación.

**Seguridad**
• Fortalecer la seguridad en cada etapa del flujo.
• Verificar y validar todos los pasos críticos.

**Inteligencia Artificial**
• Optimizar los prompts.
• Implementar un chat interactivo usando el nuevo SDK de IA de Vercel con características mejoradas.

---

## Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- MySQL 8.0+
- npm o bun

### Pasos de Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/agrotico-smart/agrotico-smart-dashboard.git
cd agrotico-smart-dashboard
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
DATABASE_URL=mysql://username:password@hostname:port/database_name
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

4. Configurar la base de datos:
```bash
npm run db:setup
```

5. Ejecutar en desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter
- `npm run server` - Inicia el servidor Express
- `npm run dev:full` - Inicia ambos servidores (Next.js + Express)

---

## Estructura del Proyecto

```
src/
├── actions/          # Server Actions de Next.js
│   ├── dashboard.ts
│   ├── market-prices.ts
│   └── ...
├── app/              # App Router de Next.js
│   ├── dashboard/
│   ├── precios-mercado/
│   ├── clima/
│   └── ...
├── components/       # Componentes React
│   ├── market-prices/
│   ├── dashboard/
│   ├── ui/
│   └── ...
├── lib/              # Utilidades y tipos
│   ├── types.ts
│   ├── db.ts
│   └── ...
└── styles/           # Estilos globales
```

---

## Tecnologías Utilizadas

- **Framework:** Next.js 14 (App Router)
- **UI:** React 18, Tailwind CSS, shadcn/ui
- **Gráficos:** Recharts, Chart.js
- **Base de datos:** MySQL con mysql2
- **Autenticación:** NextAuth.js
- **Validación:** Zod
- **IA:** Vercel AI SDK (Anthropic, OpenAI, DeepSeek)

---

## API de Precios de Mercado

### Server Actions

#### `getMarketPrices()`
Obtiene los precios actuales de todos los productos y regiones.

**Retorna:**
```typescript
{
  precios: MarketPrice[],
  alertas: MarketPriceAlert[],
  ultima_actualizacion: string
}
```

#### `getMarketPriceHistory(producto, region, dias)`
Obtiene el historial de precios para un producto específico.

**Parámetros:**
- `producto`: Nombre del producto (ej: "Café")
- `region`: Nombre de la región (ej: "GAM")
- `dias`: Número de días a consultar (30, 60, 90)

**Retorna:**
```typescript
{
  producto: string,
  region: string,
  historial: Array<{ fecha: string, precio: number }>
}
```

#### `updateMarketPrices()`
Actualiza los precios de mercado (genera nuevas entradas).

---

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

MIT License - ver el archivo LICENSE para más detalles.

---

## Equipo

Desarrollado por **Agrotico Team**
