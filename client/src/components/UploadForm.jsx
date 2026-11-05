import React, { useState } from 'react';
import { Upload, Music } from 'lucide-react';
import { useSolidAuth } from '../contexts/SolidAuthContext';
import { uploadTrackToPod } from '../lib/solidUtils';
import api from '../lib/api';

export default function UploadForm() {
  const { session, webId } = useSolidAuth();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ title: '', artistName: '', genre: '' });
  const [status, setStatus] = useState({ loading: false, message: '' });

  // ... (biarkan fungsi handleSubmit sama persis seperti sebelumnya)
  const handleSubmit = async (e) => { /* kode lama */ };

  if (!webId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music className="text-cyan-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Platform Musik Milik Anda</h2>
        <p className="text-slate-400 mb-6">Unggah lagu langsung ke Solid Pod Anda dan biarkan dunia mendengarkannya tanpa perantara.</p>
        <p className="text-sm text-cyan-400">↑ Silakan masuk menggunakan WebID di kanan atas untuk mulai mengunggah.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Upload className="text-cyan-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Unggah Lagu Baru</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Judul Lagu</label>
          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Misal: Kota yang Sama" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nama Artis</label>
          <input required type="text" value={formData.artistName} onChange={e => setFormData({...formData, artistName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" placeholder="Nama panggung Anda" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">File Audio (MP3)</label>
          <div className="w-full border-2 border-dashed border-slate-600 rounded-xl p-4 text-center hover:border-cyan-500 transition-colors bg-slate-900/50 cursor-pointer relative">
            <input required type="file" accept="audio/mpeg" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <span className="text-sm text-slate-400">{file ? file.name : "Klik atau seret file MP3 ke sini"}</span>
          </div>
        </div>

        <button disabled={status.loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium py-3 px-4 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-cyan-500/25">
          {status.loading ? 'Memproses ke Pod...' : 'Unggah & Publikasikan'}
        </button>

        {status.message && (
          <div className={`p-4 rounded-xl text-sm border ${status.message.includes('Error') ? 'bg-red-900/30 border-red-500/50 text-red-400' : 'bg-green-900/30 border-green-500/50 text-green-400'}`}>
            {status.message}
          </div>
        )}
      </div>
    </form>
  );
}