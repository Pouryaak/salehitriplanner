
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useTrip } from '@/context/TripContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DateRange } from "react-day-picker";
import AddressSearch, { LocationResult } from './AddressSearch';

interface CreateTripFormProps {
  onComplete: () => void;
}

const CreateTripForm: React.FC<CreateTripFormProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [destination, setDestination] = useState<LocationResult | null>(null);
  const { createTrip } = useTrip();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a trip name');
      return;
    }
    
    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Please select start and end dates');
      return;
    }
    
    createTrip(name, dateRange.from, dateRange.to);
    toast.success('Trip created successfully!');
    onComplete();
  };

  const handleDestinationSelect = (location: LocationResult) => {
    // Extract just the city name from the full address
    const cityName = extractCityName(location.name);
    
    // Update destination with just the city name
    setDestination({
      ...location,
      name: cityName
    });
  };

  // Extract city name from full address
  const extractCityName = (fullAddress: string): string => {
    // Most addresses from OpenStreetMap come in format "City, Region, Country"
    // Split by comma and take the first part
    const parts = fullAddress.split(',');
    if (parts.length > 0) {
      return parts[0].trim();
    }
    return fullAddress; // Fallback to full address if splitting fails
  };

  return (
    <Card className="w-full max-w-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Trip Name
            </label>
            <Input
              id="name"
              placeholder="Summer vacation in Europe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Destination
            </label>
            <AddressSearch 
              onAddressSelect={handleDestinationSelect}
              placeholder="Where are you heading? (e.g., Paris, France)"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Date Range
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, yyyy")} -{" "}
                        {format(dateRange.to, "LLL dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, yyyy")
                    )
                  ) : (
                    "Select date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <Button type="submit" className="w-full bg-travel-primary hover:bg-travel-primary/90">
            Create Trip
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTripForm;
