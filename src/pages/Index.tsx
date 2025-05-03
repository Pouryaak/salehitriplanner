
import React, { useState } from 'react';
import { TripProvider } from '@/context/TripContext';
import CreateTripForm from '@/components/trip/CreateTripForm';
import TripList from '@/components/trip/TripList';
import TripDetails from '@/components/trip/TripDetails';
import { useTrip } from '@/context/TripContext';

type ViewState = 'list' | 'create' | 'details';

const TripPlannerContent: React.FC = () => {
  const [view, setView] = useState<ViewState>('list');
  const { currentTrip } = useTrip();

  // Show trip details if there's a selected trip
  React.useEffect(() => {
    if (currentTrip) {
      setView('details');
    }
  }, [currentTrip]);

  return (
    <div className="container mx-auto p-4 md:p-6">
      {view === 'list' && (
        <TripList onCreateTrip={() => setView('create')} />
      )}

      {view === 'create' && (
        <div className="flex justify-center items-center py-8">
          <CreateTripForm onComplete={() => setView('details')} />
        </div>
      )}

      {view === 'details' && (
        <TripDetails onBack={() => setView('list')} />
      )}
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-travel-background">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-travel-primary text-xl font-bold">Salehi Trip Planner</span>
          </div>
        </div>
      </header>

      <main>
        <TripProvider>
          <TripPlannerContent />
        </TripProvider>
      </main>
    </div>
  );
};

export default Index;
