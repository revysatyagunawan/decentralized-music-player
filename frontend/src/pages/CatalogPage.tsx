import { useSearchParams } from 'react-router-dom';
import { Catalog } from '../components/Catalog';

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="flex flex-col h-full">
      <div className="h-8 border-b border-zinc-800 flex items-center px-4 text-[10px] font-mono text-zinc-500 tracking-widest shrink-0">
        {query ? `SEARCH: ${query.toUpperCase()}` : 'LIBRARY / TRACKS'}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Catalog searchQuery={query} />
      </div>
    </div>
  );
}
