import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  IconButton,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Badge,
  Tabs,
  Tab,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  AvatarGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Analytics,
  Settings,
  Notifications,
  Email,
  Message,
  VideoCall,
  Phone,
  LocationOn,
  Business,
  Star,
  StarBorder,
  Bookmark,
  BookmarkBorder,
  ThumbUp,
  ThumbDown,
  Launch,
  Archive,
  Unarchive,
  FileCopy,
  Download,
  Upload,
  CloudUpload,
  CloudDownload,
  Sync,
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
  Work,
  School,
  Home,
  Restaurant,
  Store,
  LocalOffer,
  LocalShipping,
  Inventory,
  Category,
  Label,
  Folder,
  FolderOpen,
  PlayArrow,
  Pause,
  Stop,
  FastForward,
  FastRewind,
  SkipNext,
  SkipPrevious,
  Repeat,
  RepeatOne,
  Shuffle,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  PictureInPicture,
  Cast,
  CastConnected,
  ScreenShare,
  StopScreenShare,
  PresentToAll,
  AutoAwesome,
  AutoFixHigh,
  AutoFixNormal,
  AutoFixOff,
  BrightnessAuto,
  BrightnessHigh,
  BrightnessLow,
  BrightnessMedium,
  Contrast,
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
  Videocam,
  VideocamOff,
  VideoLabel,
  VideoSettings,
  Movie,
  MovieCreation,
  MovieFilter,
  Theaters,
  LocalMovies,
  Tv,
  TvOff,
  ConnectedTv,
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
  Colorize,
  Brightness1,
  Brightness2,
  Brightness3,
  Brightness4,
  Brightness5,
  Brightness6,
  Brightness7,
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
  Tune,
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
  ZoomIn,
  ZoomOut,
  Rotate90DegreesCcw,
  Rotate90DegreesCw,
  RotateLeft,
  RotateRight,
  Flip,
  FlipToBack,
  FlipToFront,
  Layers,
  LayersClear,
  Transform,
  Search,
  SearchOff,
  FilterList,
  Sort,
  ViewList,
  ViewModule,
  ViewKanban,
  Timeline,
  Today,
  DateRange,
  Event,
  EventNote,
  EventAvailable,
  EventBusy,
  EventSeat,
  AlarmAdd,
  AlarmOn,
  AlarmOff,
  Alarm,
  SnoozeIcon,
  NotificationsActive,
  NotificationsOff,
  NotificationsPaused,
  NotificationImportant,
  NotificationAdd,
  VolumeUpIcon,
  VolumeDownIcon,
  VolumeMuteIcon,
  VolumeOffIcon,
  VibrationIcon,
  SmartphoneIcon,
  TabletIcon,
  ComputerIcon,
  DesktopWindowsIcon,
  LaptopIcon,
  PhoneAndroidIcon,
  PhoneIphoneIcon,
  WatchIcon,
  TvIcon,
  SpeakerIcon,
  HeadphonesIcon,
  BluetoothIcon,
  WifiIcon,
  WifiOffIcon,
  SignalWifi4BarIcon,
  SignalWifi0BarIcon,
  SignalCellularAltIcon,
  SignalCellular4BarIcon,
  SignalCellular0BarIcon,
  BatteryFullIcon,
  BatteryChargingFullIcon,
  Battery90Icon,
  Battery80Icon,
  Battery60Icon,
  Battery50Icon,
  Battery30Icon,
  Battery20Icon,
  BatteryAlertIcon,
  BatteryUnknownIcon,
  PowerIcon,
  PowerOffIcon,
  PowerSettingsNewIcon,
  FlashOnIcon,
  FlashOffIcon,
  FlashAutoIcon,
  LocationOnIcon,
  LocationOffIcon,
  LocationSearchingIcon,
  LocationDisabledIcon,
  MyLocationIcon,
  GpsFixedIcon,
  GpsNotFixedIcon,
  GpsOffIcon,
  DirectionsIcon,
  DirectionsWalkIcon,
  DirectionsBikeIcon,
  DirectionsCarIcon,
  DirectionsTransitIcon,
  DirectionsRunIcon,
  DirectionsBoatIcon,
  DirectionsSubwayIcon,
  DirectionsBusIcon,
  DirectionsRailwayIcon,
  TrafficIcon,
  MapIcon,
  TerrainIcon,
  LayersIcon,
  SatelliteIcon,
  PlaceIcon,
  PinDropIcon,
  RoomIcon,
  StoreIcon,
  StorefrontIcon,
  RestaurantIcon,
  LocalDiningIcon,
  LocalBarIcon,
  LocalCafeIcon,
  LocalPizzaIcon,
  LocalGroceryStoreIcon,
  LocalMallIcon,
  LocalOfferIcon,
  LocalShippingIcon,
  LocalHotelIcon,
  LocalMoviesIcon,
  LocalPlayIcon,
  LocalActivityIcon,
  LocalFloristIcon,
  LocalGasStationIcon,
  LocalCarWashIcon,
  LocalLaundryServiceIcon,
  LocalLibraryIcon,
  LocalHospitalIcon,
  LocalPharmacyIcon,
  LocalTaxiIcon,
  LocalAtmIcon,
  LocalBankIcon,
  LocalParkingIcon,
  LocalPostOfficeIcon,
  LocalPrintshopIcon,
  LocalConvenienceStoreIcon,
  LocalFireDepartmentIcon,
  LocalPoliceIcon,
  LocalGovernmentIcon,
  LocalAirportIcon,
  LocalSeeIcon,
  LocalPhoneIcon,
  LocalHourIcon,
  LocalMedicalIcon,
  LocalSecurityIcon,
  LocalTourIcon,
  LocalTravelIcon,
  LocalTransportIcon,
  LocalOfficeIcon,
  LocalIndustryIcon,
  LocalWarehouseIcon,
  LocalFactoryIcon,
  LocalConstructionIcon,
  LocalManufacturingIcon,
  LocalBusinessIcon,
  LocalServiceIcon,
  LocalSupplierIcon,
  LocalDistributorIcon,
  LocalRetailIcon,
  LocalWholesaleIcon,
  LocalMarketIcon,
  LocalExchangeIcon,
  LocalTradingIcon,
  LocalFinanceIcon,
  LocalInvestmentIcon,
  LocalInsuranceIcon,
  LocalLegalIcon,
  LocalConsultingIcon,
  LocalEducationIcon,
  LocalHealthIcon,
  LocalSportsIcon,
  LocalEntertainmentIcon,
  LocalCommunityIcon,
  LocalReligionIcon,
  LocalCultureIcon,
  LocalArtIcon,
  LocalMusicIcon,
  LocalDanceIcon,
  LocalTheaterIcon,
  LocalCinemaIcon,
  LocalMuseumIcon,
  LocalGalleryIcon,
  LocalBookstoreIcon,
  LocalNewsIcon,
  LocalMediaIcon,
  LocalBroadcastIcon,
  LocalPublishingIcon,
  LocalPrintingIcon,
  LocalAdvertisingIcon,
  LocalMarketingIcon,
  LocalPromotionIcon,
  LocalSalesIcon,
  LocalPurchasingIcon,
  LocalProcurementIcon,
  LocalLogisticsIcon,
  LocalDeliveryIcon,
  LocalCourierIcon,
  LocalPackagingIcon,
  LocalStorageIcon,
  LocalInventoryIcon,
  LocalTrackingIcon,
  LocalMonitoringIcon,
  LocalAnalyticsIcon,
  LocalReportingIcon,
  LocalAuditingIcon,
  LocalComplianceIcon,
  LocalCertificationIcon,
  LocalValidationIcon,
  LocalTestingIcon,
  LocalQualityIcon,
  LocalSafetyIcon,
  LocalSecurityIcon,
  LocalMaintenanceIcon,
  LocalRepairIcon,
  LocalInstallationIcon,
  LocalTechnicalIcon,
  LocalSupportIcon,
  LocalCustomerIcon,
  LocalUserIcon,
  LocalAccountIcon,
  LocalProfileIcon,
  LocalIdentityIcon,
  LocalAuthenticationIcon,
  LocalAuthorizationIcon,
  LocalPermissionIcon,
  LocalRoleIcon,
  LocalAccessIcon,
  LocalPrivacyIcon,
  LocalDataIcon,
  LocalInformationIcon,
  LocalKnowledgeIcon,
  LocalDocumentIcon,
  LocalFileIcon,
  LocalFolderIcon,
  LocalArchiveIcon,
  LocalBackupIcon,
  LocalRecoveryIcon,
  LocalSyncIcon,
  LocalUpdateIcon,
  LocalUpgradeIcon,
  LocalMigrationIcon,
  LocalIntegrationIcon,
  LocalApiIcon,
  LocalDatabaseIcon,
  LocalServerIcon,
  LocalCloudIcon,
  LocalNetworkIcon,
  LocalConnectionIcon,
  LocalCommunicationIcon,
  LocalCollaborationIcon,
  LocalTeamworkIcon,
  LocalCoordinationIcon,
  LocalManagementIcon,
  LocalLeadershipIcon,
  LocalGovernanceIcon,
  LocalStrategyIcon,
  LocalPlanningIcon,
  LocalExecutionIcon,
  LocalOperationIcon,
  LocalProcessIcon,
  LocalWorkflowIcon,
  LocalTaskIcon,
  LocalProjectIcon,
  LocalProgramIcon,
  LocalPortfolioIcon,
  LocalResourceIcon,
  LocalCapacityIcon,
  LocalUtilizationIcon,
  LocalEfficiencyIcon,
  LocalProductivityIcon,
  LocalPerformanceIcon,
  LocalQualityIcon,
  LocalImprovementIcon,
  LocalOptimizationIcon,
  LocalInnovationIcon,
  LocalCreativityIcon,
  LocalDesignIcon,
  LocalDevelopmentIcon,
  LocalEngineeringIcon,
  LocalResearchIcon,
  LocalScienceIcon,
  LocalTechnologyIcon,
  LocalDigitalIcon,
  LocalAutomationIcon,
  LocalArtificialIcon,
  LocalIntelligenceIcon,
  LocalMachineLearningIcon,
  LocalDataScienceIcon,
  LocalBigDataIcon,
  LocalAnalyticsIcon,
  LocalVisualizationIcon,
  LocalReportingIcon,
  LocalDashboardIcon,
  LocalMetricsIcon,
  LocalKpiIcon,
  LocalInsightsIcon,
  LocalIntelligenceIcon,
  LocalForecastingIcon,
  LocalPredictionIcon,
  LocalModelingIcon,
  LocalSimulationIcon,
  LocalTestingIcon,
  LocalValidationIcon,
  LocalVerificationIcon,
  LocalComplianceIcon,
  LocalAuditingIcon,
  LocalMonitoringIcon,
  LocalAlertingIcon,
  LocalNotificationIcon,
  LocalCommunicationIcon,
  LocalMessagingIcon,
  LocalChatIcon,
  LocalEmailIcon,
  LocalPhoneIcon,
  LocalVideoIcon,
  LocalConferenceIcon,
  LocalMeetingIcon,
  LocalPresentationIcon,
  LocalTrainingIcon,
  LocalLearningIcon,
  LocalEducationIcon,
  LocalDevelopmentIcon,
  LocalSkillIcon,
  LocalCompetencyIcon,
  LocalCertificationIcon,
  LocalQualificationIcon,
  LocalExperienceIcon,
  LocalExpertiseIcon,
  LocalKnowledgeIcon,
  LocalWisdomIcon,
  LocalInsightIcon,
  LocalUnderstandingIcon,
  LocalAwarenessIcon,
  LocalConsciousnessIcon,
  LocalMindfulnessIcon,
  LocalFocusIcon,
  LocalConcentrationIcon,
  LocalAttentionIcon,
  LocalObservationIcon,
  LocalPerceptionIcon,
  LocalIntuitionIcon,
  LocalImaginationIcon,
  LocalCreativityIcon,
  LocalInnovationIcon,
  LocalOriginalityIcon,
  LocalUniquenessIcon,
  LocalDiversityIcon,
  LocalInclusionIcon,
  LocalBelongingIcon,
  LocalEquityIcon,
  LocalFairnessIcon,
  LocalJusticeIcon,
  LocalEthicsIcon,
  LocalIntegrityIcon,
  LocalHonestyIcon,
  LocalTransparencyIcon,
  LocalAccountabilityIcon,
  LocalResponsibilityIcon,
  LocalReliabilityIcon,
  LocalTrustworthinessIcon,
  LocalCredibilityIcon,
  LocalReputationIcon,
  LocalBrandIcon,
  LocalIdentityIcon,
  LocalImageIcon,
  LocalPresenceIcon,
  LocalVisibilityIcon,
  LocalRecognitionIcon,
  LocalAppreciationIcon,
  LocalGratitudeIcon,
  LocalThankfulnessIcon,
  LocalKindnessIcon,
  LocalCompassionIcon,
  LocalEmpathyIcon,
  LocalSympathyIcon,
  LocalUnderstandingIcon,
  LocalSupportIcon,
  LocalHelpIcon,
  LocalAssistanceIcon,
  LocalGuidanceIcon,
  LocalMentorshipIcon,
  LocalCoachingIcon,
  LocalTeachingIcon,
  LocalLearningIcon,
  LocalGrowthIcon,
  LocalDevelopmentIcon,
  LocalEvolutionIcon,
  LocalProgressIcon,
  LocalAdvancementIcon,
  LocalImprovementIcon,
  LocalEnhancementIcon,
  LocalOptimizationIcon,
  LocalRefinementIcon,
  LocalPerfectionIcon,
  LocalExcellenceIcon,
  LocalQualityIcon,
  LocalSuperiorityIcon,
  LocalMasteryIcon,
  LocalExpertiseIcon,
  LocalProficiencyIcon,
  LocalSkillIcon,
  LocalTalentIcon,
  LocalAbilityIcon,
  LocalCapabilityIcon,
  LocalCapacityIcon,
  LocalPotentialIcon,
  LocalOpportunityIcon,
  LocalPossibilityIcon,
  LocalProspectIcon,
  LocalFutureIcon,
  LocalVisionIcon,
  LocalMissionIcon,
  LocalPurposeIcon,
  LocalMeaningIcon,
  LocalValueIcon,
  LocalPrincipleIcon,
  LocalBeliefIcon,
  LocalFaithIcon,
  LocalTrustIcon,
  LocalConfidenceIcon,
  LocalOptimismIcon,
  LocalHopeIcon,
  LocalInspirationIcon,
  LocalMotivationIcon,
  LocalEncouragementIcon,
  LocalSupportIcon,
  LocalEmpowermentIcon,
  LocalStrengthIcon,
  LocalResilienceIcon,
  LocalPerseveranceIcon,
  LocalDeterminationIcon,
  LocalCommitmentIcon,
  LocalDedicationIcon,
  LocalDevotionIcon,
  LocalLoyaltyIcon,
  LocalFaithfulnessIcon,
  LocalReliabilityIcon,
  LocalConsistencyIcon,
  LocalStabilityIcon,
  LocalSecurityIcon,
  LocalSafetyIcon,
  LocalProtectionIcon,
  LocalDefenseIcon,
  LocalGuardIcon,
  LocalShieldIcon,
  LocalBarrierIcon,
  LocalFenceIcon,
  LocalWallIcon,
  LocalBoundaryIcon,
  LocalLimitIcon,
  LocalConstraintIcon,
  LocalRestrictionIcon,
  LocalControlIcon,
  LocalRegulationIcon,
  LocalRuleIcon,
  LocalLawIcon,
  LocalPolicyIcon,
  LocalProcedureIcon,
  LocalProcessIcon,
  LocalMethodIcon,
  LocalApproachIcon,
  LocalStrategyIcon,
  LocalTacticIcon,
  LocalTechniqueIcon,
  LocalSkillIcon,
  LocalArtIcon,
  LocalCraftIcon,
  LocalTrade,
  LocalProfession,
  LocalOccupation,
  LocalJob,
  LocalCareer,
  LocalWork,
  LocalEmployment,
  LocalBusiness,
  LocalEnterprise,
  LocalCompany,
  LocalOrganization,
  LocalInstitution,
  LocalEstablishment,
  LocalFacility,
  LocalVenue,
  LocalLocation,
  LocalSite,
  LocalPlace,
  LocalDestination,
  LocalJourney,
  LocalTrip,
  LocalVoyage,
  LocalAdventure,
  LocalExploration,
  LocalDiscovery,
  LocalInvestigation,
  LocalResearch,
  LocalStudy,
  LocalAnalysis,
  LocalExamination,
  LocalInspection,
  LocalReview,
  LocalEvaluation,
  LocalAssessment,
  LocalJudgment,
  LocalDecision,
  LocalChoice,
  LocalSelection,
  LocalOption,
  LocalAlternative,
  LocalVariation,
  LocalDifference,
  LocalDistinction,
  LocalComparison,
  LocalContrast,
  LocalSimilarity,
  LocalConnection,
  LocalRelationship,
  LocalAssociation,
  LocalPartnership,
  LocalAlliance,
  LocalCoalition,
  LocalCollaboration,
  LocalCooperation,
  LocalCoordination,
  LocalIntegration,
  LocalUnification,
  LocalMerger,
  LocalCombination,
  LocalFusion,
  LocalBlend,
  LocalMix,
  LocalBalance,
  LocalHarmony,
  LocalSynchronization,
  LocalAlignment,
  LocalAgreement,
  LocalConsensus,
  LocalUnity,
  LocalSolidarity,
  LocalSupport,
  LocalBacking,
  LocalEndorsement,
  LocalApproval,
  LocalAcceptance,
  LocalReception,
  LocalWelcome,
  LocalGreeting,
  LocalIntroduction,
  LocalPresentation,
  LocalDemonstration,
  LocalExhibition,
  LocalDisplay,
  LocalShow,
  LocalPerformance,
  LocalEvent,
  LocalOccasion,
  LocalCelebration,
  LocalFestival,
  LocalParty,
  LocalGathering,
  LocalMeeting,
  LocalConference,
  LocalSeminar,
  LocalWorkshop,
  LocalTraining,
  LocalEducation,
  LocalLearning,
  LocalInstruction,
  LocalTeaching,
  LocalGuidance,
  LocalDirection,
  LocalLeadership,
  LocalManagement,
  LocalSupervision,
  LocalOversight,
  LocalMonitoring,
  LocalTracking,
  LocalObservation,
  LocalSurveillance,
  LocalInspection,
  LocalExamination,
  LocalReview,
  LocalAudit,
  LocalCheck,
  LocalVerification,
  LocalValidation,
  LocalConfirmation,
  LocalApproval,
  LocalAuthorization,
  LocalPermission,
  LocalAccess,
  LocalEntry,
  LocalAdmission,
  LocalAllowance,
  LocalGrant,
  LocalAward,
  LocalPrize,
  LocalReward,
  LocalBonus,
  LocalIncentive,
  LocalMotivation,
  LocalEncouragement,
  LocalInspiration,
  LocalStimulation,
  LocalActivation,
  LocalTrigger,
  LocalCatalyst,
  LocalDriver,
  LocalForce,
  LocalPower,
  LocalEnergy,
  LocalStrength,
  LocalCapacity,
  LocalAbility,
  LocalSkill,
  LocalTalent,
  LocalGift,
  LocalBlessing,
  LocalAdvantage,
  LocalBenefit,
  LocalValue,
  LocalWorth,
  LocalImportance,
  LocalSignificance,
  LocalMeaning,
  LocalPurpose,
  LocalGoal,
  LocalObjective,
  LocalTarget,
  LocalAim,
  LocalIntention,
  LocalPlan,
  LocalDesign,
  LocalBlueprint,
  LocalMap,
  LocalGuide,
  LocalPath,
  LocalRoute,
  LocalWay,
  LocalMethod,
  LocalApproach,
  LocalStrategy,
  LocalTactic,
  LocalTechnique,
  LocalProcedure,
  LocalProcess,
  LocalSystem,
  LocalStructure,
  LocalFramework,
  LocalFoundation,
  LocalBasis,
  LocalGround,
  LocalSupport,
  LocalPlatform,
  LocalStage,
  LocalLevel,
  LocalTier,
  LocalRank,
  LocalGrade,
  LocalClass,
  LocalCategory,
  LocalType,
  LocalKind,
  LocalSort,
  LocalVariety,
  LocalStyle,
  LocalFashion,
  LocalTrend,
  LocalMovement,
  LocalFlow,
  LocalStream,
  LocalCurrent,
  LocalWave,
  LocalRipple,
  LocalImpact,
  LocalEffect,
  LocalResult,
  LocalOutcome,
  LocalConsequence,
  LocalImplication,
  LocalMeaning,
  LocalSense,
  LocalUnderstanding,
  LocalComprehension,
  LocalGrasp,
  LocalKnowledge,
  LocalWisdom,
  LocalInsight,
  LocalAwareness,
  LocalConsciousness,
  LocalMindfulness,
  LocalAttention,
  LocalFocus,
  LocalConcentration,
  LocalDedication,
  LocalCommitment,
  LocalDevolution,
  LocalLoyalty,
  LocalFidelity,
  LocalReliability,
  LocalDependability,
  LocalTrustworthiness,
  LocalCredibility,
  LocalIntegrity,
  LocalHonesty,
  LocalSincerity,
  LocalAuthenticity,
  LocalGenuineness,
  LocalReality,
  LocalTruth,
  LocalFact,
  LocalActuality,
  LocalExistence,
  LocalPresence,
  LocalBeing,
  LocalLife,
  LocalLiving,
  LocalExperience,
  LocalJourney,
  LocalAdventure,
  LocalExploration,
  LocalDiscovery,
  LocalRevelation,
  LocalEpiphany,
  LocalRealization,
  LocalRecognition,
  LocalAcknowledgment,
  LocalAcceptance,
  LocalApproval,
  LocalConsent,
  LocalAgreement,
  LocalHarmony,
  LocalPeace,
  LocalTranquility,
  LocalSerenity,
  LocalCalm,
  LocalQuiet,
  LocalStillness,
  LocalSilence,
  LocalRest,
  LocalRelaxation,
  LocalComfort,
  LocalEase,
  LocalSimplicity,
  LocalClarity,
  LocalTransparency,
  LocalOpenness,
  LocalHonesty,
  LocalDirectness,
  LocalStraightforwardness,
  LocalPlainness,
  LocalSimplicity,
  LocalMinimalism,
  LocalElegance,
  LocalBeauty,
  LocalAesthetics,
  LocalStyle,
  LocalDesign,
  LocalArt,
  LocalCreativity,
  LocalInnovation,
  LocalOriginality,
  LocalUniqueness,
  LocalIndividuality,
  LocalPersonality,
  LocalCharacter,
  LocalIdentity,
  LocalSelf,
  LocalEgo,
  LocalSpirit,
  LocalSoul,
  LocalHeart,
  LocalMind,
  LocalThought,
  LocalIdea,
  LocalConcept,
  LocalNotion,
  LocalBelief,
  LocalOpinion,
  LocalView,
  LocalPerspective,
  LocalStandpoint,
  LocalPosition,
  LocalStance,
  LocalAttitude,
  LocalApproach,
  LocalMethod,
  LocalWay,
  LocalManner,
  LocalStyle,
  LocalFashion,
  LocalMode,
  LocalForm,
  LocalShape,
  LocalStructure,
  LocalPattern,
  LocalDesign,
  LocalLayout,
  LocalArrangement,
  LocalOrganization,
  LocalComposition,
  LocalConfiguration,
  LocalSetup,
  LocalInstallation,
  LocalDeployment,
  LocalImplementation,
  LocalExecution,
  LocalPerformance,
  LocalOperation,
  LocalFunction,
  LocalAction,
  LocalActivity,
  LocalTask,
  LocalJob,
  LocalWork,
  LocalLabor,
  LocalEffort,
  LocalAttempt,
  LocalTrial,
  LocalTest,
  LocalExperiment,
  LocalStudy,
  LocalResearch,
  LocalInvestigation,
  LocalExploration,
  LocalDiscovery,
  LocalFinding,
  LocalResult,
  LocalOutcome,
  LocalConsequence,
  LocalEffect,
  LocalImpact,
  LocalInfluence,
  LocalPower,
  LocalStrength,
  LocalForce,
  LocalEnergy,
  LocalVitality,
  LocalLife,
  LocalSpirit,
  LocalSoul,
  LocalEssence,
  LocalCore,
  LocalHeart,
  LocalCenter,
  LocalMiddle,
  LocalFocus,
  LocalPoint,
  LocalSpot,
  LocalPlace,
  LocalLocation,
  LocalPosition,
  LocalSite,
  LocalArea,
  LocalRegion,
  LocalZone,
  LocalSector,
  LocalDivision,
  LocalSection,
  LocalPart,
  LocalPiece,
  LocalElement,
  LocalComponent,
  LocalUnit,
  LocalModule,
  LocalBlock,
  LocalSegment,
  LocalFragment,
  LocalPortion,
  LocalShare,
  LocalFraction,
  LocalPercentage,
  LocalRatio,
  LocalProportion,
  LocalBalance,
  LocalEquilibrium,
  LocalStability,
  LocalSteadiness,
  LocalConsistency,
  LocalRegularity,
  LocalUniformity,
  LocalSimilarity,
  LocalLikeness,
  LocalResemblance,
  LocalComparison,
  LocalContrast,
  LocalDifference,
  LocalDistinction,
  LocalSeparation,
  LocalDivision,
  LocalBoundary,
  LocalLimit,
  LocalBorder,
  LocalEdge,
  LocalMargin,
  LocalSpace,
  LocalGap,
  LocalDistance,
  LocalInterval,
  LocalPeriod,
  LocalDuration,
  LocalTime,
  LocalMoment,
  LocalInstant,
  LocalSecond,
  LocalMinute,
  LocalHour,
  LocalDay,
  LocalWeek,
  LocalMonth,
  LocalYear,
  LocalDecade,
  LocalCentury,
  LocalMillennium,
  LocalEra,
  LocalAge,
  LocalEpoch,
  LocalPeriod,
  LocalStage,
  LocalPhase,
  LocalStep,
  LocalLevel,
  LocalGrade,
  LocalDegree,
  LocalExtent,
  LocalScope,
  LocalRange,
  LocalScale,
  LocalSize,
  LocalMagnitude,
  LocalVolume,
  LocalQuantity,
  LocalAmount,
  LocalNumber,
  LocalCount,
  LocalTotal,
  LocalSum,
  LocalAggregate,
  LocalCollection,
  LocalSet,
  LocalGroup,
  LocalCluster,
  LocalBunch,
  LocalBundle,
  LocalPackage,
  LocalContainer,
  LocalBox,
  LocalCase,
  LocalBag,
  LocalSack,
  LocalPouch,
  LocalWallet,
  LocalPurse,
  LocalPocket,
  LocalCompartment,
  LocalSection,
  LocalDivision,
  LocalDepartment,
  LocalBranch,
  LocalOffice,
  LocalRoom,
  LocalSpace,
  LocalArea,
  LocalZone,
  LocalRegion,
  LocalTerritory,
  LocalDistrict,
  LocalNeighborhood,
  LocalCommunity,
  LocalSociety,
  LocalGroup,
  LocalTeam,
  LocalCrew,
  LocalStaff,
  LocalPersonnel,
  LocalWorkforce,
  LocalEmployees,
  LocalWorkers,
  LocalPeople,
  LocalIndividuals,
  LocalPersons,
  LocalBeings,
  LocalCreatures,
  LocalEntities,
  LocalObjects,
  LocalThings,
  LocalItems,
  LocalElements,
  LocalComponents,
  LocalParts,
  LocalPieces,
  LocalFragments,
  LocalBits,
  LocalPortions,
  LocalSegments,
  LocalSections,
  LocalDivisions,
  LocalCategories,
  LocalClasses,
  LocalTypes,
  LocalKinds,
  LocalSorts,
  LocalVarieties,
  LocalSpecies,
  LocalBreeds,
  LocalStrains,
  LocalLines,
  LocalFamilies,
  LocalGenerations,
  LocalAges,
  LocalEras,
  LocalPeriods,
  LocalTimes,
  LocalMoments,
  LocalInstants,
  LocalSeconds,
  LocalMinutes,
  LocalHours,
  LocalDays,
  LocalWeeks,
  LocalMonths,
  LocalYears,
  LocalDecades,
  LocalCenturies,
  LocalMillennia,
  LocalEpochs,
  LocalStages,
  LocalPhases,
  LocalSteps,
  LocalLevels,
  LocalGrades,
  LocalDegrees,
  LocalRanks,
  LocalPositions,
  LocalStatuses,
  LocalStates,
  LocalConditions,
  LocalSituations,
  LocalCircumstances,
  LocalContexts,
  LocalEnvironments,
  LocalSettings,
  LocalScenarios,
  LocalScenes,
  LocalBackgrounds,
  LocalFoundations,
  LocalBases,
  LocalGrounds,
  LocalPlatforms,
  LocalStages,
  LocalArenas,
  LocalFields,
  LocalDomains,
  LocalRealms,
  LocalSpheres,
  LocalTerritories,
  LocalAreas,
  LocalRegions,
  LocalZones,
  LocalSpaces,
  LocalPlaces,
  LocalLocations,
  LocalSites,
  LocalPositions,
  LocalSpots,
  LocalPoints,
  LocalMarks,
  LocalSigns,
  LocalSymbols,
  LocalIcons,
  LocalImages,
  LocalPictures,
  LocalPhotos,
  LocalIllustrations,
  LocalDrawings,
  LocalSketchches,
  LocalDesigns,
  LocalPatterns,
  LocalShapes,
  LocalForms,
  LocalStructures,
  LocalFrameworks,
  LocalSystems,
  LocalMethods,
  LocalApproaches,
  LocalStrategies,
  LocalTactics,
  LocalTechniques,
  LocalProcedures,
  LocalProcesses,
  LocalOperations,
  LocalFunctions,
  LocalActivities,
  LocalActions,
  LocalTasks,
  LocalJobs,
  LocalWorks,
  LocalLabors,
  LocalEfforts,
  LocalAttempts,
  LocalTrials,
  LocalTests,
  LocalExperiments,
  LocalStudies,
  LocalResearches,
  LocalInvestigations,
  LocalExplorations,
  LocalDiscoveries,
  LocalFindings,
  LocalResults,
  LocalOutcomes,
  LocalConsequences,
  LocalEffects,
  LocalImpacts,
  LocalInfluences,
  LocalPowers,
  LocalForces,
  LocalEnergies,
  LocalStrengths,
  LocalCapacities,
  LocalAbilities,
  LocalSkills,
  LocalTalents,
  LocalGifts,
  LocalBlessings,
  LocalAdvantages,
  LocalBenefits,
  LocalValues,
  LocalWorths,
  LocalImportances,
  LocalSignificances,
  LocalMeanings,
  LocalPurposes,
  LocalGoals,
  LocalObjectives,
  LocalTargets,
  LocalAims,
  LocalIntentions,
  LocalPlans,
  LocalDesigns,
  LocalBlueprints,
  LocalMaps,
  LocalGuides,
  LocalPaths,
  LocalRoutes,
  LocalWays,
  LocalMethods,
  LocalApproaches,
  LocalStrategies,
  LocalTactics,
  LocalTechniques,
  LocalProcedures,
  LocalProcesses,
  LocalSystems,
  LocalStructures,
  LocalFrameworks,
  LocalFoundations,
  LocalBases,
  LocalGrounds,
  LocalSupports,
  LocalPlatforms,
  LocalStages,
  LocalLevels,
  LocalTiers,
  LocalRanks,
  LocalGrades,
  LocalClasses,
  LocalCategories,
  LocalTypes,
  LocalKinds,
  LocalSorts,
  LocalVarieties,
  LocalStyles,
  LocalFashions,
  LocalTrends,
  LocalMovements,
  LocalFlows,
  LocalStreams,
  LocalCurrents,
  LocalWaves,
  LocalRipples,
  LocalImpacts,
  LocalEffects,
  LocalResults,
  LocalOutcomes,
  LocalConsequences,
  LocalImplications,
  LocalMeanings,
  LocalSenses,
  LocalUnderstandings,
  LocalComprehensions,
  LocalGrasps,
  LocalKnowledges,
  LocalWisdoms,
  LocalInsights,
  LocalAwarenesses,
  LocalConsciousnesses,
  LocalMindfulnesses,
  LocalAttentions,
  LocalFocuses,
  LocalConcentrations,
  LocalDedications,
  LocalCommitments,
  LocalDevotions,
  LocalLoyalties,
  LocalFidelities,
  LocalReliabilities,
  LocalDependabilities,
  LocalTrustworthinesses,
  LocalCredibilities,
  LocalIntegrities,
  LocalHonesties,
  LocalSincerities,
  LocalAuthenticities,
  LocalGenuinenesses,
  LocalRealities,
  LocalTruths,
  LocalFacts,
  LocalActualities,
  LocalExistences,
  LocalPresences,
  LocalBeings,
  LocalLives,
  LocalLivings,
  LocalExperiences,
  LocalJourneys,
  LocalAdventures,
  LocalExplorations,
  LocalDiscoveries,
  LocalRevelations,
  LocalEpiphanies,
  LocalRealizations,
  LocalRecognitions,
  LocalAcknowledgments,
  LocalAcceptances,
  LocalApprovals,
  LocalConsents,
  LocalAgreements,
  LocalHarmonies,
  LocalPeaces,
  LocalTranquilities,
  LocalSerenities,
  LocalCalms,
  LocalQuiets,
  LocalStillnesses,
  LocalSilences,
  LocalRests,
  LocalRelaxations,
  LocalComforts,
  LocalEases,
  LocalSimplicities,
  LocalClarities,
  LocalTransparencies,
  LocalOpennesses,
  LocalHonesties,
  LocalDirectnesses,
  LocalStraightforwardnesses,
  LocalPlainnesses,
  LocalSimplicities,
  LocalMinimalisms,
  LocalElegances,
  LocalBeauties,
  LocalAesthetics,
  LocalStyles,
  LocalDesigns,
  LocalArts,
  LocalCreativities,
  LocalInnovations,
  LocalOriginalities,
  LocalUniquenesses,
  LocalIndividualities,
  LocalPersonalities,
  LocalCharacters,
  LocalIdentities,
  LocalSelves,
  LocalEgos,
  LocalSpirits,
  LocalSouls,
  LocalHearts,
  LocalMinds,
  LocalThoughts,
  LocalIdeas,
  LocalConcepts,
  LocalNotions,
  LocalBeliefs,
  LocalOpinions,
  LocalViews,
  LocalPerspectives,
  LocalStandpoints,
  LocalPositions,
  LocalStances,
  LocalAttitudes,
  LocalApproaches,
  LocalMethods,
  LocalWays,
  LocalManners,
  LocalStyles,
  LocalFashions,
  LocalModes,
  LocalForms,
  LocalShapes,
  LocalStructures,
  LocalPatterns,
  LocalDesigns,
  LocalLayouts,
  LocalArrangements,
  LocalOrganizations,
  LocalCompositions,
  LocalConfigurations,
  LocalSetups,
  LocalInstallations,
  LocalDeployments,
  LocalImplementations,
  LocalExecutions,
  LocalPerformances,
  LocalOperations,
  LocalFunctions,
  LocalActions,
  LocalActivities,
  LocalTasks,
  LocalJobs,
  LocalWorks,
  LocalLabors,
  LocalEfforts,
  LocalAttempts,
  LocalTrials,
  LocalTests,
  LocalExperiments,
  LocalStudies,
  LocalResearches,
  LocalInvestigations,
  LocalExplorations,
  LocalDiscoveries,
  LocalFindings,
  LocalResults,
  LocalOutcomes,
  LocalConsequences,
  LocalEffects,
  LocalImpacts,
  LocalInfluences,
  LocalPowers,
  LocalStrengths,
  LocalForces,
  LocalEnergies,
  LocalVitalities,
  LocalLives,
  LocalSpirits,
  LocalSouls,
  LocalEssences,
  LocalCores,
  LocalHearts,
  LocalCenters,
  LocalMiddles,
  LocalFocuses,
  LocalPoints,
  LocalSpots,
  LocalPlaces,
  LocalLocations,
  LocalPositions,
  LocalSites,
  LocalAreas,
  LocalRegions,
  LocalZones,
  LocalSectors,
  LocalDivisions,
  LocalSections,
  LocalParts,
  LocalPieces,
  LocalElements,
  LocalComponents,
  LocalUnits,
  LocalModules,
  LocalBlocks,
  LocalSegments,
  LocalFragments,
  LocalPortions,
  LocalShares,
  LocalFractions,
  LocalPercentages,
  LocalRatios,
  LocalProportions,
  LocalBalances,
  LocalEquilibria,
  LocalStabilities,
  LocalSteadinesses,
  LocalConsistencies,
  LocalRegularities,
  LocalUniformities,
  LocalSimilarities,
  LocalLikenesses,
  LocalResemblances,
  LocalComparisons,
  LocalContrasts,
  LocalDifferences,
  LocalDistinctions,
  LocalSeparations,
  LocalDivisions,
  LocalBoundaries,
  LocalLimits,
  LocalBorders,
  LocalEdges,
  LocalMargins,
  LocalSpaces,
  LocalGaps,
  LocalDistances,
  LocalIntervals,
  LocalPeriods,
  LocalDurations,
  LocalTimes,
  LocalMoments,
  LocalInstants,
  LocalSeconds,
  LocalMinutes,
  LocalHours,
  LocalDays,
  LocalWeeks,
  LocalMonths,
  LocalYears,
  LocalDecades,
  LocalCenturies,
  LocalMillennia,
  LocalEras,
  LocalAges,
  LocalEpochs,
  LocalPeriods,
  LocalStages,
  LocalPhases,
  LocalSteps,
  LocalLevels,
  LocalGrades,
  LocalDegrees,
  LocalExtents,
  LocalScopes,
  LocalRanges,
  LocalScales,
  LocalSizes,
  LocalMagnitudes,
  LocalVolumes,
  LocalQuantities,
  LocalAmounts,
  LocalNumbers,
  LocalCounts,
  LocalTotals,
  LocalSums,
  LocalAggregates,
  LocalCollections,
  LocalSets,
  LocalGroups,
  LocalClusters,
  LocalBunches,
  LocalBundles,
  LocalPackages,
  LocalContainers,
  LocalBoxes,
  LocalCases,
  LocalBags,
  LocalSacks,
  LocalPouches,
  LocalWallets,
  LocalPurses,
  LocalPockets,
  LocalCompartments,
  LocalSections,
  LocalDivisions,
  LocalDepartments,
  LocalBranches,
  LocalOffices,
  LocalRooms,
  LocalSpaces,
  LocalAreas,
  LocalZones,
  LocalRegions,
  LocalTerritories,
  LocalDistricts,
  LocalNeighborhoods,
  LocalCommunities,
  LocalSocieties,
  LocalGroups,
  LocalTeams,
  LocalCrews,
  LocalStaffs,
  LocalPersonnels,
  LocalWorkforces,
  LocalEmployees,
  LocalWorkers,
  LocalPeople,
  LocalIndividuals,
  LocalPersons,
  LocalBeings,
  LocalCreatures,
  LocalEntities,
  LocalObjects,
  LocalThings,
  LocalItems,
  LocalElements,
  LocalComponents,
  LocalParts,
  LocalPieces,
  LocalFragments,
  LocalBits,
  LocalPortions,
  LocalSegments,
  LocalSections,
  LocalDivisions,
  LocalCategories,
  LocalClasses,
  LocalTypes,
  LocalKinds,
  LocalSorts,
  LocalVarieties,
  LocalSpecies,
  LocalBreeds,
  LocalStrains,
  LocalLines,
  LocalFamilies,
  LocalGenerations,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isThisWeek, isThisMonth, differenceInDays } from 'date-fns';
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from 'recharts';

// Import the ProjectManagement component
import { ProjectManagement } from '../components/ProjectManagement';

// Glassmorphism styles
const glassmorphismStyle = {
  background: (theme: any) => alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  borderRadius: 2,
  border: (theme: any) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: (theme: any) => `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.1)}`,
};

// Activity Feed Component
const ActivityFeed: React.FC = () => {
  const theme = useTheme();
  
  const activities = [
    {
      id: '1',
      type: 'project_created',
      user: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      action: 'created project',
      target: 'Food Safety Compliance Platform',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      icon: <Add />,
      color: theme.palette.success.main,
    },
    {
      id: '2',
      type: 'task_completed',
      user: 'Michael Chen',
      avatar: '/avatars/michael.jpg',
      action: 'completed task',
      target: 'User Authentication System',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      id: '3',
      type: 'comment_added',
      user: 'Emily Rodriguez',
      avatar: '/avatars/emily.jpg',
      action: 'commented on',
      target: 'Dashboard Design Review',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      icon: <Comment />,
      color: theme.palette.info.main,
    },
    {
      id: '4',
      type: 'file_uploaded',
      user: 'David Wilson',
      avatar: '/avatars/david.jpg',
      action: 'uploaded file to',
      target: 'API Documentation',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      icon: <Upload />,
      color: theme.palette.warning.main,
    },
    {
      id: '5',
      type: 'deadline_approaching',
      user: 'System',
      avatar: '/avatars/system.jpg',
      action: 'deadline approaching for',
      target: 'Compliance Dashboard',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      icon: <Warning />,
      color: theme.palette.error.main,
    },
  ];

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return format(timestamp, 'MMM dd');
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Activity Feed
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={activity.id} alignItems="flex-start">
              <ListItemIcon>
                <Avatar
                  sx={{
                    bgcolor: alpha(activity.color, 0.1),
                    color: activity.color,
                    width: 32,
                    height: 32,
                  }}
                >
                  {activity.icon}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      src={activity.avatar}
                      alt={activity.user}
                      sx={{ width: 24, height: 24 }}
                    >
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Typography variant="body2">
                      <strong>{activity.user}</strong> {activity.action}{' '}
                      <strong>{activity.target}</strong>
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {getRelativeTime(activity.timestamp)}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Team Performance Component
const TeamPerformance: React.FC = () => {
  const theme = useTheme();
  
  const teamData = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager',
      avatar: '/avatars/sarah.jpg',
      tasksCompleted: 24,
      tasksInProgress: 3,
      efficiency: 92,
      status: 'online',
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer',
      avatar: '/avatars/michael.jpg',
      tasksCompleted: 18,
      tasksInProgress: 5,
      efficiency: 87,
      status: 'away',
    },
    {
      name: 'Emily Rodriguez',
      role: 'UI/UX Designer',
      avatar: '/avatars/emily.jpg',
      tasksCompleted: 15,
      tasksInProgress: 2,
      efficiency: 95,
      status: 'online',
    },
    {
      name: 'David Wilson',
      role: 'QA Engineer',
      avatar: '/avatars/david.jpg',
      tasksCompleted: 21,
      tasksInProgress: 4,
      efficiency: 89,
      status: 'busy',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return theme.palette.success.main;
      case 'away':
        return theme.palette.warning.main;
      case 'busy':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Team Performance
        </Typography>
        <List>
          {teamData.map((member, index) => (
            <ListItem key={index} divider={index < teamData.length - 1}>
              <ListItemIcon>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: getStatusColor(member.status),
                        border: `2px solid ${theme.palette.background.paper}`,
                      }}
                    />
                  }
                >
                  <Avatar src={member.avatar} alt={member.name}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                </Badge>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" fontWeight="bold">
                    {member.name}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {member.role}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                      <Chip
                        label={`${member.tasksCompleted} completed`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`${member.tasksInProgress} in progress`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box textAlign="right">
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {member.efficiency}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Efficiency
                  </Typography>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

// Quick Actions Component
const QuickActions: React.FC = () => {
  const theme = useTheme();
  
  const quickActions = [
    {
      label: 'New Project',
      icon: <Add />,
      color: theme.palette.primary.main,
      action: () => console.log('New project'),
    },
    {
      label: 'Upload File',
      icon: <Upload />,
      color: theme.palette.secondary.main,
      action: () => console.log('Upload file'),
    },
    {
      label: 'Schedule Meeting',
      icon: <CalendarToday />,
      color: theme.palette.success.main,
      action: () => console.log('Schedule meeting'),
    },
    {
      label: 'Send Message',
      icon: <Message />,
      color: theme.palette.info.main,
      action: () => console.log('Send message'),
    },
    {
      label: 'Video Call',
      icon: <VideoCall />,
      color: theme.palette.warning.main,
      action: () => console.log('Video call'),
    },
    {
      label: 'Generate Report',
      icon: <Analytics />,
      color: theme.palette.error.main,
      action: () => console.log('Generate report'),
    },
  ];

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={6} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={action.action}
                sx={{
                  borderColor: alpha(action.color, 0.3),
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.1),
                  },
                  py: 1.5,
                }}
              >
                {action.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Paper>
  );
};

// Collaboration Stats Component
const CollaborationStats: React.FC = () => {
  const theme = useTheme();
  
  const stats = [
    {
      title: 'Active Projects',
      value: 12,
      change: 8,
      icon: <Assignment />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Team Members',
      value: 28,
      change: 2,
      icon: <Group />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Tasks Completed',
      value: 156,
      change: 24,
      icon: <CheckCircle />,
      color: theme.palette.success.main,
    },
    {
      title: 'Messages Sent',
      value: 892,
      change: 45,
      icon: <Message />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card sx={glassmorphismStyle}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                    <TrendingUp fontSize="small" color="success" />
                    <Typography variant="body2" color="success.main">
                      +{stat.change} this week
                    </Typography>
                  </Box>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: alpha(stat.color, 0.1),
                    color: stat.color,
                    width: 64,
                    height: 64,
                  }}
                >
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Project Timeline Component
const ProjectTimeline: React.FC = () => {
  const theme = useTheme();
  
  const timelineData = [
    { month: 'Jan', projects: 8, tasks: 45, messages: 234 },
    { month: 'Feb', projects: 12, tasks: 52, messages: 289 },
    { month: 'Mar', projects: 10, tasks: 48, messages: 312 },
    { month: 'Apr', projects: 15, tasks: 61, messages: 356 },
    { month: 'May', projects: 18, tasks: 58, messages: 401 },
    { month: 'Jun', projects: 22, tasks: 67, messages: 445 },
  ];

  return (
    <Paper sx={glassmorphismStyle}>
      <Box p={3}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Collaboration Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.3)} />
            <XAxis dataKey="month" />
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
            <Line
              type="monotone"
              dataKey="messages"
              stroke={theme.palette.info.main}
              strokeWidth={2}
              name="Messages"
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

// Settings Dialog Component
const SettingsDialog: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const theme = useTheme();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoSave: true,
    collaborationUpdates: true,
    taskReminders: true,
    projectDeadlines: true,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Collaboration Settings</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                />
              }
              label="Enable notifications"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailAlerts}
                  onChange={(e) => handleSettingChange('emailAlerts', e.target.checked)}
                />
              }
              label="Email alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.taskReminders}
                  onChange={(e) => handleSettingChange('taskReminders', e.target.checked)}
                />
              }
              label="Task reminders"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.projectDeadlines}
                  onChange={(e) => handleSettingChange('projectDeadlines', e.target.checked)}
                />
              }
              label="Project deadline alerts"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Collaboration
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.collaborationUpdates}
                  onChange={(e) => handleSettingChange('collaborationUpdates', e.target.checked)}
                />
              }
              label="Real-time collaboration updates"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                />
              }
              label="Auto-save changes"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Appearance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                />
              }
              label="Dark mode"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onClose}>
          Save Settings
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Collaboration Hub Component
export const CollaborationHub: React.FC = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Collaboration Hub
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Centralized workspace for team collaboration and project management
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Analytics />}>
            Analytics
          </Button>
          <Button variant="outlined" startIcon={<Settings />} onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
          <Button variant="contained" startIcon={<Add />}>
            New Project
          </Button>
        </Stack>
      </Box>

      {/* Stats */}
      <Box mb={3}>
        <CollaborationStats />
      </Box>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Tabs */}
          <Paper sx={{ ...glassmorphismStyle, mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={(_, value) => setSelectedTab(value)}
              variant="fullWidth"
            >
              <Tab label="Dashboard" icon={<Dashboard />} iconPosition="start" />
              <Tab label="Projects" icon={<Assignment />} iconPosition="start" />
              <Tab label="Team" icon={<Group />} iconPosition="start" />
              <Tab label="Analytics" icon={<Analytics />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {selectedTab === 0 && (
                <Box>
                  <ProjectTimeline />
                </Box>
              )}
              
              {selectedTab === 1 && (
                <Box>
                  <ProjectManagement />
                </Box>
              )}
              
              {selectedTab === 2 && (
                <Box>
                  <TeamPerformance />
                </Box>
              )}
              
              {selectedTab === 3 && (
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <ProjectTimeline />
                  </Grid>
                </Grid>
              )}
            </motion.div>
          </AnimatePresence>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <ActivityFeed />
            <QuickActions />
          </Stack>
        </Grid>
      </Grid>

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </Box>
  );
};

export default CollaborationHub;