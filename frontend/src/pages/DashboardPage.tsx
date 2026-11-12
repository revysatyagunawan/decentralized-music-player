import { useAuth } from '../contexts/AuthContext';
import { UploadForm } from '../components/UploadForm';

export function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-zinc-500 font-mono text-xs">LOADING...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col h-full">
        <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
          DASHBOARD
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500 font-mono text-xs text-center leading-relaxed">
            LOGIN REQUIRED.
            <br />
            <span className="text-zinc-700">Connect your Pod to access dashboard.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
        DASHBOARD — {user.display_name}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          {/* Section header */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-zinc-100 tracking-widest font-mono mb-2">
              UPLOAD NEW TRACK
            </h2>
            <p className="text-[10px] font-mono text-zinc-600 leading-relaxed">
              File disimpan ke Solid Pod Anda.<br />
              Metadata akan dibaca oleh indexer publik.
            </p>
          </div>

          {/* Form in bordered card */}
          <div className="border border-zinc-800 p-6 bg-zinc-900/30">
            <UploadForm />
          </div>

          {/* Placeholder for track list */}
          <div className="mt-8 text-[10px] font-mono text-zinc-600 leading-relaxed">
            [ TRACK LIST & EDIT COMING SOON ]
          </div>
        </div>
      </div>
    </div>
  );
}
