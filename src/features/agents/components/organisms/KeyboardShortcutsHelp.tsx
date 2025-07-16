import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Badge,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Keyboard,
  Close,
  Speed,
  Lightbulb,
  Star,
  FileCopy,
  Print,
} from '@mui/icons-material';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  shortcuts: Array<{
    keys: string[];
    description: string;
    category?: string;
    global?: boolean;
  }>;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose,
  shortcuts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Navigation']);

  // Group shortcuts by category
  const categorizedShortcuts = useMemo(() => {
    const filtered = shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.keys.some(key => key.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (shortcut.category || 'General').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped: Record<string, typeof filtered> = {};
    filtered.forEach(shortcut => {
      const category = shortcut.category || 'General';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(shortcut);
    });

    return grouped;
  }, [shortcuts, searchQuery]);

  // Get category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; global: number }> = {};
    Object.entries(categorizedShortcuts).forEach(([category, categoryShortcuts]) => {
      stats[category] = {
        total: categoryShortcuts.length,
        global: categoryShortcuts.filter(s => s.global).length,
      };
    });
    return stats;
  }, [categorizedShortcuts]);

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const expandAllCategories = () => {
    setExpandedCategories(Object.keys(categorizedShortcuts));
  };

  const collapseAllCategories = () => {
    setExpandedCategories([]);
  };

  const formatShortcutKey = (key: string) => {
    return key
      .split('+')
      .map(part => {
        // Capitalize first letter and handle special keys
        const specialKeys: Record<string, string> = {
          'ctrl': 'Ctrl',
          'cmd': '⌘',
          'alt': 'Alt',
          'shift': 'Shift',
          'space': 'Space',
          'enter': 'Enter',
          'escape': 'Esc',
          'tab': 'Tab',
          'up': '↑',
          'down': '↓',
          'left': '←',
          'right': '→',
        };
        return specialKeys[part.toLowerCase()] || part.toUpperCase();
      });
  };

  const copyShortcutsToClipboard = async () => {
    const text = Object.entries(categorizedShortcuts)
      .map(([category, categoryShortcuts]) => {
        const categoryText = `${category}:\n${categoryShortcuts
          .map(shortcut => `  ${shortcut.keys.join(' or ')} - ${shortcut.description}`)
          .join('\n')}`;
        return categoryText;
      })
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      console.log('Shortcuts copied to clipboard');
    } catch (error) {
      console.error('Failed to copy shortcuts:', error);
    }
  };

  const printShortcuts = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Keyboard Shortcuts</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1976d2; }
            h2 { color: #555; margin-top: 30px; }
            .shortcut { margin: 10px 0; padding: 8px; background: #f5f5f5; border-radius: 4px; }
            .keys { font-weight: bold; color: #1976d2; }
            .description { margin-left: 10px; }
            @media print {
              .shortcut { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <h1>Keyboard Shortcuts Reference</h1>
          ${Object.entries(categorizedShortcuts)
            .map(([category, categoryShortcuts]) => `
              <h2>${category}</h2>
              ${categoryShortcuts
                .map(shortcut => `
                  <div class="shortcut">
                    <span class="keys">${shortcut.keys.join(' or ')}</span>
                    <span class="description">${shortcut.description}</span>
                  </div>
                `)
                .join('')}
            `)
            .join('')}
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const ShortcutKeyChip = ({ keys }: { keys: string[] }) => (
    <Box display="flex" gap={0.5} flexWrap="wrap">
      {keys.map((keyCombo, index) => (
        <Box key={index} display="flex" alignItems="center" gap={0.5}>
          {index > 0 && (
            <Typography variant="caption" color="text.secondary">
              or
            </Typography>
          )}
          <Box display="flex" gap={0.25}>
            {formatShortcutKey(keyCombo).map((keyPart, partIndex) => (
              <Chip
                key={partIndex}
                label={keyPart}
                size="small"
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.400',
                }}
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Keyboard />
            <Typography variant="h6">Keyboard Shortcuts</Typography>
            <Badge badgeContent={shortcuts.length} color="primary">
              <Speed color="action" />
            </Badge>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Copy shortcuts">
              <IconButton size="small" onClick={copyShortcutsToClipboard}>
                <FileCopy />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print shortcuts">
              <IconButton size="small" onClick={printShortcuts}>
                <Print />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Search and controls */}
        <Box mb={3}>
          <TextField
            fullWidth
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={1}>
              <Button size="small" onClick={expandAllCategories}>
                Expand All
              </Button>
              <Button size="small" onClick={collapseAllCategories}>
                Collapse All
              </Button>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {shortcuts.length} shortcuts total
            </Typography>
          </Box>
        </Box>

        {/* Helpful tips */}
        <Alert severity="info" sx={{ mb: 3 }} icon={<Lightbulb />}>
          <Typography variant="body2">
            <strong>Pro tip:</strong> Press <Chip label="?" size="small" sx={{ mx: 0.5 }} /> 
            anywhere in the app to open this help dialog. Most shortcuts work globally.
          </Typography>
        </Alert>

        {/* Shortcuts by category */}
        {Object.entries(categorizedShortcuts).length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No shortcuts found matching "{searchQuery}"
            </Typography>
          </Box>
        ) : (
          Object.entries(categorizedShortcuts).map(([category, categoryShortcuts]) => (
            <Accordion
              key={category}
              expanded={expandedCategories.includes(category)}
              onChange={() => handleCategoryToggle(category)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display="flex" alignItems="center" gap={2} width="100%">
                  <Typography variant="h6">{category}</Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={`${categoryStats[category]?.total || 0} shortcuts`}
                      size="small"
                      variant="outlined"
                    />
                    {categoryStats[category]?.global > 0 && (
                      <Chip
                        label={`${categoryStats[category].global} global`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {categoryShortcuts.map((shortcut, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined" sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box display="flex" alignItems="flex-start" gap={2}>
                            <Box flexGrow={1}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {shortcut.description}
                                {shortcut.global && (
                                  <Chip
                                    label="Global"
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1, height: 16, fontSize: '0.7rem' }}
                                  />
                                )}
                              </Typography>
                              <ShortcutKeyChip keys={shortcut.keys} />
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))
        )}

        {/* Quick reference card */}
        <Card sx={{ mt: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Star />
              <Typography variant="h6">Most Used Shortcuts</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Search:</strong> Ctrl+K / ⌘K
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>New Lead:</strong> Ctrl+N / ⌘N
                </Typography>
                <Typography variant="body2">
                  <strong>Help:</strong> ?
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Dashboard:</strong> G then D
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Refresh:</strong> R
                </Typography>
                <Typography variant="body2">
                  <strong>Toggle Theme:</strong> Ctrl+Shift+T
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;