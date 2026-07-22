import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
        },
        success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
        error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } },
      }}
    />
  );
}
