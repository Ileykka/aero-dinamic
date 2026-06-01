import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RecoilRoot } from 'recoil'
import './index.css'
import App from './App'
import { createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { Main } from './components/pages/main'
import { Catalog } from './components/pages/catalog/Catalog'
import { ProductPage } from './components/pages/product'
import { LoginPage, RegisterPage } from './components/pages/auth'
import { CartPage } from './components/pages/cart'
import { CheckoutPage } from './components/pages/checkout'
import { FavoritesPage } from './components/pages/favorites'
import { DeliveryPage } from './components/pages/delivery'
import { AboutPage } from './components/pages/about'
import { ContactsPage } from './components/pages/contacts'
import { ProfilePage } from './components/pages/profile'
import type { CatalogCategoryKey } from './catalog/categories'
import { isCatalogCategoryKey } from './catalog/categories'

const rootRoute = createRootRoute({
  component: App,
})

const mainRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Main,
})

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  validateSearch: (raw: Record<string, unknown>): { category?: CatalogCategoryKey; q?: string } => {
    const category = raw.category
    const q = typeof raw.q === 'string' ? raw.q : undefined
    return {
      ...(isCatalogCategoryKey(category) ? { category } : {}),
      ...(q ? { q } : {}),
    }
  },
  component: Catalog,
})

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product/$slug',
  component: ProductPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
})

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
})

const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  component: FavoritesPage,
})

const deliveryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delivery',
  component: DeliveryPage,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: AboutPage,
})

const contactsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contacts',
  component: ContactsPage,
})

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
})

const routeTree = rootRoute.addChildren([
  mainRoute,
  catalogRoute,
  productRoute,
  cartRoute,
  checkoutRoute,
  favoritesRoute,
  deliveryRoute,
  aboutRoute,
  contactsRoute,
  profileRoute,
  loginRoute,
  registerRoute,
])

const basepath = import.meta.env.BASE_URL.replace(/\/$/, '')

const router = createRouter({
  routeTree,
  ...(basepath ? { basepath } : {}),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RecoilRoot>
      <RouterProvider router={router} />
    </RecoilRoot>
  </StrictMode>,
)
