import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { configApi } from '../services/api';
import type { UiConfig, ActionLabelConfig, RiskLabelConfig } from '../types';

interface ConfigContextType {
  uiConfig: UiConfig | null;
  isLoading: boolean;
  getActionLabel: (action: string) => ActionLabelConfig;
  getRiskLabel: (level: string) => RiskLabelConfig;
  getFallbackMessage: () => string;
}

// Default configs for fallback
const defaultActionLabels: Record<string, ActionLabelConfig> = {
  DATA_USAGE_WARNING: { label: 'Veri Uyarısı', color: 'blue', title: 'İnternet Kullanım Uyarısı', defaultMessage: 'Günlük internet kullanımınız yüksek seviyeye ulaştı.' },
  DATA_USAGE_NUDGE: { label: 'Veri Hatırlatması', color: 'cyan', title: 'İnternet Kullanım Bildirimi', defaultMessage: 'İnternet kullanımınız artıyor.' },
  SPEND_ALERT: { label: 'Harcama Uyarısı', color: 'orange', title: 'Harcama Uyarısı', defaultMessage: 'Bugünkü harcamalarınız belirlenen limiti aştı.' },
  SPEND_NUDGE: { label: 'Harcama Hatırlatması', color: 'amber', title: 'Harcama Bildirimi', defaultMessage: 'Harcamalarınız orta seviyede.' },
  CONTENT_SUGGESTION: { label: 'İçerik Önerisi', color: 'purple', title: 'İçerik Önerisi', defaultMessage: 'Yoğun içerik tüketimi yaptınız.' },
  CONTENT_COOLDOWN_SUGGESTION: { label: 'Mola Önerisi', color: 'pink', title: 'Mola Önerisi', defaultMessage: 'Uzun süredir içerik tüketiyorsunuz.' },
  CRITICAL_ALERT: { label: 'Kritik Uyarı', color: 'red', title: 'Kritik Uyarı!', defaultMessage: 'Kullanımınız kritik seviyede.' },
};

const defaultRiskLabels: Record<string, RiskLabelConfig> = {
  LOW: { label: 'Düşük', color: 'green' },
  MEDIUM: { label: 'Orta', color: 'yellow' },
  HIGH: { label: 'Yüksek', color: 'orange' },
  CRITICAL: { label: 'Kritik', color: 'red' },
};

const defaultFallbackMessage = 'Hesabınızla ilgili bir güncelleme var.';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [uiConfig, setUiConfig] = useState<UiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await configApi.getUiConfig();
        setUiConfig(config);
      } catch (error) {
        console.error('Failed to fetch UI config:', error);
        // Use defaults on error
        setUiConfig({
          actionLabels: defaultActionLabels,
          riskLabels: defaultRiskLabels,
          fallbackMessage: defaultFallbackMessage,
          defaultNotificationTitle: 'Bildirim',
          defaultNotificationMessage: 'Turkcell size önemli bir bildirim gönderiyor.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const getActionLabel = (action: string): ActionLabelConfig => {
    if (uiConfig?.actionLabels?.[action]) {
      return uiConfig.actionLabels[action];
    }
    return defaultActionLabels[action] || { 
      label: action, 
      color: 'slate', 
      title: 'Bildirim', 
      defaultMessage: defaultFallbackMessage 
    };
  };

  const getRiskLabel = (level: string): RiskLabelConfig => {
    if (uiConfig?.riskLabels?.[level]) {
      return uiConfig.riskLabels[level];
    }
    return defaultRiskLabels[level] || { label: level, color: 'slate' };
  };

  const getFallbackMessage = (): string => {
    return uiConfig?.fallbackMessage || defaultFallbackMessage;
  };

  return (
    <ConfigContext.Provider value={{
      uiConfig,
      isLoading,
      getActionLabel,
      getRiskLabel,
      getFallbackMessage,
    }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
