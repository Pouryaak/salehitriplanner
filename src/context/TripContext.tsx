import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, Day, City, Place } from '@/types/trip';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isSameDay, format } from 'date-fns';
import { LocationResult } from '@/components/trip/AddressSearch';

interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  createTrip: (name: string, startDate: Date, endDate: Date) => Trip;
  addDay: (tripId: string, date: Date) => Day | undefined;
  addCity: (tripId: string, dayId: string, locationInfo: LocationResult) => City | undefined;
  addPlace: (tripId: string, dayId: string, cityId: string, locationInfo: LocationResult) => Place | undefined;
  reorderPlace: (tripId: string, dayId: string, cityId: string, placeId: string, newOrder: number) => void;
  deletePlace: (tripId: string, dayId: string, cityId: string, placeId: string) => void;
  deleteCity: (tripId: string, dayId: string, cityId: string) => void;
  deleteDay: (tripId: string, dayId: string) => void;
  deleteTrip: (tripId: string) => void;
  selectTrip: (tripId: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider = ({ children }: { children: React.ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);

  // Load data from localStorage on initial load
  useEffect(() => {
    const savedTrips = localStorage.getItem('trips');
    if (savedTrips) {
      try {
        const parsedTrips = JSON.parse(savedTrips, (key, value) => {
          // Convert date strings back to Date objects
          if (key === 'date' || key === 'startDate' || key === 'endDate') {
            return new Date(value);
          }
          return value;
        });
        setTrips(parsedTrips);
      } catch (e) {
        console.error('Error parsing saved trips', e);
      }
    }
  }, []);

  // Save data to localStorage whenever trips change
  useEffect(() => {
    localStorage.setItem('trips', JSON.stringify(trips));
  }, [trips]);

  // Create a new trip
  const createTrip = (name: string, startDate: Date, endDate: Date): Trip => {
    const newTrip: Trip = {
      id: uuidv4(),
      name,
      startDate,
      endDate,
      days: [],
    };
    setTrips([...trips, newTrip]);
    setCurrentTrip(newTrip);
    return newTrip;
  };

  // Add a day to a trip
  const addDay = (tripId: string, date: Date): Day | undefined => {
    const newDay: Day = {
      id: uuidv4(),
      date,
      cities: [],
    };

    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          // Check if day with this date already exists
          const dayExists = trip.days.some(day => isSameDay(day.date, date));
          if (dayExists) {
            return trip;
          }
          const updatedDays = [...trip.days, newDay].sort((a, b) => a.date.getTime() - b.date.getTime());
          const updatedTrip = { ...trip, days: updatedDays };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });

    return newDay;
  };

  // Add a city to a day
  const addCity = (tripId: string, dayId: string, locationInfo: LocationResult): City | undefined => {
    const newCity: City = {
      id: uuidv4(),
      name: locationInfo.name,
      places: [],
      fullAddress: locationInfo.fullAddress || locationInfo.name, // Store full address
    };

    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedDays = trip.days.map(day => {
            if (day.id === dayId) {
              // Check if city already exists
              const cityExists = day.cities.some(city => city.name.toLowerCase() === locationInfo.name.toLowerCase());
              if (cityExists) {
                return day;
              }
              return { ...day, cities: [...day.cities, newCity] };
            }
            return day;
          });
          const updatedTrip = { ...trip, days: updatedDays };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });

    return newCity;
  };

  // Add a place to a city
  const addPlace = (tripId: string, dayId: string, cityId: string, locationInfo: LocationResult): Place | undefined => {
    let maxOrder = -1;
    
    // Find the current max order for places in this city
    trips.forEach(trip => {
      if (trip.id === tripId) {
        trip.days.forEach(day => {
          if (day.id === dayId) {
            day.cities.forEach(city => {
              if (city.id === cityId) {
                city.places.forEach(place => {
                  if (place.order > maxOrder) {
                    maxOrder = place.order;
                  }
                });
              }
            });
          }
        });
      }
    });

    const newPlace: Place = {
      id: uuidv4(),
      name: locationInfo.name,
      order: maxOrder + 1,
      lat: locationInfo.lat,
      lng: locationInfo.lng,
      fullAddress: locationInfo.fullAddress || locationInfo.name, // Store full address
    };

    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedDays = trip.days.map(day => {
            if (day.id === dayId) {
              const updatedCities = day.cities.map(city => {
                if (city.id === cityId) {
                  return { ...city, places: [...city.places, newPlace].sort((a, b) => a.order - b.order) };
                }
                return city;
              });
              return { ...day, cities: updatedCities };
            }
            return day;
          });
          const updatedTrip = { ...trip, days: updatedDays };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });

    return newPlace;
  };

  // Reorder a place within a city
  const reorderPlace = (tripId: string, dayId: string, cityId: string, placeId: string, newOrder: number) => {
    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedDays = trip.days.map(day => {
            if (day.id === dayId) {
              const updatedCities = day.cities.map(city => {
                if (city.id === cityId) {
                  let places = [...city.places];
                  const placeIndex = places.findIndex(place => place.id === placeId);
                  
                  if (placeIndex !== -1) {
                    const [removedPlace] = places.splice(placeIndex, 1);
                    places.splice(newOrder, 0, removedPlace);
                    
                    // Reassign order values to all places
                    places = places.map((place, index) => ({
                      ...place,
                      order: index
                    }));
                  }
                  
                  return { ...city, places };
                }
                return city;
              });
              return { ...day, cities: updatedCities };
            }
            return day;
          });
          const updatedTrip = { ...trip, days: updatedDays };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });
  };

  // Delete a place
  const deletePlace = (tripId: string, dayId: string, cityId: string, placeId: string) => {
    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedDays = trip.days.map(day => {
            if (day.id === dayId) {
              const updatedCities = day.cities.map(city => {
                if (city.id === cityId) {
                  const filteredPlaces = city.places.filter(place => place.id !== placeId);
                  // Reassign order values after deletion
                  const reorderedPlaces = filteredPlaces.map((place, index) => ({
                    ...place,
                    order: index
                  }));
                  return { ...city, places: reorderedPlaces };
                }
                return city;
              });
              return { ...day, cities: updatedCities };
            }
            return day;
          });
          const updatedTrip = { ...trip, days: updatedDays };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });
  };

  // Delete a city
  const deleteCity = (tripId: string, dayId: string, cityId: string) => {
    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedDays = trip.days.map(day => {
            if (day.id === dayId) {
              return { ...day, cities: day.cities.filter(city => city.id !== cityId) };
            }
            return day;
          });
          const updatedTrip = { ...trip, days: updatedDays };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });
  };

  // Delete a day
  const deleteDay = (tripId: string, dayId: string) => {
    setTrips(currentTrips => {
      return currentTrips.map(trip => {
        if (trip.id === tripId) {
          const updatedTrip = { ...trip, days: trip.days.filter(day => day.id !== dayId) };
          if (currentTrip?.id === tripId) {
            setCurrentTrip(updatedTrip);
          }
          return updatedTrip;
        }
        return trip;
      });
    });
  };

  // Delete a trip
  const deleteTrip = (tripId: string) => {
    setTrips(currentTrips => {
      const filtered = currentTrips.filter(trip => trip.id !== tripId);
      if (currentTrip?.id === tripId) {
        setCurrentTrip(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  // Select a trip
  const selectTrip = (tripId: string) => {
    const trip = trips.find(trip => trip.id === tripId);
    if (trip) {
      setCurrentTrip(trip);
    }
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        currentTrip,
        createTrip,
        addDay,
        addCity,
        addPlace,
        reorderPlace,
        deletePlace,
        deleteCity,
        deleteDay,
        deleteTrip,
        selectTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
