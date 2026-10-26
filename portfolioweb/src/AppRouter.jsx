import { lazy, Suspense } from 'react'
import App from './App'
const Admin = lazy(() => import('./pages/Admin'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
export default function AppRouter() {
  const path = window.location.pathname
  return (
    <Suspense fallback={<p className="route-loading">Loading…</p>}>
      {path === '/admin' ? (
        <Admin />
      ) : path.startsWith('/blog/') ? (
        <BlogPost slug={decodeURIComponent(path.slice(6))} />
      ) : (
        <App />
      )}
    </Suspense>
  )
}
