import {
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  LockClosedIcon,
  MapIcon,
  PhoneIcon,
  ShareIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  TrophyIcon,
  TvIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type FeatureIconName =
  | "PhoneCall"
  | "Compass"
  | "Users"
  | "Tv"
  | "MessageSquare"
  | "Trophy"
  | "Lock"
  | "Sparkles"
  | "Video"
  | "ShieldAlert"
  | "Bell"
  | "Calendar"
  | "BookOpen";

export type FeatureData = {
  id: number;
  title: string;
  description: string;
  icon: FeatureIconName;
  image: string;
};

export const FEATURE_ICON_MAP: Record<FeatureIconName, HeroIcon> = {
  PhoneCall: PhoneIcon,
  Compass: MapIcon,
  Users: UserGroupIcon,
  Tv: TvIcon,
  MessageSquare: ChatBubbleLeftRightIcon,
  Trophy: TrophyIcon,
  Lock: LockClosedIcon,
  Sparkles: SparklesIcon,
  Video: VideoCameraIcon,
  ShieldAlert: ShieldExclamationIcon,
  Bell: BellIcon,
  Calendar: CalendarDaysIcon,
  BookOpen: BookOpenIcon,
};

const FEATURE_IMAGES = {
  onboarding: "/assets/features/1onboardingcall.png",
  community: "/assets/features/2community.png",
  weeklySessions: "/assets/features/3weeklysessions.png",
  unlimitedQna: "/assets/features/4unlimitedqna.png",
  proModules: "/assets/features/5promodules.png",
  weeklyContests: "/assets/features/6weeklycontests.png",
  handPickedProjects: "/assets/features/7hand-pickedossprojects.png",
  proRecordings: "/assets/features/8prorecordings.png",
  privateThreads: "/assets/features/9pvtthreads.png",
  updates: "/assets/features/10updates-n-opportunities.png",
  prorefs: "/assets/features/11prorefs.png",
} as const;

export const FEATURES_DATA: FeatureData[] = [
  {
    id: 1,
    title: "1-on-1 Onboarding Call",
    description:
      "An onboarding call directly with me to set up the precise direction for your goals in open source.",
    icon: "PhoneCall",
    image: FEATURE_IMAGES.onboarding,
  },
  {
    id: 2,
    title: "Feedback & Guidance",
    description:
      "Expert feedback and guidance on anything related to open source—be it programs like GSoC, LFX, Summer of Bitcoin, or landing remote jobs and internships at commercial open source startups.",
    icon: "Compass",
    image: FEATURE_IMAGES.privateThreads,
  },
  {
    id: 3,
    title: "Exclusive Pro Community",
    description:
      "A highly active, small-token, limited community full of cracked engineers where you get personal attention from me 24/7/365.",
    icon: "Users",
    image: FEATURE_IMAGES.community,
  },
  {
    id: 4,
    title: "Weekly Live Sessions",
    description:
      "Interactive weekly live sessions covering the exact technical and career topics of your choice.",
    icon: "Tv",
    image: FEATURE_IMAGES.weeklySessions,
  },
  {
    id: 5,
    title: "Unlimited Direct Q&A",
    description:
      "Ask anything, anytime, directly to me. Get your answers straight from the source with no TAs in the middle.",
    icon: "MessageSquare",
    image: FEATURE_IMAGES.unlimitedQna,
  },
  {
    id: 6,
    title: "Weekly Contests",
    description:
      "Participate in weekly open-source contests designed around building in public and mastering first principles.",
    icon: "Trophy",
    image: FEATURE_IMAGES.weeklyContests,
  },
  {
    id: 7,
    title: "Dedicated Pro Content",
    description:
      "Access dedicated content on open source, building in public, and first principles that you can't find anywhere else on the internet. Exclusive to OpenSox Pro members.",
    icon: "Lock",
    image: FEATURE_IMAGES.proModules,
  },
  {
    id: 8,
    title: "Hand-Picked Projects",
    description:
      "Cut through the BS with hand-picked open-source projects so you can start contributing from day one.",
    icon: "Sparkles",
    image: FEATURE_IMAGES.handPickedProjects,
  },
  {
    id: 9,
    title: "Timestamped Recordings",
    description:
      "Access recordings of all previous weekly sessions, meticulously organized by topics and precise timestamps.",
    icon: "Video",
    image: FEATURE_IMAGES.proRecordings,
  },
  {
    id: 10,
    title: "Private Threads",
    description:
      "Wanna ask something personal? Open a secure, private thread with me anytime.",
    icon: "ShieldAlert",
    image: FEATURE_IMAGES.privateThreads,
  },
  {
    id: 11,
    title: "Latest Alpha & Updates",
    description:
      "Stay ahead with the latest updates on anything related to open source, remote job openings, emerging tech, and more.",
    icon: "Bell",
    image: FEATURE_IMAGES.updates,
  },
  {
    id: 12,
    title: "Daily Stand-ups",
    description:
      "Keep your momentum and stay accountable with daily stand-ups alongside the rest of the cohort.",
    icon: "Calendar",
    image: FEATURE_IMAGES.weeklySessions,
  },
  {
    id: 13,
    title: "Pro References",
    description:
      "A consolidated place of the best hand-picked resources and references on the internet.",
    icon: "BookOpen",
    image: FEATURE_IMAGES.prorefs,
  },
];
