import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useSolidAuth } from '../contexts/SolidAuthContext';
import { uploadTrackToPod } from '../lib/solidUtils';
import api from '../lib/api';

export default function UploadForm() {
  const { session, webId } = useSolidAuth();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ title: '', artistName: '', genre: '' });
  const [status, setStatus] = useState({ loading: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !session.info.isLoggedIn) return;

    setStatus({ loading: true, message: 'Mengunggah ke Solid Pod...' });

    try {
      // 1. Unggah ke Pod (menggunakan utilitas dari Ticket B1.3)
      const metadataUrl = await uploadTrackToPod(file, formData, session);
      
      setStatus({ loading: true, message: 'Menyinkronkan dengan Katalog Publik...' });
      
      // 2. Mendaftarkan URL Metadata ke Backend (Ticket B1.2 & Ticket A1.3 milik Group A)
      try {
        await api.post('/api/tracks/sync', { pod_resource_url: metadataUrl });
        setStatus({ loading: false, message: 'Lagu berhasil dipublikasikan!' });
        setFormData({ title: '', artistName: '', genre: '' }); // Reset form
        setFile(null);
      } catch (backendError) {
        console.warn("Lagu ada di Pod, tapi Backend belum siap (ini wajar jika Group A belum selesai).", backendError);
        setStatus({ loading: false, message: 'Berhasil simpan ke Pod! (Menunggu Backend Group A siap)' });
      }

    } catch (error) {
      console.error(error);
      setStatus({ loading: false, message: `Error: ${error.message}` });
    }
  };

  if (!webId) return <div className="p-4 bg-yellow-50 text-yellow-700 rounded">Silakan login untuk mengunggah musik.</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Unggah Lagu Baru</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul Lagu</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Nama Artis</label>
          <input required type="text" value={formData.artistName} onChange={e => setFormData({...formData, artistName: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">File Audio (MP3)</label>
          <input required type="file" accept="audio/mpeg" onChange={e => setFile(e.target.files[0])} className="mt-1 block w-full border border-gray-300 rounded-md p-2 shadow-sm" />
        </div>

        <button disabled={status.loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
          <Upload size={18} />
          {status.loading ? 'Memproses...' : 'Unggah & Publikasikan'}
        </button>

        {status.message && (
          <div className={`p-3 rounded text-sm ${status.message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {status.message}
          </div>
        )}
      </div>
    </form>
  );
}