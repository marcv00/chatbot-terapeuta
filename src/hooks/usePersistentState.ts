// src/hooks/usePersistentState.ts
import { useState } from "react";

export function usePersistentState<T>(key: string, defaultValue: T) {
    const [state, setState] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    });

    const setPersistentState = (value: T | ((prev: T) => T)) => {
        setState((prev) => {
            const newValue =
                typeof value === "function" ? (value as any)(prev) : value;
            localStorage.setItem(key, JSON.stringify(newValue));
            return newValue;
        });
    };

    return [state, setPersistentState] as const;
}
