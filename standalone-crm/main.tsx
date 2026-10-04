import React from 'react';
import {createRoot} from 'react-dom/client';
import CRM from './app/crm/CRM';
import './base.css';
import './app/crm/crm.css';
createRoot(document.getElementById('root')!).render(<CRM/>);
