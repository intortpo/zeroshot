import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PetriAuthGuard } from './components/auth/PetriAuthGuard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PetriAuthGuard>
      <App />
    </PetriAuthGuard>
  </React.StrictMode>
);
