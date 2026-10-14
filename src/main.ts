import './app.css';
import App from './App.svelte';

let app: any;

try {
  // Svelte 5 mount
  const { mount } = await import('svelte');
  if (typeof mount === 'function') {
    app = mount(App, {
      target: document.getElementById('app')!,
    });
  } else {
    // Svelte 4 fallback
    app = new (App as any)({
      target: document.getElementById('app')!,
    });
  }
} catch {
  // Fallback
  app = new (App as any)({
    target: document.getElementById('app')!,
  });
}

export default app;
