
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate logout process
    const timer = setTimeout(() => {
      toast.success('Logged out successfully');
      navigate('/');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-claude-beige">
      <Loader2 className="h-8 w-8 animate-spin text-claude-orange" />
      <h1 className="mt-4 text-xl">Logging you out...</h1>
    </div>
  );
};

export default LogoutPage;
