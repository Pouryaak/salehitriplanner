
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrip } from '@/context/TripContext';
import { format, isSameDay } from 'date-fns';
import { Calendar, ArrowLeft, Plus, MapPin, Trash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TripDetailsProps {
  onBack: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ onBack }) => {
  const { currentTrip, addDay } = useTrip();
  const [newDayDate, setNewDayDate] = useState<Date | undefined>(undefined);
  
  if (!currentTrip) {
    return null;
  }

  const handleAddDay = () => {
    if (!newDayDate) {
      toast.error("Please select a date");
      return;
    }
    
    // Check if date is within trip range
    if (newDayDate < currentTrip.startDate || newDayDate > currentTrip.endDate) {
      toast.error("Date must be within trip date range");
      return;
    }
    
    // Check if day already exists
    const dayExists = currentTrip.days.some(day => isSameDay(day.date, newDayDate));
    if (dayExists) {
      toast.error("This day already exists in your trip");
      return;
    }
    
    addDay(currentTrip.id, newDayDate);
    setNewDayDate(undefined);
    toast.success("Day added to your trip");
  };

  const disabledDays = {
    before: new Date(currentTrip.startDate),
    after: new Date(currentTrip.endDate),
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">{currentTrip.name}</h1>
      </div>
      
      <div className="flex items-center text-muted-foreground mb-6">
        <Calendar className="h-4 w-4 mr-2" />
        <span>
          {format(new Date(currentTrip.startDate), "MMMM dd")} - {format(new Date(currentTrip.endDate), "MMMM dd, yyyy")}
        </span>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
            <label className="text-sm font-medium">Add a Day to Your Trip</label>
            <div className="flex flex-1 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !newDayDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newDayDate ? format(newDayDate, "MMMM dd, yyyy") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={newDayDate}
                    onSelect={setNewDayDate}
                    disabled={disabledDays}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                onClick={handleAddDay}
                disabled={!newDayDate}
                className="bg-travel-primary hover:bg-travel-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Day
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {currentTrip.days.length === 0 ? (
          <div className="text-center py-10 bg-muted/50 rounded-lg">
            <MapPin className="mx-auto h-10 w-10 text-travel-primary opacity-50 mb-2" />
            <h2 className="text-lg font-medium mb-2">No days added yet</h2>
            <p className="text-muted-foreground mb-4">Add days to your trip to start planning your itinerary</p>
          </div>
        ) : (
          currentTrip.days.sort((a, b) => a.date.getTime() - b.date.getTime()).map((day) => (
            <DayCard key={day.id} tripId={currentTrip.id} day={day} />
          ))
        )}
      </div>
    </div>
  );
};

interface DayCardProps {
  tripId: string;
  day: {
    id: string;
    date: Date;
    cities: {
      id: string;
      name: string;
      places: {
        id: string;
        name: string;
        order: number;
      }[];
    }[];
  };
}

const DayCard: React.FC<DayCardProps> = ({ tripId, day }) => {
  const { addCity, deleteDay } = useTrip();
  const [newCityName, setNewCityName] = useState('');
  
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) {
      toast.error("Please enter a city name");
      return;
    }
    
    addCity(tripId, day.id, newCityName);
    setNewCityName('');
    toast.success("City added to your itinerary");
  };
  
  const handleDeleteDay = () => {
    deleteDay(tripId, day.id);
    toast.success("Day removed from your trip");
  };
  
  return (
    <Card>
      <div className="p-4 pb-0 flex justify-between items-start">
        <h2 className="text-xl font-semibold">
          {format(new Date(day.date), "EEEE, MMMM dd, yyyy")}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteDay}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      <CardContent>
        <div className="space-y-4">
          {day.cities.length > 0 ? (
            day.cities.map((city) => (
              <CityCard key={city.id} tripId={tripId} dayId={day.id} city={city} />
            ))
          ) : (
            <div className="text-center py-4 bg-muted/30 rounded">
              <p className="text-muted-foreground">No cities added yet</p>
            </div>
          )}
          
          <form onSubmit={handleAddCity} className="flex gap-2 pt-2">
            <Input
              placeholder="Add a city (e.g., Paris)"
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" className="bg-travel-secondary hover:bg-travel-secondary/90">
              <Plus className="h-4 w-4 mr-2" /> Add City
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

interface CityCardProps {
  tripId: string;
  dayId: string;
  city: {
    id: string;
    name: string;
    places: {
      id: string;
      name: string;
      order: number;
    }[];
  };
}

const CityCard: React.FC<CityCardProps> = ({ tripId, dayId, city }) => {
  const { addPlace, deleteCity } = useTrip();
  const [newPlaceName, setNewPlaceName] = useState('');
  
  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName.trim()) {
      toast.error("Please enter a place name");
      return;
    }
    
    addPlace(tripId, dayId, city.id, newPlaceName);
    setNewPlaceName('');
    toast.success("Place added to your itinerary");
  };
  
  const handleDeleteCity = () => {
    deleteCity(tripId, dayId, city.id);
    toast.success("City removed from your itinerary");
  };
  
  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-travel-primary" />
          {city.name}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDeleteCity}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      {city.places.length > 0 ? (
        <div className="space-y-2 mb-4">
          <PlaceList tripId={tripId} dayId={dayId} cityId={city.id} places={city.places} />
        </div>
      ) : (
        <div className="text-center py-3 bg-background rounded mb-4">
          <p className="text-muted-foreground text-sm">No places added yet</p>
        </div>
      )}
      
      <form onSubmit={handleAddPlace} className="flex gap-2">
        <Input
          placeholder="Add a place to visit (e.g., Eiffel Tower)"
          value={newPlaceName}
          onChange={(e) => setNewPlaceName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" className="border-travel-secondary text-travel-secondary">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>
    </div>
  );
};

interface PlaceListProps {
  tripId: string;
  dayId: string;
  cityId: string;
  places: {
    id: string;
    name: string;
    order: number;
  }[];
}

const PlaceList: React.FC<PlaceListProps> = ({ tripId, dayId, cityId, places }) => {
  const { reorderPlace, deletePlace } = useTrip();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('placeId', id);
    setDraggingId(id);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    const draggedId = e.dataTransfer.getData('placeId');
    if (draggedId === targetId) return;
    
    const draggedIndex = places.findIndex(place => place.id === draggedId);
    const targetIndex = places.findIndex(place => place.id === targetId);
    
    reorderPlace(tripId, dayId, cityId, draggedId, targetIndex);
    setDraggingId(null);
  };
  
  const handleDragEnd = () => {
    setDraggingId(null);
  };
  
  const handleDeletePlace = (placeId: string) => {
    deletePlace(tripId, dayId, cityId, placeId);
    toast.success("Place removed from your itinerary");
  };

  const sortedPlaces = [...places].sort((a, b) => a.order - b.order);

  return (
    <div className="timeline-container">
      <div className="timeline-line"></div>
      
      <div className="space-y-2">
        {sortedPlaces.map((place, index) => (
          <div
            key={place.id}
            draggable
            onDragStart={(e) => handleDragStart(e, place.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, place.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 p-2 pl-0 place-item transition-all ${draggingId === place.id ? 'opacity-50' : ''}`}
          >
            <div className="timeline-dot">{index + 1}</div>
            <div className="flex-1 bg-background p-3 rounded-lg shadow-sm flex justify-between items-center">
              <span>{place.name}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeletePlace(place.id)}
                className="h-8 w-8 opacity-60 hover:opacity-100 hover:text-destructive"
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripDetails;
