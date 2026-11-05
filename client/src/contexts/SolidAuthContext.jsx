import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  login, 
  handleIncomingRedirect, 
  getDefaultSession,
  logout 
} from '@inrupt/solid-client-authn-browser';
import api from '../lib/api';

const SolidAuthContext = createContext();

export const SolidAuthProvider = ({ children }) => {
  const [session, setSession] = useState(getDefaultSession());
  const [webId, setWebId] = useState(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(true);

  useEffect(() => {
    handleIncomingRedirect({
      restorePreviousSession: true,
    }).then(async (info) => {
      if (info?.isLoggedIn) {
        setWebId(info.webId);
        setSession(getDefaultSession());
        
        try {
          await api.post('/api/auth/solid/exchange', {
            webid: info.webId
          });
          console.log("Berhasil sinkronisasi sesi dengan Backend!");
        } catch (error) {
          console.error("Menunggu Backend: API Exchange belum siap atau terjadi error.", error);
        }
      }
      setIsAuthProcessing(false);
    }).catch((err) => {
      console.error("Autentikasi Solid gagal:", err);
      setIsAuthProcessing(false);
    });
  }, []);

  const loginWithSolid = async (oidcIssuer) => {
    if (!getDefaultSession().info.isLoggedIn) {
      await login({
        oidcIssuer,
        redirectUrl: window.location.href,
        clientName: "Decentralized Music Player"
      });
    }
  };

  const logoutSolid = async () => {
    await logout();
    setWebId(null);
    setSession(getDefaultSession());
    
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error("Gagal menghapus sesi backend", error);
    }
  };

  return (
    <SolidAuthContext.Provider value={{ session, webId, isAuthProcessing, loginWithSolid, logoutSolid }}>
      {children}
    </SolidAuthContext.Provider>
  );
};

export const useSolidAuth = () => useContext(SolidAuthContext);