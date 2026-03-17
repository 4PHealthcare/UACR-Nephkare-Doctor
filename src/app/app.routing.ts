import { Route } from "@angular/router";
import { AuthGuard } from "app/core/auth/guards/auth.guard";
import { NoAuthGuard } from "app/core/auth/guards/noAuth.guard";
import { LayoutComponent } from "app/layout/layout.component";
import { InitialDataResolver } from "app/app.resolvers";

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
  // Redirect empty path to '/dashboards/project'
  { path: "", pathMatch: "full", redirectTo: "dashboard" },

  // Redirect signed in user to the '/dashboards/project'
  //
  // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
  // path. Below is another redirection for that path to redirect the user to the desired
  // location. This is a small convenience to keep all main routes together here on this file.
  {
    path: "signed-in-redirect",
    pathMatch: "full",
    redirectTo: "dashboard",
  },

  // Auth routes for guests
  {
    path: "",
    canActivate: [NoAuthGuard],
    canActivateChild: [NoAuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "forgot-password",
        loadChildren: () =>
          import(
            "app/modules/auth/forgot-password/forgot-password.module"
          ).then((m) => m.AuthForgotPasswordModule),
      },
      {
        path: "sign-in",
        loadChildren: () =>
          import("app/modules/auth/sign-in/sign-in.module").then(
            (m) => m.AuthSignInModule
          ),
      },
      {
        path: "book-apt",
        loadChildren: () =>
          import("app/modules/admin/apps/find-patient/find-patient.module").then(
            (m) => m.FindPatientModule
          ),
      },
    ],
  },

  // Auth routes for authenticated users
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "sign-out",
        loadChildren: () =>
          import("app/modules/auth/sign-out/sign-out.module").then(
            (m) => m.AuthSignOutModule
          ),
      },
    ],
  },

  // Landing routes
  {
    path: "",
    component: LayoutComponent,
    data: {
      layout: "empty",
    },
    children: [
      {
        path: "home",
        loadChildren: () =>
          import("app/modules/landing/home/home.module").then(
            (m) => m.LandingHomeModule
          ),
      },
    ],
  },

  // Admin routes
  {
    path: "",
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    component: LayoutComponent,
    resolve: {
      initialData: InitialDataResolver,
    },
    children: [
      // Dashboards
      {
        path: "dashboard",
        loadChildren: () =>
        import(
          "app/modules/admin/dashboards/project/project.module"
        ).then((m) => m.ProjectModule)
      },
      {
        path: "patient-list",
        loadChildren: () =>
        import(
          "app/modules/admin/dashboards/list/list.module"
        ).then((m) => m.ListModule)
      },

      // Labs
      {
        path: "lab",
        loadChildren: () =>
        import(
          "app/modules/admin/lab/lab-list/lab-list.module"
        ).then((m) => m.LabListModule)
      },

      {
        path: "test-templates",
        loadChildren: () =>
          import("app/modules/admin/lab/test-template/test-template.module").then(
            (m) => m.TestTemplateModule
          ),
      },


      // Apps
      {
        path: "apps",
        children: [
          {
            path: "academy",
            loadChildren: () =>
              import(
                "app/modules/admin/apps/subscriptions/subscriptions.module"
              ).then((m) => m.SubscriptionsModule),
          },

          // {
          //   path: "chat",
          //   loadChildren: () =>
          //     import(
          //       "app/modules/admin/apps/chat/chat.module"
          //     ).then((m) => m.ChatModule),
          // },

          {
            path: "care-team",
            loadChildren: () =>
              import("app/modules/admin/apps/care-team/care-team.module").then(
                (m) => m.CareTeamModule
              ),
          },
          {
            path: "patients",
            loadChildren: () =>
              import("app/modules/admin/apps/users/users.module").then(
                (m) => m.UsersModule
              ),
          },
          {
            path: "queue",
            loadChildren: () =>
              import("app/modules/admin/apps/queue/queue.module").then(
                (m) => m.QueueModule
              ),
          },
          {
            path: "hospital-follow-up",
            loadChildren: () =>
              import("app/modules/admin/apps/hospital-followup/hospital-followup.module").then(
                (m) => m.HospitalFollowupModule
              ),
          },
          {
            path: "SOS-list",
            loadChildren: () =>
              import("app/modules/admin/apps/sos-list/sos-list.module").then(
                (m) => m.SosListModule
              ),
          },
          {
            path: "clinical-analysis",
            loadChildren: () =>
              import("app/modules/admin/apps/patient-queries/patient-queries.module").then(
                (m) => m.PatientQueriesModule
              ),
          },
          {
            path: "request",
            loadChildren: () =>
              import("app/modules/admin/apps/request-list/request-list.module").then(
                (m) => m.RequestListModule
              ),
          },
          {
            path: "kidney-care-subscriptions",
            loadChildren: () =>
              import("app/modules/admin/apps/kidney-care-subscription/kidney-care-subscription.module").then(
                (m) => m.KidneyCareSubscriptionModule
              ),
          },
          {
            path: "second-opinion-subscriptions",
            loadChildren: () =>
              import("app/modules/admin/apps/second-opionion-subscriptions/second-opionion-subscriptions.module").then(
                (m) => m.SecondOpinionSubscriptionModule
              ),
          },
          {
            path: "tests",
            loadChildren: () =>
              import("app/modules/admin/apps/test-queue/test-queue.module").then(
                (m) => m.TestQueueModule
              ),
          },
        
          {
            path: "add-tests",
            loadChildren: () =>
              import("app/modules/admin/apps/add-tests/add-test.module").then(
                (m) => m.AddTestModule
              ),
          },
          {
            path: "doctors",
            loadChildren: () =>
              import("app/modules/admin/apps/doctors/doctors.module").then(
                (m) => m.DoctorsModule
              ),
          },
          {
            path: "file-manager",
            loadChildren: () =>
              import(
                "app/modules/admin/apps/file-manager/file-manager.module"
              ).then((m) => m.FileManagerModule),
          },
          {
            path: "help-center",
            loadChildren: () =>
              import(
                "app/modules/admin/apps/help-center/help-center.module"
              ).then((m) => m.HelpCenterModule),
          },
          {
            path: "scrumboard",
            loadChildren: () =>
              import(
                "app/modules/admin/apps/scrumboard/scrumboard.module"
              ).then((m) => m.ScrumboardModule),
          },
          {
            path: "tasks",
            loadChildren: () =>
              import("app/modules/admin/apps/tasks/tasks.module").then(
                (m) => m.TasksModule
              ),
          },
          {
            path: "customersupport",
            loadChildren: () =>
              import(
                "app/modules/admin/apps/customer-support/customer-support.module"
              ).then((m) => m.CustomerSupportModule),
          },
        ],
      },

      // Calender
      {
        path: "calr", 
        children: [
          {
            path: "calendar",
            loadChildren: () =>
              import("app/modules/admin/apps/calendar/calendar.module").then(
                (m) => m.CalendarModule
              ),
          },
          {
            path: "prescription",
            data: {
              layout: "empty",
            },
            loadChildren: () =>
              import("app/modules/admin/apps/patient-prescription/patient-prescription.module").then(
                (m) => m.PatientPrescriptionModule
              ),
          },
        ],
      },
      //   Reports
      {
        path: "reports",
        loadChildren: () =>
        import(
          "app/modules/admin/apps/file-manager/file-manager.module"
        ).then((m) => m.FileManagerModule),
      },
      // Expert Opionion report
      
      {
        path: "expert-opionion",
        loadChildren:()=> import("app/modules/admin/pages/profile/expert-opinion-report/expert-opinion-report.module").then((m) => m.ExpertOpinionReportModule),
      },
      //   Chat

      {
        path: "chat",
        loadChildren: () =>
        import("app/modules/admin/apps/chat/chat.module").then(
          (m) => m.ChatModule
        )
      },
      {
        path: "video",
        loadChildren: () =>
        import("app/modules/admin/apps/video-call/video-call.module").then(
          (m) => m.VideoCallModule
        )
      },
      // Pages
      {
        path: "pages",
        children: [
          // Activities
          // {
          //   path: "activities",
          //   loadChildren: () =>
          //     import(
          //       "app/modules/admin/pages/activities/activities.module"
          //     ).then((m) => m.ActivitiesModule),
          // },

          // role
          {
            path: "roles",
            loadChildren: () =>
              import("app/modules/admin/pages/roles/roles.module").then(
                (m) => m.RolesModule
              ),
          },

          // Error
          {
            path: "error",
            children: [
              {
                path: "404",
                loadChildren: () =>
                  import(
                    "app/modules/admin/pages/error/error-404/error-404.module"
                  ).then((m) => m.Error404Module),
              },
              {
                path: "500",
                loadChildren: () =>
                  import(
                    "app/modules/admin/pages/error/error-500/error-500.module"
                  ).then((m) => m.Error500Module),
              },
            ],
          },

          // Invoice
          {
            path: "invoice",
            children: [
              {
                path: "printable",
                children: [
                  {
                    path: "compact",
                    loadChildren: () =>
                      import(
                        "app/modules/admin/pages/invoice/printable/compact/compact.module"
                      ).then((m) => m.CompactModule),
                  },
                  {
                    path: "modern",
                    loadChildren: () =>
                      import(
                        "app/modules/admin/pages/invoice/printable/modern/modern.module"
                      ).then((m) => m.ModernModule),
                  },
                ],
              },
            ],
          },

          // Profile
          {
            path: "profile",
            loadChildren: () =>
              import("app/modules/admin/pages/profile/profile.module").then( 
                (m) => m.ProfileModule
              ),
           
          },
          

          // Profile
          {
            path: "account",
            loadChildren: () =>
              import("app/modules/admin/pages/settings/settings.module").then(
                (m) => m.SettingsModule
              ),
          },

          // Settings
          {
            path: "settings",
            loadChildren: () =>
              import("app/modules/admin/pages/settings/settings.module").then(
                (m) => m.SettingsModule
              ),
          },

          //Notes
          {
            path: "notes",
            loadChildren: () =>
              import("app/modules/admin/apps/notes/notes.module").then(
                (m) => m.NotesModule
              ),
          },

          //chat
          // {
          //   path: "chat",
          //   loadChildren: () =>
          //     import("app/modules/admin/pages/chat/chat.module").then(
          //       (m) => m.ChatModule
          //     ),
          // },

          //Notes
          {
            path: "blogs",
            loadChildren: () =>
              import("app/modules/admin/pages/blogs/blogs.module").then(
                (m) => m.BlogsModule
              ),
          },
        ],
      },
       //   Activity

       {
        path: "activities",
        loadChildren: () =>
        import(
          "app/modules/admin/pages/activities/activities.module"
        ).then((m) => m.ActivitiesModule)
      },

      // 404 & Catch all
      {
        path: "404-not-found",
        pathMatch: "full",
        loadChildren: () =>
          import(
            "app/modules/admin/pages/error/error-404/error-404.module"
          ).then((m) => m.Error404Module),
      },
      { path: "**", redirectTo: "404-not-found" },
    ],
  },
];
