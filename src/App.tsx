import { BrowserRouter } from 'react-router-dom';
import { FieldApp } from './field/FieldApp';

export default function App() {
  return (
    <BrowserRouter>
      <FieldApp />
    </BrowserRouter>
  );
}