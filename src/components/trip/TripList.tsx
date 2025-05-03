
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTrip } from '@/context/TripContext';
import { format } from 'date-fns';
import { MapPin, Calendar, Trash } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface TripListProps {
  onCreateTrip: () => void;
}

const TripList: React.FC<TripListProps> = ({ onCreateTrip }) => {
  const { trips, selectTrip, deleteTrip, currentTrip } = useTrip();
  const { toast } = useToast();

  const handleDeleteTrip = (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    deleteTrip(tripId);
    toast({
      title: "Trip deleted",
      description: "Your trip has been deleted successfully.",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Button 
          onClick={onCreateTrip}
          className="bg-travel-primary hover:bg-travel-primary/90"
        >
          Create New Trip
        </Button>
      </div>
      
      {trips.length === 0 ? (
        <div className="text-center py-10 bg-muted/50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-travel-primary opacity-50 mb-2" />
          <h2 className="text-xl font-medium mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-4">Create your first trip to start planning your adventure!</p>
          <Button 
            onClick={onCreateTrip}
            className="bg-travel-primary hover:bg-travel-primary/90"
          >
            Create New Trip
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <Card 
              key={trip.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${currentTrip?.id === trip.id ? 'ring-2 ring-travel-primary' : ''}`}
              onClick={() => selectTrip(trip.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{trip.name}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => handleDeleteTrip(e, trip.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {format(new Date(trip.startDate), "MMM dd")} - {format(new Date(trip.endDate), "MMM dd, yyyy")}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'} planned
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripList;
