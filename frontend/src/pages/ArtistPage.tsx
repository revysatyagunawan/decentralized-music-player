import { useParams, useNavigate } from 'react-router-dom';
import { ArtistProfile } from '../components/ArtistProfile';

export function ArtistPage() {
  const { webid } = useParams<{ webid: string }>();
  const navigate = useNavigate();

  if (!webid) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
        ARTIST PROFILE
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <ArtistProfile
          webid={decodeURIComponent(webid)}
          onBack={() => navigate('/')}
        />
      </div>
    </div>
  );
}
