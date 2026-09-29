import { useNavigate } from 'react-router-dom';
import { BonificoModal } from '../../components/modals/BonificoModal';

export default function BonificoPage() {
  const navigate = useNavigate();
  return (
    <BonificoModal
      isOpen={true}
      onClose={() => navigate('/home')}
      onSuccess={() => navigate('/home')}
    />
  );
}
