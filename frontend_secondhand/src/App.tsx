import AppRouter from '@/routes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from '@/store/cart'
export default function App() {
	const queryClient = new QueryClient()
	return (
		<QueryClientProvider client={queryClient}>
			<CartProvider>
				<AppRouter />
			</CartProvider>
		</QueryClientProvider>
	)
}
