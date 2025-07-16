import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Alert,
  LinearProgress,
  TextField,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Language,
  Translate,
  CheckCircle,
  Warning,
  Edit,
  Add,
  Download,
  Upload,
  Sync,
  Settings,
} from '@mui/icons-material';

// Internationalization types
interface Translation {
  key: string;
  value: string;
  category: string;
  status: 'translated' | 'pending' | 'needs_review';
  lastModified: string;
  translator?: string;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  completionPercentage: number;
  enabled: boolean;
}

interface I18nContextType {
  currentLanguage: string;
  availableLanguages: Language[];
  translations: Record<string, Record<string, string>>;
  setLanguage: (languageCode: string) => void;
  t: (key: string, params?: Record<string, any>) => string;
  isRTL: boolean;
}

// Default languages
const defaultLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
    completionPercentage: 100,
    enabled: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
    completionPercentage: 85,
    enabled: true,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
    completionPercentage: 72,
    enabled: true,
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    rtl: false,
    completionPercentage: 68,
    enabled: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
    completionPercentage: 45,
    enabled: false,
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    rtl: false,
    completionPercentage: 30,
    enabled: false,
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    rtl: false,
    completionPercentage: 25,
    enabled: false,
  },
];

// Sample translations
const sampleTranslations: Record<string, Record<string, string>> = {
  en: {
    'app.title': 'Agent Management System',
    'nav.dashboard': 'Dashboard',
    'nav.leads': 'Leads',
    'nav.analytics': 'Analytics',
    'nav.settings': 'Settings',
    'leads.title': 'Lead Management',
    'leads.create': 'Create Lead',
    'leads.search': 'Search leads...',
    'leads.status.active': 'Active',
    'leads.status.qualified': 'Qualified',
    'leads.status.closed': 'Closed',
    'leads.priority.high': 'High Priority',
    'leads.priority.medium': 'Medium Priority',
    'leads.priority.low': 'Low Priority',
    'actions.save': 'Save',
    'actions.cancel': 'Cancel',
    'actions.delete': 'Delete',
    'actions.edit': 'Edit',
    'messages.success': 'Operation completed successfully',
    'messages.error': 'An error occurred',
    'messages.loading': 'Loading...',
  },
  es: {
    'app.title': 'Sistema de Gestión de Agentes',
    'nav.dashboard': 'Panel',
    'nav.leads': 'Prospectos',
    'nav.analytics': 'Análisis',
    'nav.settings': 'Configuración',
    'leads.title': 'Gestión de Prospectos',
    'leads.create': 'Crear Prospecto',
    'leads.search': 'Buscar prospectos...',
    'leads.status.active': 'Activo',
    'leads.status.qualified': 'Calificado',
    'leads.status.closed': 'Cerrado',
    'leads.priority.high': 'Alta Prioridad',
    'leads.priority.medium': 'Prioridad Media',
    'leads.priority.low': 'Baja Prioridad',
    'actions.save': 'Guardar',
    'actions.cancel': 'Cancelar',
    'actions.delete': 'Eliminar',
    'actions.edit': 'Editar',
    'messages.success': 'Operación completada exitosamente',
    'messages.error': 'Ocurrió un error',
    'messages.loading': 'Cargando...',
  },
  fr: {
    'app.title': 'Système de Gestion d\'Agents',
    'nav.dashboard': 'Tableau de bord',
    'nav.leads': 'Prospects',
    'nav.analytics': 'Analyses',
    'nav.settings': 'Paramètres',
    'leads.title': 'Gestion des Prospects',
    'leads.create': 'Créer un Prospect',
    'leads.search': 'Rechercher des prospects...',
    'leads.status.active': 'Actif',
    'leads.status.qualified': 'Qualifié',
    'leads.status.closed': 'Fermé',
    'actions.save': 'Enregistrer',
    'actions.cancel': 'Annuler',
    'actions.delete': 'Supprimer',
    'actions.edit': 'Modifier',
    'messages.success': 'Opération terminée avec succès',
    'messages.error': 'Une erreur s\'est produite',
    'messages.loading': 'Chargement...',
  },
};

// I18n Context
const I18nContext = createContext<I18nContextType | null>(null);

// I18n Provider
export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState(defaultLanguages);
  const [translations, setTranslations] = useState(sampleTranslations);

  const setLanguage = useCallback((languageCode: string) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('app-language', languageCode);
    
    // Update document direction for RTL languages
    const language = availableLanguages.find(lang => lang.code === languageCode);
    if (language?.rtl) {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [availableLanguages]);

  const t = useCallback((key: string, params?: Record<string, any>): string => {
    let translation = translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
      });
    }
    
    return translation;
  }, [currentLanguage, translations]);

  const isRTL = availableLanguages.find(lang => lang.code === currentLanguage)?.rtl || false;

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language');
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, [availableLanguages, setLanguage]);

  return (
    <I18nContext.Provider
      value={{
        currentLanguage,
        availableLanguages,
        translations,
        setLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

// Hook to use I18n
export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

// Language selector component
export const LanguageSelector: React.FC = () => {
  const { currentLanguage, availableLanguages, setLanguage } = useI18n();

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value)}
        displayEmpty
        startAdornment={<Language sx={{ mr: 1, fontSize: 20 }} />}
      >
        {availableLanguages
          .filter(lang => lang.enabled)
          .map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box display="flex" alignItems="center" gap={1}>
                <span>{language.flag}</span>
                <span>{language.nativeName}</span>
              </Box>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

// Translation management interface
interface InternationalizationSystemProps {
  onClose?: () => void;
}

const InternationalizationSystem: React.FC<InternationalizationSystemProps> = ({ onClose }) => {
  const { availableLanguages, currentLanguage, translations, t } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [translationDialogOpen, setTranslationDialogOpen] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Generate translation list for management
  const getTranslationList = (languageCode: string): Translation[] => {
    const langTranslations = translations[languageCode] || {};
    const enTranslations = translations['en'] || {};
    
    return Object.keys(enTranslations).map(key => ({
      key,
      value: langTranslations[key] || '',
      category: key.split('.')[0],
      status: langTranslations[key] ? 'translated' : 'pending',
      lastModified: new Date().toISOString(),
      translator: 'System',
    }));
  };

  const translationList = getTranslationList(selectedLanguage);
  const completionRate = (translationList.filter(t => t.status === 'translated').length / translationList.length) * 100;

  const handleImportTranslations = async () => {
    setIsImporting(true);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsImporting(false);
  };

  const handleExportTranslations = () => {
    const dataStr = JSON.stringify(translations[selectedLanguage], null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translations-${selectedLanguage}.json`;
    link.click();
  };

  const TranslationEditDialog = () => (
    <Dialog
      open={translationDialogOpen}
      onClose={() => setTranslationDialogOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Edit Translation
      </DialogTitle>
      <DialogContent>
        {editingTranslation && (
          <Box>
            <TextField
              fullWidth
              label="Translation Key"
              value={editingTranslation.key}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="English (Source)"
              value={translations['en']?.[editingTranslation.key] || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={`Translation (${selectedLanguage.toUpperCase()})`}
              value={editingTranslation.value}
              onChange={(e) => setEditingTranslation({
                ...editingTranslation,
                value: e.target.value,
              })}
              multiline
              rows={3}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setTranslationDialogOpen(false)}>
          Cancel
        </Button>
        <Button variant="contained" onClick={() => setTranslationDialogOpen(false)}>
          Save Translation
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" display="flex" alignItems="center" gap={1}>
              <Language />
              Internationalization System
            </Typography>
            <LanguageSelector />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            Manage translations and language settings for the application
          </Typography>
        </CardContent>
      </Card>

      {/* Language Management */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Languages
          </Typography>
          
          <List>
            {availableLanguages.map((language) => (
              <ListItem key={language.code}>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                      <span>({language.nativeName})</span>
                      {language.rtl && <Chip label="RTL" size="small" />}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <LinearProgress
                        variant="determinate"
                        value={language.completionPercentage}
                        sx={{ my: 1 }}
                      />
                      <Typography variant="caption">
                        {language.completionPercentage}% complete
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <FormControlLabel
                      control={<Switch checked={language.enabled} />}
                      label=""
                    />
                    <Button
                      size="small"
                      onClick={() => setSelectedLanguage(language.code)}
                      variant={selectedLanguage === language.code ? 'contained' : 'outlined'}
                    >
                      Manage
                    </Button>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Translation Management */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Translations for {availableLanguages.find(l => l.code === selectedLanguage)?.name}
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                startIcon={<Upload />}
                onClick={handleImportTranslations}
                disabled={isImporting}
              >
                Import
              </Button>
              <Button
                startIcon={<Download />}
                onClick={handleExportTranslations}
              >
                Export
              </Button>
              <Button
                startIcon={<Sync />}
                color="primary"
              >
                Auto Translate
              </Button>
            </Box>
          </Box>

          {isImporting && (
            <Box mb={2}>
              <LinearProgress />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Importing translations...
              </Typography>
            </Box>
          )}

          {/* Completion status */}
          <Alert
            severity={completionRate === 100 ? 'success' : completionRate > 50 ? 'warning' : 'error'}
            sx={{ mb: 2 }}
          >
            Translation completion: {completionRate.toFixed(1)}% 
            ({translationList.filter(t => t.status === 'translated').length} of {translationList.length} keys)
          </Alert>

          {/* Translation list */}
          <List>
            {translationList.map((translation, index) => (
              <Box key={translation.key}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <code>{translation.key}</code>
                        <Chip
                          label={translation.category}
                          size="small"
                          variant="outlined"
                        />
                        {translation.status === 'translated' ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Warning color="warning" fontSize="small" />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          EN: {translations['en']?.[translation.key]}
                        </Typography>
                        <Typography variant="body2">
                          {selectedLanguage.toUpperCase()}: {translation.value || 'Not translated'}
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit Translation">
                      <IconButton
                        edge="end"
                        onClick={() => {
                          setEditingTranslation(translation);
                          setTranslationDialogOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < translationList.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Translation Edit Dialog */}
      <TranslationEditDialog />
    </Box>
  );
};

export default InternationalizationSystem;