import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  MoreVert,
  Star,
  StarBorder,
} from '@mui/icons-material';

interface AccessibleCardProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
  avatar?: string;
  tags?: string[];
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }>;
  onClick?: () => void;
  onFavorite?: (isFavorite: boolean) => void;
  isFavorite?: boolean;
  isSelected?: boolean;
  isDraggable?: boolean;
  ariaLabel?: string;
  className?: string;
}

const AccessibleCard: React.FC<AccessibleCardProps> = ({
  id,
  title,
  subtitle,
  description,
  status,
  priority,
  avatar,
  tags = [],
  actions = [],
  onClick,
  onFavorite,
  isFavorite = false,
  isSelected = false,
  isDraggable = false,
  ariaLabel,
  className,
}) => {
  const theme = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [announceText, setAnnounceText] = useState('');
  const [focusedActionIndex, setFocusedActionIndex] = useState(-1);

  // Generate accessible labels and descriptions
  const cardAriaLabel = ariaLabel || `${title}${subtitle ? `, ${subtitle}` : ''}${status ? `, status: ${status}` : ''}`;
  const cardDescriptionId = `card-${id}-description`;
  const cardActionsId = `card-${id}-actions`;
  
  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key, ctrlKey, metaKey } = event;
    
    switch (key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (onClick) {
          onClick();
          setAnnounceText(`Opened ${title}`);
        }
        break;
        
      case 'f':
        if (ctrlKey || metaKey) {
          event.preventDefault();
          if (onFavorite) {
            const newFavoriteState = !isFavorite;
            onFavorite(newFavoriteState);
            setAnnounceText(`${title} ${newFavoriteState ? 'added to' : 'removed from'} favorites`);
          }
        }
        break;
        
      case 'ArrowRight':
        if (actions.length > 0) {
          event.preventDefault();
          setFocusedActionIndex(0);
          setAnnounceText('Navigating to card actions');
        }
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedActionIndex(-1);
        cardRef.current?.focus();
        break;
        
      case 'ArrowDown':
        if (focusedActionIndex >= 0 && focusedActionIndex < actions.length - 1) {
          event.preventDefault();
          setFocusedActionIndex(focusedActionIndex + 1);
        }
        break;
        
      case 'ArrowUp':
        if (focusedActionIndex > 0) {
          event.preventDefault();
          setFocusedActionIndex(focusedActionIndex - 1);
        }
        break;
        
      case 'Escape':
        setFocusedActionIndex(-1);
        setMenuAnchorEl(null);
        cardRef.current?.focus();
        break;
    }
  }, [onClick, onFavorite, isFavorite, title, actions.length, focusedActionIndex]);

  // Handle menu operations
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setAnnounceText('Menu opened');
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setAnnounceText('Menu closed');
  };

  const handleActionClick = (action: any) => {
    action.onClick();
    setMenuAnchorEl(null);
    setAnnounceText(`${action.label} action executed for ${title}`);
  };

  const handleFavoriteToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onFavorite) {
      const newFavoriteState = !isFavorite;
      onFavorite(newFavoriteState);
      setAnnounceText(`${title} ${newFavoriteState ? 'added to' : 'removed from'} favorites`);
    }
  };

  // Auto-announce important state changes
  useEffect(() => {
    if (announceText) {
      const timer = setTimeout(() => setAnnounceText(''), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [announceText]);

  // Focus management for keyboard navigation
  useEffect(() => {
    if (focusedActionIndex >= 0) {
      const actionButton = document.querySelector(`[data-action-index="${focusedActionIndex}"]`) as HTMLElement;
      actionButton?.focus();
    }
  }, [focusedActionIndex]);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  return (
    <>
      <Card
        ref={cardRef}
        className={className}
        tabIndex={0}
        role="article"
        aria-label={cardAriaLabel}
        aria-describedby={description ? cardDescriptionId : undefined}
        aria-selected={isSelected}
        draggable={isDraggable}
        onKeyDown={handleKeyDown}
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          '&:hover': onClick ? {
            boxShadow: theme.shadows[4],
            borderColor: 'primary.light',
          } : {},
          '&:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <CardContent>
          {/* Header with avatar and title */}
          <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
            {avatar && (
              <Avatar
                src={avatar}
                alt={`${title} avatar`}
                sx={{ width: 40, height: 40 }}
              >
                {title.charAt(0).toUpperCase()}
              </Avatar>
            )}
            
            <Box flexGrow={1} minWidth={0}>
              <Typography
                variant="h6"
                component="h3"
                noWrap
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              >
                {title}
              </Typography>
              
              {subtitle && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                >
                  {subtitle}
                </Typography>
              )}
            </Box>

            {/* Favorite button */}
            {onFavorite && (
              <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                <IconButton
                  size="small"
                  onClick={handleFavoriteToggle}
                  aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  sx={{ color: isFavorite ? 'warning.main' : 'action.disabled' }}
                >
                  {isFavorite ? <Star /> : <StarBorder />}
                </IconButton>
              </Tooltip>
            )}

            {/* Actions menu */}
            {actions.length > 0 && (
              <Tooltip title="More actions">
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  aria-label="More actions"
                  aria-controls={menuAnchorEl ? cardActionsId : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuAnchorEl ? 'true' : 'false'}
                >
                  <MoreVert />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Description */}
          {description && (
            <Typography
              id={cardDescriptionId}
              variant="body2"
              color="text.secondary"
              paragraph
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {description}
            </Typography>
          )}

          {/* Status and Priority */}
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            {status && (
              <Chip
                label={status}
                size="small"
                color={getStatusColor(status) as any}
                aria-label={`Status: ${status}`}
              />
            )}
            
            {priority && (
              <Chip
                label={`${priority} priority`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: getPriorityColor(priority),
                  color: getPriorityColor(priority),
                }}
                aria-label={`Priority: ${priority}`}
              />
            )}
          </Box>

          {/* Tags */}
          {tags.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={0.5}>
              {tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
          )}
        </CardContent>

        {/* Quick actions */}
        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
          <Box display="flex" gap={0.5}>
            {actions.slice(0, 3).map((action, index) => (
              <Tooltip key={index} title={action.label}>
                <span>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActionClick(action);
                    }}
                    disabled={action.disabled}
                    aria-label={action.label}
                    data-action-index={index}
                  >
                    {action.icon}
                  </IconButton>
                </span>
              </Tooltip>
            ))}
          </Box>

          {/* Keyboard shortcuts hint */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: '0.7rem', opacity: 0.7 }}
          >
            Enter to open • Ctrl+F to favorite
          </Typography>
        </CardActions>
      </Card>

      {/* Actions menu */}
      <Menu
        id={cardActionsId}
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': 'more-actions-button',
          role: 'menu',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {actions.map((action, index) => (
          <MenuItem
            key={index}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
            role="menuitem"
          >
            <Box display="flex" alignItems="center" gap={1}>
              {action.icon}
              <Typography variant="body2">{action.label}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        // TODO: Convert // TODO: Convert className="sr-only" to sx prop to sx prop
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announceText}
      </div>
    </>
  );
};

export default AccessibleCard;