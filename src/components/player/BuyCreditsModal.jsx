import { useState } from 'react';
import { videoService } from '../../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Coins, 
  CreditCard, 
  Loader2,
  Check,
  ShoppingCart
} from 'lucide-react';

const BuyCreditsModal = ({ isOpen, onClose, onCreditsUpdated, currentBalance = 0 }) => {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('simulation');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Packages de crédits prédéfinis
  const creditPackages = [
    { id: '5', credits: 5, price: 9.99, popular: false },
    { id: '10', credits: 10, price: 18.99, popular: true },
    { id: '25', credits: 25, price: 44.99, popular: false },
    { id: '50', credits: 50, price: 84.99, popular: false },
  ];

  const getCreditsAmount = () => {
    if (selectedPackage === 'custom') {
      return parseInt(customAmount) || 0;
    }
    const pkg = creditPackages.find(p => p.id === selectedPackage);
    return pkg ? pkg.credits : 0;
  };

  const getPrice = () => {
    if (selectedPackage === 'custom') {
      const credits = parseInt(customAmount) || 0;
      return (credits * 1.99).toFixed(2); // 1.99€ par crédit
    }
    const pkg = creditPackages.find(p => p.id === selectedPackage);
    return pkg ? pkg.price.toFixed(2) : '0.00';
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
      const response = await videoService.buyCredits(creditsAmount, paymentMethod);
      
      setSuccess(`${creditsAmount} crédits achetés avec succès !`);
      
      // Notifier le parent de la mise à jour des crédits
      if (onCreditsUpdated) {
        onCreditsUpdated(response.data.new_balance);
      }
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        handleClose();
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'achat de crédits');
      console.error('Error buying credits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPackage('');
    setCustomAmount('');
    setPaymentMethod('simulation');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span>Acheter des Crédits</span>
          </DialogTitle>
          <DialogDescription>
            Achetez des crédits pour enregistrer vos matchs de padel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Solde actuel */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Solde actuel:</span>
                <div className="flex items-center space-x-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{currentBalance} crédits</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Packages de crédits */}
          <div className="space-y-3">
            <Label>Choisissez un package</Label>
            <div className="grid grid-cols-2 gap-3">
              {creditPackages.map((pkg) => (
                <Card 
                  key={pkg.id}
                  className={`cursor-pointer transition-all ${
                    selectedPackage === pkg.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  } ${pkg.popular ? 'border-blue-200' : ''}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <CardContent className="p-4 text-center">
                    {pkg.popular && (
                      <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full mb-2 inline-block">
                        Populaire
                      </div>
                    )}
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{pkg.credits}</span>
                    </div>
                    <div className="text-sm text-gray-600">{pkg.price}€</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Option personnalisée */}
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPackage === 'custom' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedPackage('custom')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Montant personnalisé</span>
                <span className="text-sm text-gray-600">1.99€ / crédit</span>
              </div>
              {selectedPackage === 'custom' && (
                <div className="mt-3">
                  <Input
                    type="number"
                    placeholder="Nombre de crédits"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                    max="100"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Méthode de paiement */}
          <div className="space-y-2">
            <Label>Méthode de paiement</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simulation">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>Paiement simulé (MVP)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Résumé */}
          {selectedPackage && (
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Crédits à acheter:</span>
                    <span className="font-semibold">{getCreditsAmount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prix total:</span>
                    <span className="font-semibold">{getPrice()}€</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Nouveau solde:</span>
                    <div className="flex items-center space-x-1">
                      <Coins className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{currentBalance + getCreditsAmount()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handlePurchase} 
              disabled={isLoading || !selectedPackage || getCreditsAmount() <= 0}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Acheter {getCreditsAmount()} crédit{getCreditsAmount() > 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCreditsModal;

