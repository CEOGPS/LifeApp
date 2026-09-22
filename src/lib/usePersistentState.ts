// src/lib/usePersistentState.ts
// Persistent state hook with localStorage sync

import { useState, useEffect, useCallback } from "react";

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use provided initial value
  const getStoredValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : (initialValue instanceof Function ? initialValue() : initialValue);
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Update localStorage when state changes
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export function clearPersistentState(key: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}