/* eslint-disable */
import { FuseNavigationItem } from "@fuse/components/navigation";

export const defaultNavigation: FuseNavigationItem[] = [ 
  {
    id: "dashboard",
    title: "Dashboard",
    subtitle: "For admin management",
    type: "basic",
    icon: "heroicons_outline:home",
    link: "/dashboard",
    children: []
  },
  {
    id: "apps",
    title: "Management",
    subtitle: "Manage service & team",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "apps.users",
        title: "Patients List",
        key: "Patients List",
        type: "basic",
        icon: "heroicons_outline:user-group",
        link: "/apps/users",
      },
      {
        id: "apps.calendar",
        title: "Calender View",
        key: "Calender View",
        type: "basic",
        icon: "heroicons_outline:calendar",
        link: "/apps/calendar"
      },
    ],
  },
  {
    id: "calr",
    title: "Calender View",
    subtitle: "Calender View",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "calr.Calender View",
        title: "Calender View",
        key: "Calender View", 
        type: "basic",
        icon: "heroicons_outline:calendar",
        link: "/calr/calendar"
      },
    ],
  },

  {
    id: "repts",
    title: "Reports",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "repts.Reports",
        title: "Reports",
        key: "Reports",
        type: "basic",
        icon: "heroicons_outline:user-group",
        link: "/repts/reports", 
      },
    ],
  },
  {
    id: "cts",
    title: "chat",
    type: "group",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "cts.chat",
        title: "chart",
        key: "chart",
        type: "basic",
        icon: "heroicons_outline:user-group",
        link: "/cts/chat",
      },
    ],
  },
  {
    id: "pages",
    title: "More",
    subtitle: "Account activities",
    type: "group",
    icon: "heroicons_outline:document",
    children: [
      // {
      //   id: "pages.activities",
      //   title: "Activities",
      //   key: "Activities",
      //   type: "basic",
      //   icon: "heroicons_outline:menu-alt-2",
      //   link: "/pages/activities",
      // },

      {
        id: "pages.settings",
        title: "Settings",
        key: "Settings",
        type: "basic",
        icon: "heroicons_outline:cog",
        link: "/pages/settings",
      },

      // {
      //   id: "pages.blogs",
      //   title: "Blogs",
      //   type: "basic",
      //   key: "Blogs",
      //   icon: "heroicons_outline:lightning-bolt",
      //   link: "/pages/blogs",
      // },
    ],
  },
  {
    id: "activity",
    title: "activity",
    type: "basic",
    icon: "heroicons_outline:home",
    children: [
      {
        id: "activity.activities",
        title: "Activities",
        key: "Activities",
        type: "basic",
        icon: "heroicons_outline:menu-alt-2",
        link: "/activity/activities",
      },
    ],
  },
];
export const compactNavigation: FuseNavigationItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    type: "basic",
    icon: "heroicons_outline:home",
    link: "/dashboard",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "patientList",
    title: "PatientList",
    type: "basic",
    icon: "heroicons_outline:user-group",
    link: "/patient-list",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "requests",
    title: "Request",
    type: "basic",
    link: "/apps/request",
    icon: "heroicons_outline:user-group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "subscriptions",
    title: "Expert Opinion",
    type: "basic",
    link: "/apps/second-opinion-subscriptions",
    icon: "heroicons_outline:user-group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "kidneyCareSubscriptions",
    title: "Disease Management",
    type: "basic",
    link: "/apps/kidney-care-subscriptions",
    icon: "heroicons_outline:user-group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "queue",
    title: "Queue",
    type: "basic",
    link: "/apps/queue",
    icon: "heroicons_outline:user-group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  
  {
    id: "calendar",
    title: "Appointments",
    type: "basic",
    link: "/calr/calendar",
    icon: "heroicons_outline:calendar", 
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  
  {
    id: "hospitalFollowup",
    title: "Follow-ups",
    type: "basic",
    link: "/apps/hospital-follow-up", 
    icon: "heroicons_outline:clock",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  //  {
  //       id: "pages.blogs",
  //       title: "Blogs",
  //       type: "basic",
  //       key: "Blogs",
  //       icon: "heroicons_outline:lightning-bolt",
  //       link: "/pages/blogs",
  //     },
  // {
  //   id: "sosList",
  //   title: "SOS List",
  //   type: "basic",
  //   link: "/apps/SOS-list",  
  //   icon: "heroicons_outline:clock",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  // {
  //   id: "patientQueries",
  //   title: "Patient Queries",
  //   type: "basic",
  //   link: "/apps/queries", 
  //   icon: "heroicons_outline:annotation",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  // {
  //   id: "apps",
  //   type: "basic",
  //   title: "Patient list",
  //   link: "/apps/patients",
  //   icon: "heroicons_outline:user-group",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  {
    id: "lablist",
    title: "Patient List",
    type: "basic",
    link:'/lab',
    icon: "heroicons_outline:user",  
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "tests",
    title: "Tests",
    type: "basic",
    link: "/apps/tests",
    icon: "heroicons_outline:document-text",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "addtests", 
    title: "Add Tests",
    type: "basic",
    link: "/apps/add-tests",
    icon: "heroicons_outline:pencil-alt",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },

  {
    id: "labtemplate",
    title: "Lab Templates",
    type: "basic",
    link:'/test-templates',
    icon: "mat_outline:data_saver_on",  
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  
  // {
  //   id: "repts",
  //   title: "Reports",
  //   link:'/reports',
  //   type: "basic",
  //   icon: "heroicons_outline:duplicate",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  // {
  //   id: "healthReports",
  //   title: "Clinical Analysis", 
  //   type: "basic",
  //   link: "/apps/clinical-analysis",
  //   icon: "heroicons_outline:chart-bar", 
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  // {
  //   id: "chat",
  //   title: "Chat",
  //   link:'/chat', 
  //   type: "basic",
  //   icon: "heroicons_outline:chart-pie",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  // {
  //   id: "video",
  //   title: "Video Call",
  //   link:'/video',
  //   type: "basic",
  //   icon: "heroicons_outline:chart-pie",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
  // {
  //   id: "pages",
  //   title: "Settings",
  //   type: "basic",
  //   link:'/pages/settings',
  //   icon: "heroicons_outline:cog",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
 
  // {
  //   id: "activity",
  //   title: "Activities",
  //   type: "basic",
  //   link:'/activities', 
  //   icon: "heroicons_outline:menu-alt-2",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // }
  // {
  //   id: "chat",
  //   title: "Chat",
  //   type: "basic",
  //   link:'/chat',
  //   icon: "heroicons_outline:inbox",
  //   children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  // },
];
export const futuristicNavigation: FuseNavigationItem[] = [
  {
    id: "dashboards",
    title: "DASHBOARDS",
    type: "group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "apps",
    title: "APPS",
    type: "group",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "others",
    title: "OTHERS",
    type: "group",
  },
  {
    id: "pages",
    title: "Pages",
    type: "aside",
    icon: "heroicons_outline:document-duplicate",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
];
export const horizontalNavigation: FuseNavigationItem[] = [
  {
    id: "dashboards",
    title: "Dashboards",
    type: "group",
    icon: "heroicons_outline:home",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "apps",
    title: "Apps",
    type: "group",
    icon: "heroicons_outline:qrcode",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
  {
    id: "pages",
    title: "Pages",
    type: "group",
    icon: "heroicons_outline:document-duplicate",
    children: [], // This will be filled from defaultNavigation so we don't have to manage multiple sets of the same navigation
  },
];
