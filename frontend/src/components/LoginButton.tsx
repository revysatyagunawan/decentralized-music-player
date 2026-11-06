import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginButton() {
  const { user, loginWithIssuer, logoutUser } = useAuth();
  const [issuer, setIssuer] = useState('https://solidcommunity.net');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return (
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#888' }} title={user.webid}>
          {user.display_name}
        </span>
        <button onClick={logoutUser}>Logout</button>
      </div>
    );
  }

  async function handleLogin() {
    setChecking(true);
    setError(null);

    try {
      // Normalisasi: kalau user tidak tulis protokol, tambah https://
      let input = issuer.trim();
      if (!/^https?:\/\//i.test(input)) {
        input = 'https://' + input;
      }

      // Validasi format URL
      let url: URL;
      try {
        url = new URL(input);
      } catch {
        throw new Error('Format URL tidak valid');
      }

      if (url.protocol !== 'https:' && !url.hostname.includes('localhost')) {
        throw new Error('Provider harus pakai HTTPS');
      }

      const baseUrl = url.origin;
      console.log('🔍 [Login] Cek provider:', baseUrl);

      // Cek apakah provider benar-benar ada (fetch discovery doc)
      let discoveryRes: Response;
      try {
        discoveryRes = await fetch(`${baseUrl}/.well-known/openid-configuration`, {
          headers: { Accept: 'application/json' },
        });
      } catch (e: any) {
        throw new Error('Provider tidak dapat dihubungi (network error)');
      }

      if (!discoveryRes.ok) {
        throw new Error(`Provider tidak ditemukan (HTTP ${discoveryRes.status})`);
      }

      const discovery = await discoveryRes.json();
      if (!discovery.issuer || !discovery.authorization_endpoint) {
        throw new Error('URL bukan Solid OIDC provider yang valid');
      }

      console.log('✅ [Login] Provider valid:', discovery.issuer);

      // Lanjut ke login flow
      await loginWithIssuer(discovery.issuer);
    } catch (err: any) {
      console.error('❌ [Login]', err.message);
      setError(err.message || 'Provider tidak ditemukan');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={issuer}
          onChange={(e) => { setIssuer(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
          placeholder="https://provider.example"
          disabled={checking}
          style={{ width: 280 }}
        />
        <button onClick={handleLogin} disabled={checking}>
          {checking ? 'Mengecek...' : 'Login'}
        </button>
      </div>
      {error && (
        <div style={{
          fontSize: 12,
          color: '#f87171',
          background: '#2a1515',
          padding: '6px 12px',
          borderRadius: 4,
          border: '1px solid #4a2020',
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
