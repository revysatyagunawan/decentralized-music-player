import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  login, 
  handleIncomingRedirect, 
  getDefaultSession,
  logout 
} from '@inrupt/solid-client-authn-browser';

const SolidAuthContext = createContext();

export const SolidAuthProvider = ({ children }) => {
  const [session, setSession] = useState(getDefaultSession());
  const [webId, setWebId] = useState(null);
  const [isAuthProcessing, setIsAuthProcessing] = useState(true);

  useEffect(() => {
    // Menangkap redirect dari Pod Provider setelah user login
    handleIncomingRedirect({
      restorePreviousSession: true,
    }).then((info) => {
      if (info?.isLoggedIn) {
        setWebId(info.webId);
        setSession(getDefaultSession());
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
        oidcIssuer, // Contoh: "https://solidcommunity.net"
        redirectUrl: window.location.href, // Kembali ke halaman saat ini
        clientName: "Decentralized Music Player"
      });
    }
  };

  const logoutSolid = async () => {
    await logout();
    setWebId(null);
    setSession(getDefaultSession());
  };

  return (
    <SolidAuthContext.Provider value={{ session, webId, isAuthProcessing, loginWithSolid, logoutSolid }}>
      {children}
    </SolidAuthContext.Provider>
  );
};

export const useSolidAuth = () => useContext(SolidAuthContext);