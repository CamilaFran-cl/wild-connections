import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  envDir: __dirname,
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        admin: resolve(__dirname, 'src/admin.html'),
        apply: resolve(__dirname, 'src/apply.html'),
        booking: resolve(__dirname, 'src/booking.html'),
        chat: resolve(__dirname, 'src/chat.html'),
        checkout: resolve(__dirname, 'src/checkout.html'),
        conexiones: resolve(__dirname, 'src/conexiones.html'),
        dashboard: resolve(__dirname, 'src/dashboard.html'),
        login: resolve(__dirname, 'src/login.html'),
        matches: resolve(__dirname, 'src/matches.html'),
        my_profile: resolve(__dirname, 'src/my-profile.html'),
        nosotras: resolve(__dirname, 'src/nosotras.html'),
        onboarding: resolve(__dirname, 'src/onboarding.html'),
        pricing: resolve(__dirname, 'src/pricing.html'),
        profile: resolve(__dirname, 'src/profile.html'),
        register: resolve(__dirname, 'src/register.html')
      }
    }
  }
});
