import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Layout from './components/Layout';
import DailySection from './components/DailySection';
import RecentSection from './components/RecentSection';
import CartoonDetail from './components/CartoonDetail';
import CreateCartoon from './components/CreateCartoon';
import ErrorBoundary from './components/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <CreateCartoon />
        <DailySection />
        <RecentSection />
      </Layout>
    ),
    errorElement: <ErrorBoundary />
  },
  {
    path: "/cartoon/:id",
    element: (
      <Layout>
        <CartoonDetail />
      </Layout>
    ),
    errorElement: <ErrorBoundary />
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;