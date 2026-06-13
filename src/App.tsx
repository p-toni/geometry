import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { tween } from './design/motion';
import { CanvasRoute } from './routes/CanvasRoute';
import { canvasRoutes } from './routes/canvasRegistry';
import { NotFound } from './routes/NotFound';

function AnimatedRoutes() {
  const location = useLocation();
  const canvasSegment = `/${location.pathname.split('/')[1] ?? ''}`;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={canvasSegment}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={tween.route}
      >
        <Routes location={location}>
          {canvasRoutes.map((route) => (
            <Route
              key={route.slug}
              path={route.hasReader ? `${route.path}/:essay?` : route.path}
              element={<CanvasRoute slug={route.slug} />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
