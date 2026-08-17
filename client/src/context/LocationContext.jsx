import React, { createContext, useContext, useState } from 'react';
import { reverseGeocode } from '../api/location';

const LocationContext = createContext();

const makeLocationLabel = (area, city) => {
  const a = String(area || '').trim();
  const c = String(city || '').trim();
  if (a && c && a.toLowerCase() !== c.toLowerCase()) return `${a}, ${c}`;
  return a || c;
};

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState(null);
  const [areaText, setAreaText] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const requestLocation = () => new Promise((resolve) => {
    setLoading(true);
    setErrorMsg('');

    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setErrorMsg('GPS के लिए वेबसाइट को HTTPS या localhost पर खोलें।');
      setLoading(false);
      resolve(null);
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('आपके ब्राउज़र में GPS सुविधा नहीं है।');
      setLoading(false);
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const c = {
          lat: Number(position.coords.latitude),
          long: Number(position.coords.longitude)
        };
        setCoords(c);

        try {
          const geo = await reverseGeocode(c.lat, c.long);
          const nextArea = geo.area || '';
          const nextCity = geo.city || '';
          const nextState = geo.state || '';

          // Return the geocoded data together with coordinates so callers
          // do not have to wait for React state updates.
          c.area = nextArea;
          c.city = nextCity;
          c.state = nextState;
          c.displayName = geo.displayName || makeLocationLabel(nextArea, nextCity);

          setAreaText(makeLocationLabel(nextArea, nextCity));
          setCity(nextCity);
          setState(nextState);
          setDisplayName(c.displayName);
        } catch (e) {
          console.warn('Reverse geocoding failed:', e.message);
          setErrorMsg('GPS मिल गई, लेकिन इलाके/शहर का नाम नहीं मिल पाया। नाम हाथ से भर सकते हैं।');
        }

        setLoading(false);
        resolve(c);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        const msg = err.code === 1
          ? 'Location permission बंद है। Browser settings में Location → Allow करें।'
          : err.code === 2
            ? 'Location उपलब्ध नहीं है। GPS/Location चालू करके फिर कोशिश करें।'
            : 'लोकेशन नहीं मिल पाई। कृपया दोबारा कोशिश करें।';
        setErrorMsg(msg);
        setLoading(false);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    );
  });

  return (
    <LocationContext.Provider value={{
      coords, setCoords,
      areaText, setAreaText,
      city, setCity,
      state, setState,
      displayName, setDisplayName,
      loading, errorMsg,
      requestLocation,
      makeLocationLabel
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationState = () => useContext(LocationContext);
