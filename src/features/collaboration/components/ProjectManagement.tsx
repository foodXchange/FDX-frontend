import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  AvatarGroup,
  LinearProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Badge,
  Divider,
  useTheme,
  alpha,
  Drawer,
  AppBar,
  Toolbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuList,
  ListItemButton,
  Collapse,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Autocomplete,
  Switch,
  Slider,
  Rating,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Group,
  Person,
  Schedule,
  CheckCircle,
  Warning,
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  AccessTime,
  CalendarToday,
  PriorityHigh,
  Flag,
  Comment,
  AttachFile,
  Share,
  Refresh,
  FilterList,
  Search,
  Sort,
  ViewList,
  ViewModule,
  ViewKanban,
  Analytics,
  Timeline as TimelineIcon,
  Settings,
  Notifications,
  Email,
  Message,
  VideoCall,
  Phone,
  LocationOn,
  Business,
  Tag,
  Label,
  Folder,
  FolderOpen,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  ThumbUp,
  ThumbDown,
  ExpandMore,
  ExpandLess,
  ArrowUpward,
  ArrowDownward,
  DragIndicator,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  FastRewind,
  Launch,
  Archive,
  Unarchive,
  FileCopy,
  Download,
  Upload,
  CloudUpload,
  CloudDownload,
  Sync,
  SyncAlt,
  Update,
  Build,
  BugReport,
  Code,
  Integration,
  Api,
  Security,
  VpnKey,
  Lock,
  LockOpen,
  Verified,
  NewReleases,
  Publish,
  UnPublished,
  Public,
  Private,
  Visibility as VisibilityIcon,
  VisibilityOff,
  Extension,
  Widgets,
  Apps,
  GridView,
  ListAlt,
  TableChart,
  DonutSmall,
  PieChart,
  BarChart,
  ShowChart,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Layers,
  Map,
  Place,
  Room,
  Navigation,
  Explore,
  MyLocation,
  NearMe,
  Directions,
  DirectionsWalk,
  DirectionsBike,
  DirectionsCar,
  DirectionsTransit,
  Train,
  Flight,
  Hotel,
  Restaurant,
  ShoppingCart,
  Store,
  Storefront,
  LocalGroceryStore,
  LocalMall,
  LocalOffer,
  LocalAtm,
  LocalBank,
  LocalHospital,
  LocalPharmacy,
  LocalGasStation,
  LocalParking,
  LocalTaxi,
  LocalShipping,
  LocalPostOffice,
  LocalPrintshop,
  LocalLibrary,
  LocalMovies,
  LocalPlay,
  LocalActivity,
  LocalFlorist,
  LocalDining,
  LocalPizza,
  LocalCafe,
  LocalBar,
  LocalConvenience,
  LocalCarWash,
  LocalLaundryService,
  Work,
  School,
  SportsSoccer,
  SportsBasketball,
  SportsFootball,
  SportsGolf,
  SportsTennis,
  SportsVolleyball,
  SportsBaseball,
  SportsHockey,
  SportsRugby,
  SportsCricket,
  SportsKabaddi,
  SportsHandball,
  SportsEsports,
  SportsMotorsports,
  Pool,
  FitnessCenter,
  SelfImprovement,
  Spa,
  Casino,
  Nightlife,
  Festival,
  Celebration,
  Cake,
  Redeem,
  CardGiftcard,
  Loyalty,
  Grade,
  Military,
  Emergency,
  HealthAndSafety,
  Masks,
  Sanitizer,
  Vaccines,
  Coronavirus,
  Sick,
  Healing,
  MedicalServices,
  Psychology,
  Mood,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  EmojiEmotions,
  EmojiEvents,
  EmojiObjects,
  EmojiPeople,
  EmojiNature,
  EmojiTransportation,
  EmojiSymbols,
  EmojiFlags,
  EmojiFood,
  Circle,
  MoreHoriz,
  Menu,
  Close,
  Clear,
  Done,
  Save,
  Cancel,
  Undo,
  Redo,
  Cut,
  Copy,
  Paste,
  SelectAll,
  FindInPage,
  FindReplace,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  Rotate90DegreesCcw,
  Rotate90DegreesCw,
  RotateLeft,
  RotateRight,
  Flip,
  FlipToBack,
  FlipToFront,
  Layers as LayersIcon,
  LayersClear,
  Transform,
  Tune,
  Palette,
  Brush,
  FormatPaint,
  FormatColorFill,
  FormatColorText,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatIndentDecrease,
  FormatIndentIncrease,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatSize,
  FormatColorReset,
  FormatClear,
  Title,
  TextFields,
  Subject,
  ShortText,
  Notes,
  Description,
  Article,
  MenuBook,
  ImportContacts,
  ChromeReaderMode,
  Spellcheck,
  Translate,
  RecordVoiceOver,
  VoiceOverOff,
  HearingDisabled,
  Hearing,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  VolumeOff,
  Mic,
  MicOff,
  MicNone,
  MicExternalOn,
  MicExternalOff,
  Headset,
  HeadsetMic,
  HeadsetOff,
  Earbuds,
  EarbudsBattery,
  Speaker,
  SpeakerGroup,
  SpeakerPhone,
  Radio,
  GraphicEq,
  Equalizer,
  MusicNote,
  MusicVideo,
  MusicOff,
  LibraryMusic,
  LibraryBooks,
  LibraryAdd,
  LibraryAddCheck,
  VideoLibrary,
  VideoCall as VideoCallIcon,
  VideoCallOff,
  Videocam,
  VideocamOff,
  VideoLabel,
  VideoSettings,
  Movie,
  MovieCreation,
  MovieFilter,
  Theaters,
  LocalMovies as LocalMoviesIcon,
  Tv,
  TvOff,
  ConnectedTv,
  Cast,
  CastConnected,
  CastForEducation,
  ScreenShare,
  StopScreenShare,
  PresentToAll,
  CameraAlt,
  Camera,
  CameraEnhance,
  CameraFront,
  CameraRear,
  CameraRoll,
  Photo,
  PhotoAlbum,
  PhotoCamera,
  PhotoCameraBack,
  PhotoCameraFront,
  PhotoFilter,
  PhotoLibrary,
  PhotoSizeSelectActual,
  PhotoSizeSelectLarge,
  PhotoSizeSelectSmall,
  Image,
  ImageAspectRatio,
  ImageNotSupported,
  ImageSearch,
  Collections,
  CollectionsBookmark,
  ColorLens,
  ColorRange,
  Colorize,
  Contrast,
  Brightness1,
  Brightness2,
  Brightness3,
  Brightness4,
  Brightness5,
  Brightness6,
  Brightness7,
  BrightnessAuto,
  BrightnessHigh,
  BrightnessLow,
  BrightnessMedium,
  AutoAwesome,
  AutoAwesomeMotion,
  AutoAwesomeMosaic,
  AutoFixHigh,
  AutoFixNormal,
  AutoFixOff,
  Bedtime,
  BedtimeOff,
  Flare,
  FlashlightOn,
  FlashlightOff,
  Highlight,
  HighlightOff,
  Lens,
  LensBlur,
  Looks,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  Loupe,
  MonochromePhotos,
  Nature,
  NaturePeople,
  NavigateBefore,
  NavigateNext,
  PanoramaFishEye,
  PanoramaHorizontal,
  PanoramaVertical,
  PanoramaWideAngle,
  ShutterSpeed,
  Straighten,
  Style,
  SwitchCamera,
  Texture,
  Timelapse,
  Timer,
  Timer10,
  Timer3,
  TimerOff,
  Tonality,
  Tune as TuneIcon,
  ViewComfy,
  ViewCompact,
  ViewDay,
  ViewHeadline,
  ViewInAr,
  ViewQuilt,
  ViewSidebar,
  ViewStream,
  ViewWeek,
  Vignette,
  WbAuto,
  WbCloudy,
  WbIncandescent,
  WbIridescent,
  WbShade,
  WbSunny,
  WbTwilight,
  Grain,
  Gradient,
  Hdr,
  HdrAuto,
  HdrAutoSelect,
  HdrEnhancedSelect,
  HdrOff,
  HdrOffSelect,
  HdrOn,
  HdrOnSelect,
  HdrPlus,
  HdrStrong,
  HdrWeak,
  HealingIcon,
  HelpIcon,
  HelpCenter,
  HelpOutline,
  HelpOutlineIcon,
  HighlightIcon,
  HighlightOffIcon,
  HindiIcon,
  HistoryIcon,
  HistoryEdu,
  HistoryToggleOff,
  HiveIcon,
  HMobiledata,
  HolidayVillage,
  HomeIcon,
  HomeMax,
  HomeMini,
  HomeRepairService,
  HomeWorkIcon,
  HorizontalRule,
  HorizontalSplit,
  HotTub,
  HotelIcon,
  HourglassBottom,
  HourglassEmpty,
  HourglassFull,
  HourglassTop,
  HouseIcon,
  HouseSiding,
  HowToReg,
  HowToVote,
  HtmlIcon,
  HttpIcon,
  HttpsIcon,
  Hub,
  HvacIcon,
  HybridIcon,
  HydrogenIcon,
  IceSkatingIcon,
  IcecreamIcon,
  IdCardIcon,
  ImageIcon,
  ImageAspectRatioIcon,
  ImageNotSupportedIcon,
  ImageSearchIcon,
  ImagesearchRollerIcon,
  ImportContactsIcon,
  ImportExportIcon,
  ImportantDevicesIcon,
  InboxIcon,
  IncompleteCircleIcon,
  IndeterminateCheckBoxIcon,
  InfoIcon,
  InfoOutlinedIcon,
  InputIcon,
  InsertChartIcon,
  InsertChartOutlinedIcon,
  InsertCommentIcon,
  InsertDriveFileIcon,
  InsertEmoticonIcon,
  InsertInvitationIcon,
  InsertLinkIcon,
  InsertPhotoIcon,
  InsightsIcon,
  InstagramIcon,
  InstallDesktopIcon,
  InstallMobileIcon,
  IntegrationInstructionsIcon,
  InterestsIcon,
  InterpreterModeIcon,
  InventoryIcon,
  Inventory2Icon,
  InvertColorsIcon,
  InvertColorsOffIcon,
  InvertColorsOnIcon,
  IosIcon,
  IosShareIcon,
  IronIcon,
  IsoIcon,
  JavascriptIcon,
  JoinFullIcon,
  JoinInnerIcon,
  JoinLeftIcon,
  JoinRightIcon,
  KayakingIcon,
  KebabDiningIcon,
  KeyIcon,
  KeyboardIcon,
  KeyboardAltIcon,
  KeyboardArrowDownIcon,
  KeyboardArrowLeftIcon,
  KeyboardArrowRightIcon,
  KeyboardArrowUpIcon,
  KeyboardBackspaceIcon,
  KeyboardCapslock,
  KeyboardCommandKeyIcon,
  KeyboardControlKeyIcon,
  KeyboardDoubleArrowDownIcon,
  KeyboardDoubleArrowLeftIcon,
  KeyboardDoubleArrowRightIcon,
  KeyboardDoubleArrowUpIcon,
  KeyboardHideIcon,
  KeyboardOptionKeyIcon,
  KeyboardReturnIcon,
  KeyboardTabIcon,
  KeyboardVoiceIcon,
  KeyoffIcon,
  KingBedIcon,
  KitchenIcon,
  KitesurfingIcon,
  LabelIcon,
  LabelImportantIcon,
  LabelImportantOutlinedIcon,
  LabelOffIcon,
  LabelOutlinedIcon,
  LadderIcon,
  LandscapeIcon,
  LanguageIcon,
  LaptopIcon,
  LaptopChromebookIcon,
  LaptopMacIcon,
  LaptopWindowsIcon,
  LastPageIcon,
  LaunchIcon,
  LaundryIcon,
  LavaLampIcon,
  LayersIcon,
  LayersClearIcon,
  LeaderboardIcon,
  LeakAddIcon,
  LeakRemoveIcon,
  LegendToggleIcon,
  LensIcon,
  LensBlurIcon,
  LibraryAddIcon,
  LibraryAddCheckIcon,
  LibraryBooksIcon,
  LibraryMusicIcon,
  LightIcon,
  LightModeIcon,
  LightbulbIcon,
  LightbulbCircleIcon,
  LightbulbOutlinedIcon,
  LineAxisIcon,
  LineStyleIcon,
  LineWeightIcon,
  LinearScaleIcon,
  LinkIcon,
  LinkOffIcon,
  LinkedCameraIcon,
  LinkedInIcon,
  LiquorIcon,
  ListIcon,
  ListAltIcon,
  LiveHelpIcon,
  LiveTvIcon,
  LivingIcon,
  LocalActivityIcon,
  LocalAirportIcon,
  LocalAtmIcon,
  LocalBarIcon,
  LocalCafeIcon,
  LocalCarWashIcon,
  LocalConvenienceStoreIcon,
  LocalDiningIcon,
  LocalDrinkIcon,
  LocalFireDepartmentIcon,
  LocalFloristIcon,
  LocalGasStationIcon,
  LocalGroceryStoreIcon,
  LocalHospitalIcon,
  LocalHotelIcon,
  LocalLaundryServiceIcon,
  LocalLibraryIcon,
  LocalMallIcon,
  LocalMoviesIcon,
  LocalOfferIcon,
  LocalParkingIcon,
  LocalPharmacyIcon,
  LocalPhoneIcon,
  LocalPizzaIcon,
  LocalPlayIcon,
  LocalPoliceIcon,
  LocalPostOfficeIcon,
  LocalPrintshopIcon,
  LocalSeeIcon,
  LocalShippingIcon,
  LocalTaxiIcon,
  LocationCityIcon,
  LocationDisabledIcon,
  LocationOffIcon,
  LocationOnIcon,
  LocationSearchingIcon,
  LockIcon,
  LockClockIcon,
  LockOpenIcon,
  LockPersonIcon,
  LockResetIcon,
  LoginIcon,
  LogoDevIcon,
  LogoutIcon,
  LooksIcon,
  LooksOneIcon,
  LooksTwoIcon,
  Looks3Icon,
  Looks4Icon,
  Looks5Icon,
  Looks6Icon,
  LoopIcon,
  LoupeIcon,
  LowPriorityIcon,
  LoyaltyIcon,
  LteMobiledataIcon,
  LtePlusMobiledataIcon,
  LuggageIcon,
  LunchDiningIcon,
  LyricsIcon,
  MacroOffIcon,
  MailIcon,
  MailLockIcon,
  MailOutlineIcon,
  MaleIcon,
  ManIcon,
  ManageAccountsIcon,
  ManageHistoryIcon,
  ManageSearchIcon,
  MapIcon,
  MapsHomeWorkIcon,
  MapsUgcIcon,
  MarginIcon,
  MarkAsUnreadIcon,
  MarkChatReadIcon,
  MarkChatUnreadIcon,
  MarkEmailReadIcon,
  MarkEmailUnreadIcon,
  MarkUnreadChatAltIcon,
  MarkunreadIcon,
  MarkunreadMailboxIcon,
  MasksIcon,
  MaximizeIcon,
  MealIcon,
  MediaBluetoothOffIcon,
  MediaBluetoothOnIcon,
  MedicationIcon,
  MedicationLiquidIcon,
  MedicalInformationIcon,
  MedicalServicesIcon,
  MeetingRoomIcon,
  MemoryIcon,
  MenuIcon,
  MenuBookIcon,
  MenuOpenIcon,
  MergeIcon,
  MergeTypeIcon,
  MessageIcon,
  MicIcon,
  MicExternalOffIcon,
  MicExternalOnIcon,
  MicNoneIcon,
  MicOffIcon,
  MicrowaveIcon,
  MilitaryTechIcon,
  MinimizeIcon,
  MinorCrashIcon,
  MiscellaneousServicesIcon,
  MissedVideoCallIcon,
  MmsIcon,
  MobileFriendlyIcon,
  MobileOffIcon,
  MobileScreenShareIcon,
  MobiledataOffIcon,
  ModeIcon,
  ModeCommentIcon,
  ModeEditIcon,
  ModeEditOutlineIcon,
  ModeNightIcon,
  ModeOfTravelIcon,
  ModeStandbyIcon,
  ModelTrainingIcon,
  ModemIcon,
  ModerateIcon,
  ModernIcon,
  MonetizationOnIcon,
  MoneyIcon,
  MoneyOffIcon,
  MoneyOffCsredIcon,
  MonitorIcon,
  MonitorHeartIcon,
  MonitorWeightIcon,
  MonochromePhotosIcon,
  MoodIcon,
  MoodBadIcon,
  MoodyCryIcon,
  MoodyCryOutlinedIcon,
  MoodyCryTwoToneIcon,
  MoodyCryRoundedIcon,
  MoodyCrySharpIcon,
  MoodyCryFilledIcon,
  MopsIcon,
  MoreIcon,
  MoreHorizIcon,
  MoreTimeIcon,
  MoreVertIcon,
  MosqueIcon,
  MotionPhotosAutoIcon,
  MotionPhotosOffIcon,
  MotionPhotosOnIcon,
  MotionPhotosPausedIcon,
  MotorcycleIcon,
  MouseIcon,
  MoveDownIcon,
  MoveToInboxIcon,
  MoveUpIcon,
  MovieIcon,
  MovieCreationIcon,
  MovieFilterIcon,
  MovingIcon,
  MpIcon,
  MultilineChartIcon,
  MultipleStopIcon,
  MuseumIcon,
  MusicNoteIcon,
  MusicOffIcon,
  MusicVideoIcon,
  MyLocationIcon,
  NatIcon,
  NatureIcon,
  NaturePeopleIcon,
  NavigateBeforeIcon,
  NavigateNextIcon,
  NavigationIcon,
  NearMeIcon,
  NearMeDisabledIcon,
  NearbyErrorIcon,
  NearbyOffIcon,
  NegativeIcon,
  NestCamWiredStandIcon,
  NetworkCellIcon,
  NetworkCheckIcon,
  NetworkLockedIcon,
  NetworkPingIcon,
  NetworkWifiIcon,
  NewReleasesIcon,
  NextPlanIcon,
  NextWeekIcon,
  NfcIcon,
  NightShelterIcon,
  NightlifeIcon,
  NightlightIcon,
  NightlightRoundIcon,
  NightsStayIcon,
  NoAccountsIcon,
  NoAdultContentIcon,
  NoBackpackIcon,
  NoCellIcon,
  NoCoasterIcon,
  NoCoastIcon,
  NoEncryptionIcon,
  NoEncryptionGmailerrorredIcon,
  NoFoodIcon,
  NoFlashIcon,
  NoLuggageIcon,
  NoMealsIcon,
  NoMeetingRoomIcon,
  NoPhotographyIcon,
  NoSimIcon,
  NoStrollerIcon,
  NoTransferIcon,
  NoWallpaperIcon,
  NordicWalkingIcon,
  NorthIcon,
  NorthEastIcon,
  NorthWestIcon,
  NotAccessibleIcon,
  NotInterestedIcon,
  NotListedLocationIcon,
  NotStartedIcon,
  NoteIcon,
  NoteAddIcon,
  NoteAltIcon,
  NotesIcon,
  NotificationAddIcon,
  NotificationImportantIcon,
  NotificationsIcon,
  NotificationsActiveIcon,
  NotificationsNoneIcon,
  NotificationsOffIcon,
  NotificationsPausedIcon,
  NowWallpaperIcon,
  NowWidgetsIcon,
  NumbersIcon,
  OfflineBoltIcon,
  OfflineIcon,
  OfflinePinIcon,
  OfflineShareIcon,
  OilBarrelIcon,
  OndemandVideoIcon,
  OnlinePredictionIcon,
  OpacityIcon,
  OpenInBrowserIcon,
  OpenInFullIcon,
  OpenInNewIcon,
  OpenInNewOffIcon,
  OpenWithIcon,
  OtherHousesIcon,
  OutboundIcon,
  OutboxIcon,
  OutdoorGrillIcon,
  OutletIcon,
  OutlinedFlagIcon,
  OutputIcon,
  OvenIcon,
  OverflowIcon,
  PaddingIcon,
  PagesIcon,
  PageviewIcon,
  PaidIcon,
  PaintIcon,
  PaletteIcon,
  PanToolIcon,
  PanToolAltIcon,
  PanoramaIcon,
  PanoramaFishEyeIcon,
  PanoramaHorizontalIcon,
  PanoramaHorizontalSelectIcon,
  PanoramaPhotosphereIcon,
  PanoramaPhotosphereSelectIcon,
  PanoramaVerticalIcon,
  PanoramaVerticalSelectIcon,
  PanoramaWideAngleIcon,
  PanoramaWideAngleSelectIcon,
  PaperclipIcon,
  ParaglidingIcon,
  ParkIcon,
  PartyModeIcon,
  PasswordIcon,
  PasteIcon,
  PatternIcon,
  PauseIcon,
  PauseCircleIcon,
  PauseCircleFilledIcon,
  PauseCircleOutlineIcon,
  PausePresentationIcon,
  PaymentIcon,
  PaymentsIcon,
  PedalBikeIcon,
  PendingIcon,
  PendingActionsIcon,
  PeopleIcon,
  PeopleAltIcon,
  PeopleOutlineIcon,
  PercentIcon,
  PermCameraMicIcon,
  PermContactCalendarIcon,
  PermDataSettingIcon,
  PermDeviceInformationIcon,
  PermIdentityIcon,
  PermMediaIcon,
  PermPhoneMsgIcon,
  PermScanWifiIcon,
  PersonIcon,
  PersonAddIcon,
  PersonAddAltIcon,
  PersonAddAlt1Icon,
  PersonAddDisabledIcon,
  PersonOffIcon,
  PersonOutlineIcon,
  PersonOutlinedIcon,
  PersonPinIcon,
  PersonPinCircleIcon,
  PersonRemoveIcon,
  PersonRemoveAlt1Icon,
  PersonSearchIcon,
  PersonalVideoIcon,
  PestControlIcon,
  PestControlRodentIcon,
  PetsIcon,
  PhishingIcon,
  PhoneIcon,
  PhoneAndroidIcon,
  PhoneBluetoothSpeakerIcon,
  PhoneCallbackIcon,
  PhoneDisabledIcon,
  PhoneEnabledIcon,
  PhoneForwardedIcon,
  PhoneInTalkIcon,
  PhoneIphoneIcon,
  PhoneLinkIcon,
  PhoneLinkEraseIcon,
  PhoneLinkLockIcon,
  PhoneLinkOffIcon,
  PhoneLinkRingIcon,
  PhoneLinkSetupIcon,
  PhoneLockedIcon,
  PhoneMissedIcon,
  PhonePausedIcon,
  PhonelinkEraseIcon,
  PhonelinkLockIcon,
  PhonelinkOffIcon,
  PhonelinkRingIcon,
  PhonelinkSetupIcon,
  PhotoIcon,
  PhotoAlbumIcon,
  PhotoCameraIcon,
  PhotoCameraBackIcon,
  PhotoCameraFrontIcon,
  PhotoFilterIcon,
  PhotoLibraryIcon,
  PhotoSizeSelectActualIcon,
  PhotoSizeSelectLargeIcon,
  PhotoSizeSelectSmallIcon,
  PhpIcon,
  PianoIcon,
  PianoOffIcon,
  PictureAsPdfIcon,
  PictureInPictureIcon,
  PictureInPictureAltIcon,
  PieChartIcon,
  PieChartOutlineIcon,
  PinIcon,
  PinDropIcon,
  PinInvokeIcon,
  PinealIcon,
  PinningIcon,
  PivotTableChartIcon,
  PixIcon,
  PlaceIcon,
  PlaceIconIcon,
  PlagiarismIcon,
  PlayArrowIcon,
  PlayCircleIcon,
  PlayCircleFilledIcon,
  PlayCircleFilledWhiteIcon,
  PlayCircleOutlineIcon,
  PlayDisabledIcon,
  PlayForWorkIcon,
  PlaylistAddIcon,
  PlaylistAddCheckIcon,
  PlaylistAddCheckCircleIcon,
  PlaylistPlayIcon,
  PlaylistRemoveIcon,
  PlaylistsIcon,
  PlumbingIcon,
  PlusOneIcon,
  PmIcon,
  PngIcon,
  PointOfSaleIcon,
  PolicyIcon,
  PollIcon,
  PolylineIcon,
  PoolIcon,
  PortableWifiOffIcon,
  PortraitIcon,
  PostAddIcon,
  PowerIcon,
  PowerInputIcon,
  PowerOffIcon,
  PowerSettingsNewIcon,
  PrecisionManufacturingIcon,
  PregnantWomanIcon,
  PresentToAllIcon,
  PreviewIcon,
  PriceChangeIcon,
  PriceCheckIcon,
  PrintIcon,
  PrintDisabledIcon,
  PriorityHighIcon,
  PrivacyTipIcon,
  PrivateConnectivityIcon,
  ProduceIcon,
  ProductionQuantityLimitsIcon,
  PsychologyIcon,
  PsychologyAltIcon,
  PublicIcon,
  PublicOffIcon,
  PublishIcon,
  PublishedWithChangesIcon,
  PunchClockIcon,
  PushPinIcon,
  PutIcon,
  PuzzleIcon,
  QrCodeIcon,
  QrCode2Icon,
  QrCodeScannerIcon,
  QueryBuilderIcon,
  QueryStatsIcon,
  QuestionAnswerIcon,
  QuestionMarkIcon,
  QueueIcon,
  QueueMusicIcon,
  QueuePlayNextIcon,
  QuickreplyIcon,
  QuizIcon,
  RMobiledataIcon,
  RacingIcon,
  RadioIcon,
  RadioButtonCheckedIcon,
  RadioButtonUncheckedIcon,
  RailwayAlertIcon,
  RamenDiningIcon,
  RampLeftIcon,
  RampRightIcon,
  RateReviewIcon,
  RawOffIcon,
  RawOnIcon,
  ReadMoreIcon,
  RealEstateAgentIcon,
  ReceiptIcon,
  ReceiptLongIcon,
  RecentActorsIcon,
  RecommendIcon,
  RecordVoiceOverIcon,
  RectangleIcon,
  RecyclingIcon,
  RedeemIcon,
  RedoIcon,
  ReduceCapacityIcon,
  RefreshIcon,
  RememberMeIcon,
  RemoveIcon,
  RemoveCircleIcon,
  RemoveCircleOutlineIcon,
  RemoveDoneIcon,
  RemoveFromQueueIcon,
  RemoveModeratorIcon,
  RemoveRedEyeIcon,
  RemoveShoppingCartIcon,
  ReorderIcon,
  RepartitionIcon,
  RepeatIcon,
  RepeatOneIcon,
  RepeatOnIcon,
  ReplayIcon,
  ReplayCircleFilledIcon,
  ReplayIcon10,
  ReplayIcon30,
  ReplyIcon,
  ReplyAllIcon,
  ReportIcon,
  ReportGmailerrorredIcon,
  ReportOffIcon,
  ReportProblemIcon,
  RequestPageIcon,
  RequestQuoteIcon,
  ResetTvIcon,
  RestartAltIcon,
  RestaurantIcon,
  RestaurantMenuIcon,
  RestoreIcon,
  RestoreFromTrashIcon,
  RestorePageIcon,
  ReviewsIcon,
  RiceBowlIcon,
  RingVolumeIcon,
  RoofingIcon,
  RoomIcon,
  RoomPreferencesIcon,
  RoomServiceIcon,
  Rotate90DegreesCcwIcon,
  Rotate90DegreesCwIcon,
  RotateLeftIcon,
  RotateRightIcon,
  RoundedCornerIcon,
  RouteIcon,
  RouterIcon,
  RowingIcon,
  RssFeedIcon,
  RsvpIcon,
  RttIcon,
  RuleIcon,
  RuleFolderIcon,
  RunCircleIcon,
  RunningWithErrorsIcon,
  RvHookupIcon,
  SafetyCheckIcon,
  SafetyDividerIcon,
  SailingIcon,
  SakeHamIcon,
  SamsungIcon,
  SanitizerIcon,
  SatelliteIcon,
  SatelliteAltIcon,
  SatisfiedIcon,
  SatisfiedAltIcon,
  SaveIcon,
  SaveAltIcon,
  SaveAsIcon,
  SavedSearchIcon,
  SavingsIcon,
  ScaleIcon,
  ScannerIcon,
  ScatterPlotIcon,
  ScheduleIcon,
  ScheduleSendIcon,
  SchemaIcon,
  SchoolIcon,
  ScienceIcon,
  ScoreIcon,
  ScoreboardIcon,
  ScreenLockLandscapeIcon,
  ScreenLockPortraitIcon,
  ScreenLockRotationIcon,
  ScreenRotationIcon,
  ScreenSearchDesktopIcon,
  ScreenShareIcon,
  ScreenshotIcon,
  ScreenshotMonitorIcon,
  ScubaDivingIcon,
  SdIcon,
  SdCardIcon,
  SdCardAlertIcon,
  SdStorageIcon,
  SearchIcon,
  SearchOffIcon,
  SecurityIcon,
  SecurityUpdateIcon,
  SecurityUpdateGoodIcon,
  SecurityUpdateWarningIcon,
  SegmentIcon,
  SelectAllIcon,
  SelfImprovementIcon,
  SellIcon,
  SendIcon,
  SendAndArchiveIcon,
  SendTimeExtensionIcon,
  SendToMobileIcon,
  SensorDoorIcon,
  SensorOccupiedIcon,
  SensorWindowIcon,
  SentimentDissatisfiedIcon,
  SentimentNeutralIcon,
  SentimentSatisfiedIcon,
  SentimentSatisfiedAltIcon,
  SentimentVeryDissatisfiedIcon,
  SentimentVerySatisfiedIcon,
  SetMealIcon,
  SettingsIcon,
  SettingsAccessibilityIcon,
  SettingsApplicationsIcon,
  SettingsBackupRestoreIcon,
  SettingsBluetoothIcon,
  SettingsBrightnessIcon,
  SettingsCellIcon,
  SettingsEthernetIcon,
  SettingsInputAntennaIcon,
  SettingsInputComponentIcon,
  SettingsInputCompositeIcon,
  SettingsInputHdmiIcon,
  SettingsInputSvideoIcon,
  SettingsOverscanIcon,
  SettingsPhoneIcon,
  SettingsPowerIcon,
  SettingsRemoteIcon,
  SettingsSystemDaydreamIcon,
  SettingsVoiceIcon,
  SevereColdIcon,
  ShapeLineIcon,
  ShareIcon,
  ShareLocationIcon,
  ShieldIcon,
  ShieldMoonIcon,
  ShopIcon,
  ShopTwoIcon,
  ShoppingBagIcon,
  ShoppingBasketIcon,
  ShoppingCartIcon,
  ShoppingCartCheckoutIcon,
  ShortTextIcon,
  ShowChartIcon,
  ShuffleIcon,
  ShuffleOnIcon,
  ShutterSpeedIcon,
  SickIcon,
  SignalCellular0BarIcon,
  SignalCellular1BarIcon,
  SignalCellular2BarIcon,
  SignalCellular3BarIcon,
  SignalCellular4BarIcon,
  SignalCellularAltIcon,
  SignalCellularConnectedNoInternet0BarIcon,
  SignalCellularConnectedNoInternet1BarIcon,
  SignalCellularConnectedNoInternet2BarIcon,
  SignalCellularConnectedNoInternet3BarIcon,
  SignalCellularConnectedNoInternet4BarIcon,
  SignalCellularNoSimIcon,
  SignalCellularNullIcon,
  SignalCellularOffIcon,
  SignalWifi0BarIcon,
  SignalWifi1BarIcon,
  SignalWifi1BarLockIcon,
  SignalWifi2BarIcon,
  SignalWifi2BarLockIcon,
  SignalWifi3BarIcon,
  SignalWifi3BarLockIcon,
  SignalWifi4BarIcon,
  SignalWifi4BarLockIcon,
  SignalWifiBadIcon,
  SignalWifiConnectedNoInternet4Icon,
  SignalWifiOffIcon,
  SignalWifiStatusbar4BarIcon,
  SignalWifiStatusbarConnectedNoInternet4Icon,
  SignalWifiStatusbarNullIcon,
  SimCardIcon,
  SimCardAlertIcon,
  SimCardDownloadIcon,
  SingleBedIcon,
  SipIcon,
  SixKIcon,
  SixKPlusIcon,
  SixMpIcon,
  SixteenMpIcon,
  SixtyFpsIcon,
  SixtyFpsSelectIcon,
  SkateboardingIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  SleddingIcon,
  SlideawayIcon,
  SliderIcon,
  SlowMotionVideoIcon,
  SmartButtonIcon,
  SmartDisplayIcon,
  SmartphoneIcon,
  SmartToyIcon,
  SmokeFreeIcon,
  SmokingRoomsIcon,
  SmsIcon,
  SmsFailedIcon,
  SnippetFolderIcon,
  SnoozeIcon,
  SnowboardingIcon,
  SnowingIcon,
  SnowmobileIcon,
  SnowshoeingIcon,
  SoapIcon,
  SocialDistanceIcon,
  SolarPowerIcon,
  SortIcon,
  SortByAlphaIcon,
  SosIcon,
  SoupKitchenIcon,
  SourceIcon,
  SouthIcon,
  SouthEastIcon,
  SouthWestIcon,
  SpaIcon,
  SpaceBarIcon,
  SpaceDashboardIcon,
  SpatialAudioIcon,
  SpatialAudioOffIcon,
  SpatialTrackingIcon,
  SpeakerIcon,
  SpeakerGroupIcon,
  SpeakerNotesIcon,
  SpeakerNotesOffIcon,
  SpeakerPhoneIcon,
  SpeedIcon,
  SpellcheckIcon,
  SpinnerIcon,
  SplitscreenIcon,
  SpokenPasswordIcon,
  SportsIcon,
  SportsBarIcon,
  SportsBaseballIcon,
  SportsBasketballIcon,
  SportsCricketIcon,
  SportsEsportsIcon,
  SportsFootballIcon,
  SportsGolfIcon,
  SportsGymnasticsIcon,
  SportsHandballIcon,
  SportsHockeyIcon,
  SportsKabaddiIcon,
  SportsMartialArtsIcon,
  SportsMotorsportsIcon,
  SportsMmaIcon,
  SportsRugbyIcon,
  SportsRunIcon,
  SportsSoccerIcon,
  SportsTennisIcon,
  SportsVolleyballIcon,
  SquareIcon,
  SquareFootIcon,
  SsidChartIcon,
  StackedBarChartIcon,
  StackedLineChartIcon,
  StadiumIcon,
  StairsIcon,
  StarIcon,
  StarBorderIcon,
  StarBorderPurple500Icon,
  StarHalfIcon,
  StarOutlineIcon,
  StarPurple500Icon,
  StarRateIcon,
  StartIcon,
  StayCurrentLandscapeIcon,
  StayCurrentPortraitIcon,
  StayPrimaryLandscapeIcon,
  StayPrimaryPortraitIcon,
  StickyNote2Icon,
  StopIcon,
  StopCircleIcon,
  StopScreenShareIcon,
  StorageIcon,
  StoreIcon,
  StorefrontIcon,
  StoreMallDirectoryIcon,
  StormIcon,
  StraightIcon,
  StraightenIcon,
  StreamIcon,
  StreetviewIcon,
  StrikethroughSIcon,
  StrollerIcon,
  StyleIcon,
  SubdirectoryArrowLeftIcon,
  SubdirectoryArrowRightIcon,
  SubjectIcon,
  SubscriptIcon,
  SubscriptionsIcon,
  SubtitlesIcon,
  SubtitlesOffIcon,
  SubwayIcon,
  SummarizeIcon,
  SuperscriptIcon,
  SupervisedUserCircleIcon,
  SupervisorAccountIcon,
  SupportIcon,
  SupportAgentIcon,
  SurfingIcon,
  SurroundSoundIcon,
  SvgIconIcon,
  SwapCallsIcon,
  SwapHorizIcon,
  SwapHorizontalCircleIcon,
  SwapVertIcon,
  SwapVerticalCircleIcon,
  SweepIcon,
  SwipeIcon,
  SwipeDownIcon,
  SwipeDownAltIcon,
  SwipeLeftIcon,
  SwipeLeftAltIcon,
  SwipeRightIcon,
  SwipeRightAltIcon,
  SwipeUpIcon,
  SwipeUpAltIcon,
  SwipeVerticalIcon,
  SwitchAccessShortcutIcon,
  SwitchAccessShortcutAddIcon,
  SwitchAccountIcon,
  SwitchCameraIcon,
  SwitchLeftIcon,
  SwitchRightIcon,
  SwitchVideoIcon,
  SynagogueIcon,
  SyncIcon,
  SyncAltIcon,
  SyncDisabledIcon,
  SyncLockIcon,
  SyncProblemIcon,
  SystemSecurityUpdateIcon,
  SystemSecurityUpdateGoodIcon,
  SystemSecurityUpdateWarningIcon,
  SystemUpdateIcon,
  SystemUpdateAltIcon,
  TabIcon,
  TabletIcon,
  TabletAndroidIcon,
  TabletMacIcon,
  TabUnselectedIcon,
  TableBarIcon,
  TableChartIcon,
  TableRestaurantIcon,
  TableRowsIcon,
  TableViewIcon,
  TagIcon,
  TagFacesIcon,
  TakeoutDiningIcon,
  TapAndPlayIcon,
  TapasIcon,
  TaskIcon,
  TaskAltIcon,
  TaxiAlertIcon,
  TeachingIcon,
  TechnicalErrorIcon,
  TempleBuddhistIcon,
  TempleHinduIcon,
  TerminalIcon,
  TerrainIcon,
  TextDecreaseIcon,
  TextFieldsIcon,
  TextFormatIcon,
  TextIncreaseIcon,
  TextRotateUpIcon,
  TextRotateVerticalIcon,
  TextRotationAngledownIcon,
  TextRotationAngleupIcon,
  TextRotationDownIcon,
  TextRotationNoneIcon,
  TextSnippetIcon,
  TextureIcon,
  TheaterComedyIcon,
  TheatersIcon,
  ThermostatIcon,
  ThermostatAutoIcon,
  ThirteenMpIcon,
  ThirtyFpsIcon,
  ThirtyFpsSelectIcon,
  ThreeDRotationIcon,
  ThreeGMobiledataIcon,
  ThreeKIcon,
  ThreeKPlusIcon,
  ThreeMpIcon,
  ThreePIcon,
  ThreeSixtyIcon,
  ThumbDownIcon,
  ThumbDownAltIcon,
  ThumbDownOffAltIcon,
  ThumbsUpDownIcon,
  ThumbUpIcon,
  ThumbUpAltIcon,
  ThumbUpOffAltIcon,
  ThunderstormIcon,
  TimeIcon,
  TimeToLeaveIcon,
  TimelapseIcon,
  TimelineIcon,
  TimerIcon,
  Timer10Icon,
  Timer10SelectIcon,
  Timer3Icon,
  Timer3SelectIcon,
  TimerOffIcon,
  TimesTogetherIcon,
  TipsAndUpdatesIcon,
  TireRepairIcon,
  TitleIcon,
  TocIcon,
  TodayIcon,
  ToggleOffIcon,
  ToggleOnIcon,
  TokenIcon,
  TollIcon,
  TonalityIcon,
  TopicIcon,
  TornadoIcon,
  TouchAppIcon,
  TourIcon,
  ToysIcon,
  TrackChangesIcon,
  TrafficIcon,
  TrainIcon,
  TramIcon,
  TranscribeIcon,
  TransferWithinAStationIcon,
  TransformIcon,
  TransgenderIcon,
  TransitEnterexitIcon,
  TranslateIcon,
  TravelExploreIcon,
  TrendingDownIcon,
  TrendingFlatIcon,
  TrendingUpIcon,
  TripOriginIcon,
  TryIcon,
  TsunamiIcon,
  TtyIcon,
  TuneIcon,
  TunnelingIcon,
  TurnedInIcon,
  TurnedInNotIcon,
  TurnLeftIcon,
  TurnRightIcon,
  TurnSharpLeftIcon,
  TurnSharpRightIcon,
  TurnSlightLeftIcon,
  TurnSlightRightIcon,
  TvIcon,
  TvOffIcon,
  TwelveMpIcon,
  TwentyFourMpIcon,
  TwentyOneMpIcon,
  TwentyThreeMpIcon,
  TwentyTwoMpIcon,
  TwoKIcon,
  TwoKPlusIcon,
  TwoMpIcon,
  TwoWheelerIcon,
  TypeSpecimenIcon,
  UmbrellaIcon,
  UnarchiveIcon,
  UndoIcon,
  UnfoldLessIcon,
  UnfoldLessDoubleIcon,
  UnfoldMoreIcon,
  UnfoldMoreDoubleIcon,
  UngroupIcon,
  UnpublishedIcon,
  UnsubscribeIcon,
  UpcomingIcon,
  UpdateIcon,
  UpdateDisabledIcon,
  UpgradeIcon,
  UploadIcon,
  UploadFileIcon,
  UsbIcon,
  UsbOffIcon,
  UseIcon,
  UturnLeftIcon,
  UturnRightIcon,
  VaccinesIcon,
  VapeFreeIcon,
  VapingRoomsIcon,
  VariableIcon,
  VerifiedIcon,
  VerifiedUserIcon,
  VerticalAlignBottomIcon,
  VerticalAlignCenterIcon,
  VerticalAlignTopIcon,
  VerticalSplitIcon,
  VibrationIcon,
  VideoCallIcon,
  VideoCallOffIcon,
  VideoCameraBackIcon,
  VideoCameraFrontIcon,
  VideoFileIcon,
  VideoLabelIcon,
  VideoLibraryIcon,
  VideoSettingsIcon,
  VideocamIcon,
  VideocamOffIcon,
  VideogameAssetIcon,
  VideogameAssetOffIcon,
  ViewAgendaIcon,
  ViewArrayIcon,
  ViewCarouselIcon,
  ViewColumnIcon,
  ViewComfyIcon,
  ViewComfyAltIcon,
  ViewCompactIcon,
  ViewCompactAltIcon,
  ViewCozyIcon,
  ViewDayIcon,
  ViewHeadlineIcon,
  ViewInArIcon,
  ViewKanbanIcon,
  ViewListIcon,
  ViewModuleIcon,
  ViewQuiltIcon,
  ViewSidebarIcon,
  ViewStreamIcon,
  ViewTimelineIcon,
  ViewWeekIcon,
  VignettingIcon,
  VillaIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  VoiceOverOffIcon,
  VoiceChatIcon,
  VoicemailIcon,
  VolcanoIcon,
  VolumeDownIcon,
  VolumeMuteIcon,
  VolumeOffIcon,
  VolumeUpIcon,
  VolunteerActivismIcon,
  VpnKeyIcon,
  VpnKeyOffIcon,
  VpnLockIcon,
  VrpanoIcon,
  WalletIcon,
  WalletGiftcardIcon,
  WalletMembershipIcon,
  WalletTravelIcon,
  WallpaperIcon,
  WarehouseIcon,
  WarningIcon,
  WarningAmberIcon,
  WashIcon,
  WatchIcon,
  WatchLaterIcon,
  WatchOffIcon,
  WaterIcon,
  WaterDamageIcon,
  WaterDropIcon,
  WaterfallChartIcon,
  WavesIcon,
  WavingHandIcon,
  WbAutoIcon,
  WbCloudyIcon,
  WbIncandescentIcon,
  WbIridescentIcon,
  WbShadeIcon,
  WbSunnyIcon,
  WbTwilightIcon,
  WcIcon,
  WebIcon,
  WebAssetIcon,
  WebAssetOffIcon,
  WebhookIcon,
  WebStoriesIcon,
  WechatIcon,
  WeekendIcon,
  WestIcon,
  WhatAndWhereIcon,
  WhatShotIcon,
  WhatToVoteIcon,
  WheelchairPickupIcon,
  WhereToVoteIcon,
  WidgetsIcon,
  WidthFullIcon,
  WidthNormalIcon,
  WidthWideIcon,
  WifiIcon,
  WifiCallingIcon,
  WifiCalling3Icon,
  WifiChannelIcon,
  WifiLockIcon,
  WifiOffIcon,
  WifiPasswordIcon,
  WifiProtectedSetupIcon,
  WifiTetheringIcon,
  WifiTetheringErrorIcon,
  WifiTetheringErrorRoundedIcon,
  WifiTetheringOffIcon,
  WindowIcon,
  WineBarIcon,
  WomanIcon,
  WomanTwoIcon,
  WorkIcon,
  WorkHistoryIcon,
  WorkOffIcon,
  WorkOutlineIcon,
  WorkspacePremiumIcon,
  WorkspacesIcon,
  WorkspacesFilledIcon,
  WorkspacesOutlineIcon,
  WrapTextIcon,
  WrongLocationIcon,
  WysiwyqIcon,
  YardIcon,
  YesIcon,
  YesterdayIcon,
  YogaIcon,
  YoutubeSearchedForIcon,
  ZoomInIcon,
  ZoomInMapIcon,
  ZoomOutIcon,
  ZoomOutMapIcon,
} from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addDays, isAfter, isBefore, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList,
} from 'recharts';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Project Status Types
type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Data Types
interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  permissions: string[];
  lastActive: Date;
  status: 'online' | 'offline' | 'busy' | 'away';
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string[];
  dueDate: Date;
  completedDate?: Date;
  progress: number;
  tags: string[];
  dependencies: string[];
  comments: Comment[];
  attachments: Attachment[];
  estimatedHours: number;
  actualHours: number;
  subtasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
  mentions: string[];
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date;
  endDate: Date;
  progress: number;
  budget: number;
  spent: number;
  owner: string;
  members: ProjectMember[];
  tasks: Task[];
  tags: string[];
  category: string;
  client: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock Data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Food Safety Compliance Platform',
    description: 'Comprehensive platform for managing food safety compliance across multiple facilities',
    status: 'in_progress',
    priority: 'high',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-30'),
    progress: 68,
    budget: 150000,
    spent: 102000,
    owner: 'sarah.johnson@foodx.com',
    members: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@foodx.com',
        role: 'Project Manager',
        avatar: '/avatars/sarah.jpg',
        permissions: ['admin', 'edit', 'view'],
        lastActive: new Date(),
        status: 'online',
      },
      {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@foodx.com',
        role: 'Lead Developer',
        avatar: '/avatars/michael.jpg',
        permissions: ['edit', 'view'],
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        status: 'away',
      },
    ],
    tasks: [],
    tags: ['compliance', 'food-safety', 'platform'],
    category: 'Development',
    client: 'Internal',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Supplier Quality Management System',
    description: 'Digital transformation of supplier quality management processes',
    status: 'planning',
    priority: 'medium',
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-06-15'),
    progress: 25,
    budget: 120000,
    spent: 30000,
    owner: 'david.rodriguez@foodx.com',
    members: [],
    tasks: [],
    tags: ['suppliers', 'quality', 'management'],
    category: 'Process Improvement',
    client: 'Operations Team',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design User Authentication System',
    description: 'Create secure user authentication with multi-factor authentication',
    status: 'in_progress',
    priority: 'high',
    assignedTo: ['michael.chen@foodx.com'],
    dueDate: new Date('2024-02-15'),
    progress: 75,
    tags: ['authentication', 'security', 'backend'],
    dependencies: [],
    comments: [],
    attachments: [],
    estimatedHours: 40,
    actualHours: 32,
    subtasks: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Implement Compliance Dashboard',
    description: 'Build comprehensive dashboard for compliance monitoring',
    status: 'review',
    priority: 'high',
    assignedTo: ['sarah.johnson@foodx.com'],
    dueDate: new Date('2024-02-20'),
    progress: 95,
    tags: ['dashboard', 'compliance', 'frontend'],
    dependencies: ['1'],
    comments: [],
    attachments: [],
    estimatedHours: 60,
    actualHours: 58,
    subtasks: [],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Setup API Documentation',
    description: 'Create comprehensive API documentation using OpenAPI',
    status: 'todo',
    priority: 'medium',
    assignedTo: ['michael.chen@foodx.com'],
    dueDate: new Date('2024-02-25'),
    progress: 0,
    tags: ['documentation', 'api', 'openapi'],
    dependencies: ['1'],
    comments: [],
    attachments: [],
    estimatedHours: 20,
    actualHours: 0,
    subtasks: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
  },
];

// Project Card Component
const ProjectCard: React.FC<{
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}> = ({ project, onEdit, onDelete, onView }) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (project.status) {
      case 'planning':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'review':
        return theme.palette.secondary.main;
      case 'completed':
        return theme.palette.success.main;
      case 'on_hold':
        return theme.palette.grey[500];
      case 'cancelled':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = () => {
    switch (project.priority) {
      case 'low':
        return theme.palette.success.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'high':
        return theme.palette.error.main;
      case 'urgent':
        return theme.palette.error.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  const budgetUtilization = (project.spent / project.budget) * 100;
  const daysRemaining = differenceInDays(project.endDate, new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card sx={glassmorphismStyle}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: alpha(getStatusColor(), 0.1), color: getStatusColor() }}>
              <Assignment />
            </Avatar>
          }
          action={
            <Stack direction="row" spacing={0.5}>
              <Chip
                label={project.status.replace('_', ' ')}
                size="small"
                sx={{
                  bgcolor: alpha(getStatusColor(), 0.1),
                  color: getStatusColor(),
                  textTransform: 'capitalize',
                }}
              />
              <Chip
                label={project.priority}
                size="small"
                sx={{
                  bgcolor: alpha(getPriorityColor(), 0.1),
                  color: getPriorityColor(),
                  textTransform: 'capitalize',
                }}
              />
              <IconButton size="small" onClick={onEdit}>
                <Edit />
              </IconButton>
              <IconButton size="small" onClick={onDelete}>
                <Delete />
              </IconButton>
            </Stack>
          }
          title={
            <Typography variant="h6" fontWeight="bold">
              {project.name}
            </Typography>
          }
          subheader={
            <Stack direction="row" spacing={2} alignItems="center">
              <Box display="flex" alignItems="center" gap={0.5}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2">
                  {format(project.endDate, 'MMM dd, yyyy')}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <AccessTime fontSize="small" />
                <Typography variant="body2">
                  {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                </Typography>
              </Box>
            </Stack>
          }
        />

        <CardContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {project.description}
          </Typography>

          {/* Progress */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  bgcolor: getStatusColor(),
                  borderRadius: 4,
                },
              }}
            />
          </Box>

          {/* Budget */}
          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Budget Utilization
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={budgetUtilization}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.grey[300], 0.3),
                '& .MuiLinearProgress-bar': {
                  bgcolor: budgetUtilization > 80 ? theme.palette.error.main : theme.palette.success.main,
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Team Members */}
          <Box mb={2}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Team Members
            </Typography>
            <AvatarGroup max={4}>
              {project.members.map((member) => (
                <Tooltip key={member.id} title={`${member.name} (${member.role})`}>
                  <Avatar
                    alt={member.name}
                    src={member.avatar}
                    sx={{
                      width: 32,
                      height: 32,
                      border: `2px solid ${
                        member.status === 'online' ? theme.palette.success.main :
                        member.status === 'busy' ? theme.palette.error.main :
                        member.status === 'away' ? theme.palette.warning.main :
                        theme.palette.grey[500]
                      }`,
                    }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          </Box>

          {/* Tags */}
          <Box>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {project.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          </Box>
        </CardContent>

        <CardActions>
          <Button size="small" variant="outlined" startIcon={<Visibility />} onClick={onView}>
            View
          </Button>
          <Button size="small" variant="outlined" startIcon={<Analytics />}>
            Analytics
          </Button>
          <Button size="small" variant="contained" startIcon={<Edit />} onClick={onEdit}>
            Edit
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
};

// Task Card Component
const TaskCard: React.FC<{
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return theme.palette.info.main;
      case 'in_progress':
        return theme.palette.warning.main;
      case 'review':
        return theme.palette.secondary.main;
      case 'completed':
        return theme.palette.success.main;
      case 'blocked':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'low':
        return theme.palette.success.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'high':
        return theme.palette.error.main;
      case 'urgent':
        return theme.palette.error.dark;
      default:
        return theme.palette.grey[500];
    }
  };

  const daysUntilDue = differenceInDays(task.dueDate, new Date());
  const isOverdue = daysUntilDue < 0;

  return (
    <Card sx={{ ...glassmorphismStyle, mb: 2 }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: alpha(getStatusColor(), 0.1), color: getStatusColor() }}>
            <Assignment />
          </Avatar>
        }
        action={
          <Stack direction="row" spacing={0.5}>
            <Chip
              label={task.status.replace('_', ' ')}
              size="small"
              sx={{
                bgcolor: alpha(getStatusColor(), 0.1),
                color: getStatusColor(),
                textTransform: 'capitalize',
              }}
            />
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: alpha(getPriorityColor(), 0.1),
                color: getPriorityColor(),
                textTransform: 'capitalize',
              }}
            />
            <IconButton size="small" onClick={onEdit}>
              <Edit />
            </IconButton>
            <IconButton size="small" onClick={onDelete}>
              <Delete />
            </IconButton>
          </Stack>
        }
        title={
          <Typography variant="h6" fontWeight="bold">
            {task.title}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={2} alignItems="center">
            <Box display="flex" alignItems="center" gap={0.5}>
              <CalendarToday fontSize="small" />
              <Typography 
                variant="body2" 
                color={isOverdue ? 'error.main' : 'text.secondary'}
              >
                {format(task.dueDate, 'MMM dd, yyyy')}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <AccessTime fontSize="small" />
              <Typography variant="body2">
                {task.estimatedHours}h estimated
              </Typography>
            </Box>
          </Stack>
        }
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {task.description}
        </Typography>

        {/* Progress */}
        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {task.progress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={task.progress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.grey[300], 0.3),
              '& .MuiLinearProgress-bar': {
                bgcolor: getStatusColor(),
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Tags */}
        <Box>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {task.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      </CardContent>

      <CardActions>
        <Button size="small" variant="outlined" startIcon={<Comment />}>
          Comments ({task.comments.length})
        </Button>
        <Button size="small" variant="outlined" startIcon={<AttachFile />}>
          Files ({task.attachments.length})
        </Button>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={task.status}
            onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
          >
            <MenuItem value="todo">To Do</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </Select>
        </FormControl>
      </CardActions>
    </Card>
  );
};

// Project Creation Dialog
const ProjectCreationDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  project?: Project;
}> = ({ open, onClose, project }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning' as ProjectStatus,
    priority: 'medium' as Priority,
    startDate: new Date(),
    endDate: addDays(new Date(), 30),
    budget: 0,
    owner: '',
    category: '',
    client: '',
    tags: [''],
  });

  const handleSubmit = () => {
    console.log('Creating/updating project:', formData);
    onClose();
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ''],
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag),
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {project ? 'Edit Project' : 'Create New Project'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Project Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
              >
                <MenuItem value="planning">Planning</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date || new Date() })}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date || new Date() })}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
              InputProps={{
                startAdornment: <Typography>$</Typography>,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Project Owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Client"
              value={formData.client}
              onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Tags
            </Typography>
            {formData.tags.map((tag, index) => (
              <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter tag"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                />
                <IconButton size="small" onClick={() => removeTag(index)}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<Add />} onClick={addTag}>
              Add Tag
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {project ? 'Update' : 'Create'} Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Project Management Component
export const ProjectManagement: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleProjectEdit = (project: Project) => {
    setSelectedProject(project);
    setProjectDialogOpen(true);
  };

  const handleProjectDelete = (projectId: string) => {
    console.log('Deleting project:', projectId);
  };

  const handleProjectView = (project: Project) => {
    console.log('Viewing project:', project.id);
  };

  const handleTaskStatusChange = (taskId: string, status: TaskStatus) => {
    console.log('Updating task status:', taskId, status);
  };

  const filteredProjects = mockProjects.filter(project => {
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const projectStats = {
    total: mockProjects.length,
    active: mockProjects.filter(p => p.status === 'in_progress').length,
    completed: mockProjects.filter(p => p.status === 'completed').length,
    overdue: mockProjects.filter(p => isAfter(new Date(), p.endDate) && p.status !== 'completed').length,
  };

  const taskStats = {
    total: mockTasks.length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    inProgress: mockTasks.filter(t => t.status === 'in_progress').length,
    overdue: mockTasks.filter(t => isAfter(new Date(), t.dueDate) && t.status !== 'completed').length,
  };

  const chartData = [
    { name: 'Jan', projects: 12, tasks: 45 },
    { name: 'Feb', projects: 15, tasks: 52 },
    { name: 'Mar', projects: 18, tasks: 48 },
    { name: 'Apr', projects: 22, tasks: 61 },
    { name: 'May', projects: 25, tasks: 58 },
    { name: 'Jun', projects: 28, tasks: 67 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Project Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Collaborative project management and task tracking
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<Analytics />}>
            Analytics
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setProjectDialogOpen(true)}
          >
            New Project
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {projectStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Projects
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                  <Assignment sx={{ color: theme.palette.primary.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {projectStats.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                  <PlayArrow sx={{ color: theme.palette.warning.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {projectStats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                  <CheckCircle sx={{ color: theme.palette.success.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="error.main">
                    {projectStats.overdue}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                  <Warning sx={{ color: theme.palette.error.main }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, value) => setSelectedTab(value)}
          variant="fullWidth"
        >
          <Tab label="Projects" icon={<Assignment />} iconPosition="start" />
          <Tab label="Tasks" icon={<TaskAlt />} iconPosition="start" />
          <Tab label="Timeline" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<Analytics />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {selectedTab === 0 && (
            <Box>
              {/* Project Filters */}
              <Paper sx={{ ...glassmorphismStyle, p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <Search sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as ProjectStatus | 'all')}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="planning">Planning</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="review">Review</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="on_hold">On Hold</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Grid View">
                        <IconButton
                          color={viewMode === 'grid' ? 'primary' : 'default'}
                          onClick={() => setViewMode('grid')}
                        >
                          <ViewModule />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="List View">
                        <IconButton
                          color={viewMode === 'list' ? 'primary' : 'default'}
                          onClick={() => setViewMode('list')}
                        >
                          <ViewList />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Kanban View">
                        <IconButton
                          color={viewMode === 'kanban' ? 'primary' : 'default'}
                          onClick={() => setViewMode('kanban')}
                        >
                          <ViewKanban />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setProjectDialogOpen(true)}
                    >
                      New Project
                    </Button>
                  </Grid>
                </Grid>
              </Paper>

              {/* Projects */}
              <Grid container spacing={3}>
                {filteredProjects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project.id}>
                    <ProjectCard
                      project={project}
                      onEdit={() => handleProjectEdit(project)}
                      onDelete={() => handleProjectDelete(project.id)}
                      onView={() => handleProjectView(project)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedTab === 1 && (
            <Box>
              {/* Task Stats */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={glassmorphismStyle}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="primary.main">
                            {taskStats.total}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Tasks
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          <TaskAlt sx={{ color: theme.palette.primary.main }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={glassmorphismStyle}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="warning.main">
                            {taskStats.inProgress}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            In Progress
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                          <PlayArrow sx={{ color: theme.palette.warning.main }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={glassmorphismStyle}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {taskStats.completed}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Completed
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                          <CheckCircle sx={{ color: theme.palette.success.main }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={glassmorphismStyle}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="error.main">
                            {taskStats.overdue}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Overdue
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                          <Warning sx={{ color: theme.palette.error.main }} />
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Tasks */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={glassmorphismStyle}>
                    <Box p={3}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Active Tasks
                      </Typography>
                      {mockTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={() => console.log('Edit task:', task.id)}
                          onDelete={() => console.log('Delete task:', task.id)}
                          onStatusChange={(status) => handleTaskStatusChange(task.id, status)}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={glassmorphismStyle}>
                    <Box p={3}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Task Distribution
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'To Do', value: 12, color: theme.palette.info.main },
                              { name: 'In Progress', value: 8, color: theme.palette.warning.main },
                              { name: 'Review', value: 5, color: theme.palette.secondary.main },
                              { name: 'Completed', value: 23, color: theme.palette.success.main },
                              { name: 'Blocked', value: 2, color: theme.palette.error.main },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[
                              { name: 'To Do', value: 12, color: theme.palette.info.main },
                              { name: 'In Progress', value: 8, color: theme.palette.warning.main },
                              { name: 'Review', value: 5, color: theme.palette.secondary.main },
                              { name: 'Completed', value: 23, color: theme.palette.success.main },
                              { name: 'Blocked', value: 2, color: theme.palette.error.main },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}

          {selectedTab === 2 && (
            <Paper sx={glassmorphismStyle}>
              <Box p={3}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Project Timeline
                </Typography>
                <Timeline>
                  {mockProjects.map((project, index) => (
                    <TimelineItem key={project.id}>
                      <TimelineOppositeContent sx={{ m: 'auto 0' }} variant="body2" color="text.secondary">
                        {format(project.startDate, 'MMM dd, yyyy')}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineConnector />
                        <TimelineDot
                          sx={{
                            bgcolor: project.status === 'completed' ? 'success.main' : 
                                   project.status === 'in_progress' ? 'warning.main' : 'info.main'
                          }}
                        >
                          <Assignment />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                          {project.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.description}
                        </Typography>
                        <Box mt={1}>
                          <Chip
                            label={project.status.replace('_', ' ')}
                            size="small"
                            color={
                              project.status === 'completed' ? 'success' :
                              project.status === 'in_progress' ? 'warning' : 'info'
                            }
                          />
                        </Box>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </Box>
            </Paper>
          )}

          {selectedTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Project & Task Trends" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="projects"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          name="Projects"
                        />
                        <Line
                          type="monotone"
                          dataKey="tasks"
                          stroke={theme.palette.secondary.main}
                          strokeWidth={2}
                          name="Tasks"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={glassmorphismStyle}>
                  <CardHeader title="Project Status Distribution" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Planning', value: 3, color: theme.palette.info.main },
                            { name: 'In Progress', value: 8, color: theme.palette.warning.main },
                            { name: 'Review', value: 2, color: theme.palette.secondary.main },
                            { name: 'Completed', value: 15, color: theme.palette.success.main },
                            { name: 'On Hold', value: 1, color: theme.palette.grey[500] },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Planning', value: 3, color: theme.palette.info.main },
                            { name: 'In Progress', value: 8, color: theme.palette.warning.main },
                            { name: 'Review', value: 2, color: theme.palette.secondary.main },
                            { name: 'Completed', value: 15, color: theme.palette.success.main },
                            { name: 'On Hold', value: 1, color: theme.palette.grey[500] },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Project Creation/Edit Dialog */}
      <ProjectCreationDialog
        open={projectDialogOpen}
        onClose={() => {
          setProjectDialogOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />
    </Box>
  );
};

export default ProjectManagement;