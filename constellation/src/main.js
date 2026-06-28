import './embed.css';
import { mount } from './mount.js';

const root = document.getElementById('app');
if (!root) throw new Error('Constellation root #app not found');

mount(root, { initialView: 'A' });
