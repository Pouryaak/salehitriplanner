
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin } from "lucide-react";

export interface LocationResult {
  name: string;
  fullAddress?: string; // Added to store the full address
  lat?: number;
  lng?: number;
}

interface AddressSearchProps {
  onAddressSelect: (location: LocationResult) => void;
  placeholder?: string;
}

interface AddressSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, placeholder = "Search for a place..." }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchAddressSuggestions = async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'SalehiTripPlanner/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setSuggestions(data);
      setIsOpen(data.length > 0);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.trim().length >= 3) {
      debounceTimeout.current = setTimeout(() => {
        fetchAddressSuggestions(query);
      }, 500);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleSelectAddress = (address: AddressSuggestion) => {
    onAddressSelect({
      name: address.display_name,
      fullAddress: address.display_name, // Store full address
      lat: parseFloat(address.lat),
      lng: parseFloat(address.lon)
    });
    setIsOpen(false);
    setSuggestions([]);
    setQuery(''); // Clear the input after selection
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      {suggestions.length > 0 && (
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.place_id}
                variant="ghost"
                className="w-full justify-start text-left py-3 px-4 hover:bg-muted/50 border-b last:border-0"
                onClick={() => handleSelectAddress(suggestion)}
              >
                <MapPin className="h-4 w-4 mr-2 text-travel-primary shrink-0" />
                <span className="text-sm truncate">{suggestion.display_name}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};

export default AddressSearch;
