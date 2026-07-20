import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../src/services/api';

export interface Branch {
  id: string;
  name: string;
  code: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  contactNumber?: string;
  email?: string;
  workingHours?: string;
  availableSlots?: string[];
  homeCollection: boolean;
  labVisit: boolean;
  isActive: boolean;
}

interface UseBranchesOptions {
  collectionMode?: 'HOME' | 'LAB';
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useBranches(userLocation?: { latitude: number; longitude: number } | null, options?: UseBranchesOptions) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { isActive: true };
      if (options?.collectionMode === 'HOME') params.homeCollection = true;
      if (options?.collectionMode === 'LAB') params.labVisit = true;
      const res = await apiService.getBranches(params);
      setBranches(res.data || []);
    } catch {
      setError('Failed to load branches');
    } finally {
      setLoading(false);
    }
  }, [options?.collectionMode]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const filtered = branches
    .filter(b => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.pincode.includes(q) ||
        b.line1.toLowerCase().includes(q)
      );
    })
    .map(b => ({
      ...b,
      distance:
        userLocation && b.latitude && b.longitude
          ? getDistanceKm(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
          : null,
    }))
    .sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return 0;
    });

  return { branches: filtered, loading, error, search, setSearch, refetch: fetchBranches };
}