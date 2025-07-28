import { useState } from 'react';
import { videoService } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, CreditCard, Loader2, Check, ShoppingCart } from 'lucide-react';

const BuyCreditsModal = ({ isOpen, onClose, onCreditsUpdated }) => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState('10'); // Populaire par défaut
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const creditPackages = [
    { id: '5', credits: 5, price: 9.99 },
    { id: '10', credits: 10, price: 18.99, popular: true },
    { id: '25', credits: 25, price: 44.99 },
  ];

  const getCreditsAmount = () => {
    if (selectedPackage === 'custom') return parseInt(customAmount) || 0;
    const pkg = creditPackages.find(p => p.id === selectedPackage);
    return pkg ? pkg.credits : 0;
  };

  const handlePurchase = async () => {
    const creditsAmount = getCreditsAmount();
    if (creditsAmount <= 0) {
      setError('Veuillez sélectionner un nombre de crédits valide');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await videoService.buyCredits(creditsAmount, 'simulation');
      setSuccess(`${creditsAmount} crédits achetés avec succès !`);
      if (onCreditsUpdated) onCreditsUpdated();
      setTimeout(onClose, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'achat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center"><Coins className="h-5 w-5 mr-2 text-yellow-500" />Acheter des Crédits</DialogTitle><DialogDescription>Rechargez votre solde pour enregistrer vos matchs.</DialogDescription></DialogHeader>
        <div className="space-y-6">
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {success && <Alert className="bg-green-50 text-green-800"><Check className="h-4 w-4" /><AlertDescription>{success}</AlertDescription></Alert>}
          <Card><CardContent className="pt-6 flex justify-between items-center"><span className="text-sm">Solde actuel:</span><span className="font-bold flex items-center"><Coins className="h-4 w-4 mr-1.5" />{user?.credits_balance} crédits</span></CardContent></Card>
          <div className="grid grid-cols-3 gap-3">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id} onClick={() => setSelectedPackage(pkg.id)} className={`cursor-pointer text-center transition-all ${selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
                <CardContent className="p-4">
                  {pkg.popular && <div className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full mb-2 inline-block">Populaire</div>}
                  <div className="font-bold text-lg">{pkg.credits} crédits</div>
                  <div className="text-sm text-gray-600">{pkg.price}€</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handlePurchase} disabled={isLoading || getCreditsAmount() <= 0}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ShoppingCart className="h-4 w-4 mr-2" />}
              Acheter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsModal;