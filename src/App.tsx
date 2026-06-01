import { Header } from './components/ui/header/Header'
import { Footer } from './components/ui/footer/Footer'
import { Outlet } from '@tanstack/react-router'
import { AuthProvider } from './auth/AuthContext'
import { CartProvider } from './cart/CartContext'
import { FavoritesProvider } from './favorites/FavoritesContext'
import { OrdersProvider } from './orders/OrdersContext'
import { ThemeProvider } from './theme/ThemeContext'

function App() {

  return (
    <ThemeProvider>
    <AuthProvider>
      <OrdersProvider>
      <CartProvider>
      <FavoritesProvider>
      <div className="page">
        <Header />
        <div className="page__outlet-wrap">
          <Outlet />
        </div>
        <Footer />
      </div>
      </FavoritesProvider>
      </CartProvider>
      </OrdersProvider>
    </AuthProvider>
    </ThemeProvider>
  )
}

export default App

