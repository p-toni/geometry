import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { FieldApp } from './field/FieldApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<FieldApp />} />
      </Routes>
    </BrowserRouter>
  );
}