import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginButton } from './components/LoginButton';
import { UploadForm } from './components/UploadForm';
import { Catalog } from './components/Catalog';

function Shell() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <p style={{ padding: 24 }}>Loading...</p>;
  }

  return (
    <>
      <header>
        <h1 style={{ fontSize: 18 }}>Solid Music</h1>
        <LoginButton />
      </header>
      <main className="container">
        <div style={{ display: 'grid', gap: 24 }}>
          <UploadForm />
          <Catalog />
        </div>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
