import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box,
  Drawer,
  SwipeableDrawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Fab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Button,
  TextField,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
  Slide,
  Collapse,
} from '@mui/material';
import {
  Menu,
  Close,
  Add,
  Phone,
  Message,
  Email,
  Share,
  FilterList,
  Sort,
  Search,
  Notifications,
  MoreVert,
  SwipeUp,
  TouchApp,
  PanTool,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';

interface Lead {
  id: string;
  name: string;
  company: string;
  status: string;
  avatar?: string;
  lastContact: string;
  priority: 'high' | 'medium' | 'low';
}

interface MobileFeaturesProps {
  leads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  onCall: (lead: Lead) => void;
  onMessage: (lead: Lead) => void;
  onEmail: (lead: Lead) => void;
}

const MobileFeatures: React.FC<MobileFeaturesProps> = ({
  leads,
  onLeadSelect,
  onCall,
  onMessage,
  onEmail,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Mobile state management
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [pullToRefreshActive, setPullToRefreshActive] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Touch gesture handling
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (selectedLead) {
        // Swipe left to archive/dismiss
        console.log('Swipe left to archive:', selectedLead.name);
      }
    },
    onSwipedRight: () => {
      if (selectedLead) {
        // Swipe right to favorite/priority
        console.log('Swipe right to favorite:', selectedLead.name);
      }
    },
    onSwipedUp: () => {
      // Swipe up to show quick actions
      setSpeedDialOpen(true);
    },
    onSwipedDown: (eventData) => {
      if (eventData.initial[1] < 100) {
        // Pull to refresh when near top
        setPullToRefreshActive(true);
        setTimeout(() => {
          setPullToRefreshActive(false);
          console.log('Refreshing data...');
        }, 1500);
      }
    },
    trackMouse: true,
  });

  // Long press handling
  const useLongPress = (callback: () => void, ms = 500) => {
    const [startLongPress, setStartLongPress] = useState(false);

    useEffect(() => {
      let timerId: NodeJS.Timeout;
      if (startLongPress) {
        timerId = setTimeout(callback, ms);
      } else {
        clearTimeout(timerId!);
      }

      return () => {
        clearTimeout(timerId);
      };
    }, [callback, ms, startLongPress]);

    return {
      onMouseDown: () => setStartLongPress(true),
      onMouseUp: () => setStartLongPress(false),
      onMouseLeave: () => setStartLongPress(false),
      onTouchStart: () => setStartLongPress(true),
      onTouchEnd: () => setStartLongPress(false),
    };
  };

  const handleLongPress = useCallback((lead: Lead) => {
    console.log('Long pressed:', lead.name);
    setSelectedLead(lead);
    setSpeedDialOpen(true);
  }, []);

  // Speed dial actions
  const speedDialActions = [
    { icon: <Phone />, name: 'Call', onClick: () => selectedLead && onCall(selectedLead) },
    { icon: <Message />, name: 'Message', onClick: () => selectedLead && onMessage(selectedLead) },
    { icon: <Email />, name: 'Email', onClick: () => selectedLead && onEmail(selectedLead) },
    { icon: <Share />, name: 'Share', onClick: () => console.log('Share lead') },
  ];

  // Mobile-optimized lead card with swipe actions
  const MobileLeadCard: React.FC<{ lead: Lead; index: number }> = ({ lead, index }) => {
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [isSwipingLeft, setIsSwipingLeft] = useState(false);
    const [isSwipingRight, setIsSwipingRight] = useState(false);

    const longPressProps = useLongPress(() => handleLongPress(lead));

    const cardSwipeHandlers = useSwipeable({
      onSwiping: (eventData) => {
        const offset = eventData.deltaX;
        setSwipeOffset(offset);
        setIsSwipingLeft(offset < -50);
        setIsSwipingRight(offset > 50);
      },
      onSwiped: () => {
        setSwipeOffset(0);
        setIsSwipingLeft(false);
        setIsSwipingRight(false);
      },
      onSwipedLeft: () => {
        if (Math.abs(swipeOffset) > 100) {
          console.log('Archive lead:', lead.name);
        }
      },
      onSwipedRight: () => {
        if (Math.abs(swipeOffset) > 100) {
          console.log('Mark as priority:', lead.name);
        }
      },
      trackMouse: true,
    });

    return (
      <Box
        {...cardSwipeHandlers}
        {...longPressProps}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          mb: 1,
        }}
      >
        {/* Swipe action backgrounds */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isSwipingLeft 
              ? 'linear-gradient(90deg, transparent, #f44336)'
              : isSwipingRight
              ? 'linear-gradient(270deg, transparent, #4caf50)'
              : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSwipingLeft ? 'flex-end' : 'flex-start',
            px: 2,
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          {isSwipingLeft && 'Archive'}
          {isSwipingRight && 'Priority'}
        </Box>

        {/* Card content */}
        <Card
          sx={{
            transform: `translateX(${swipeOffset}px)`,
            transition: swipeOffset === 0 ? 'transform 0.3s ease' : 'none',
            cursor: 'pointer',
          }}
          onClick={() => onLeadSelect(lead)}
        >
          <CardContent sx={{ py: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={lead.avatar}>
                {lead.name.charAt(0)}
              </Avatar>
              
              <Box flexGrow={1}>
                <Typography variant="subtitle1" noWrap>
                  {lead.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {lead.company}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Chip
                    label={lead.status}
                    size="small"
                    color={lead.priority === 'high' ? 'error' : 'default'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {lead.lastContact}
                  </Typography>
                </Box>
              </Box>

              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  // Mobile app bar with search
  const MobileAppBar = () => (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu />
        </IconButton>
        
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Leads
        </Typography>

        <IconButton
          color="inherit"
          onClick={() => setSearchVisible(!searchVisible)}
        >
          <Search />
        </IconButton>

        <IconButton
          color="inherit"
          onClick={() => setFilterDrawerOpen(true)}
        >
          <FilterList />
        </IconButton>

        <IconButton color="inherit">
          <Badge badgeContent={notificationCount} color="error">
            <Notifications />
          </Badge>
        </IconButton>
      </Toolbar>

      {/* Collapsible search bar */}
      <Collapse in={searchVisible}>
        <Box sx={{ p: 1, backgroundColor: 'primary.dark' }}>
          <TextField
            fullWidth
            placeholder="Search leads..."
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
            }}
          />
        </Box>
      </Collapse>
    </AppBar>
  );

  // Navigation drawer
  const NavigationDrawer = () => (
    <SwipeableDrawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      onOpen={() => setDrawerOpen(true)}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Menu</Typography>
      </Box>
      <List>
        <ListItem>
          <ListItemIcon><TouchApp /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem>
          <ListItemIcon><PanTool /></ListItemIcon>
          <ListItemText primary="Leads" />
        </ListItem>
        <ListItem>
          <ListItemIcon><Notifications /></ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItem>
      </List>
    </SwipeableDrawer>
  );

  // Filter drawer
  const FilterDrawer = () => (
    <Drawer
      anchor="bottom"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '50vh',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>Status</Typography>
        <Box display="flex" gap={1} mb={2} flexWrap="wrap">
          {['Active', 'Qualified', 'Closed'].map((status) => (
            <Chip key={status} label={status} clickable />
          ))}
        </Box>

        <Typography variant="subtitle2" gutterBottom>Priority</Typography>
        <Box display="flex" gap={1} mb={2}>
          {['High', 'Medium', 'Low'].map((priority) => (
            <Chip key={priority} label={priority} clickable />
          ))}
        </Box>

        <Button fullWidth variant="contained" sx={{ mt: 2 }}>
          Apply Filters
        </Button>
      </Box>
    </Drawer>
  );

  if (!isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Mobile features are optimized for mobile devices
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Resize your window or view on a mobile device to see mobile-specific features.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden' }} {...swipeHandlers}>
      {/* Mobile App Bar */}
      <MobileAppBar />

      {/* Pull to refresh indicator */}
      <Slide direction="down" in={pullToRefreshActive}>
        <Box
          sx={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'primary.main',
            color: 'white',
            py: 1,
            textAlign: 'center',
          }}
        >
          <SwipeUp sx={{ mr: 1 }} />
          Refreshing...
        </Box>
      </Slide>

      {/* Main content area */}
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          p: 1,
        }}
      >
        {/* Gesture hint */}
        <Card sx={{ mb: 2, backgroundColor: 'info.light' }}>
          <CardContent sx={{ py: 1 }}>
            <Typography variant="caption" display="block">
              💡 <strong>Touch Gestures:</strong> Swipe cards left/right for actions, long press for menu, pull down to refresh
            </Typography>
          </CardContent>
        </Card>

        {/* Lead cards */}
        {leads.map((lead, index) => (
          <MobileLeadCard key={lead.id} lead={lead} index={index} />
        ))}
      </Box>

      {/* Navigation drawer */}
      <NavigationDrawer />

      {/* Filter drawer */}
      <FilterDrawer />

      {/* Speed dial for quick actions */}
      <SpeedDial
        ariaLabel="Quick actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>
    </Box>
  );
};

export default MobileFeatures;