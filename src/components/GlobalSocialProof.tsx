import { useLocation } from 'react-router-dom';
import SocialProofNotification from './SocialProofNotification';

const GlobalSocialProof = () => {
  const location = useLocation();
  
  // Não mostrar notificações em páginas admin
  const isAdminPage = location.pathname.startsWith('/admin');
  
  if (isAdminPage) {
    return null;
  }
  
  return <SocialProofNotification />;
};

export default GlobalSocialProof; 