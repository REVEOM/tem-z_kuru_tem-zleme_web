import { useContext } from 'react';
import { SettingsContext } from './settingsTypes';
import type { SettingsContextType } from './settingsTypes';

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
