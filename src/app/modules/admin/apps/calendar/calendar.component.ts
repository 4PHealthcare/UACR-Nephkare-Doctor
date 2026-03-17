import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { MatDialog } from "@angular/material/dialog";
import { MatDrawer } from "@angular/material/sidenav";
import { FullCalendarComponent } from "@fullcalendar/angular";
import { Calendar as FullCalendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import momentPlugin from "@fullcalendar/moment";
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import { MatTabChangeEvent } from "@angular/material/tabs";

import { clone, cloneDeep, isEqual, omit } from "lodash-es";
import * as moment from "moment";
import { RRule } from "rrule";
import { Subject, BehaviorSubject } from "rxjs";
import { takeUntil, debounceTime, map } from "rxjs/operators";
import { fuseAnimations } from "@fuse/animations";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { CalendarRecurrenceComponent } from "app/modules/admin/apps/calendar/recurrence/recurrence.component";
import { CalendarService } from "app/modules/admin/apps/calendar/calendar.service";
import {
  Calendar,
  CalendarDrawerMode,
  CalendarEvent,
  CalendarEventEditMode,
  CalendarEventPanelMode,
  CalendarSettings,
} from "app/modules/admin/apps/calendar/calendar.types";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";

import { AuthService } from "app/core/auth/auth.service";
import { APIService } from "app/core/api/api";
import * as XLSX from "xlsx";
import { AppointmentFormModalComponent } from "../appointment-form-modal/appointment-form-modal.component";
import { FuseConfirmationService } from "@fuse/services/confirmation";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BillingComponent } from "../queue/billing/billing.component";

import { ReasonForCancelComponent } from "./reason-for-cancel/reason-for-cancel.component";
import { Router } from "@angular/router";
import { DataService } from "app/core/user/user.resolver";

export const MY_FORMATS = {
  parse: {
    dateInput: "LL",
  },
  display: {
    dateInput: "DD-MMM-YYYY",
    monthYearLabel: "YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "YYYY",
  },
};
@Component({
  selector: "calendar",
  templateUrl: "./calendar.component.html",
  styleUrls: ["./calendar.component.scss"],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("eventPanel") private _eventPanel: TemplateRef<any>;
  @ViewChild("fullCalendar", { static: false })
  private _fullCalendar: FullCalendarComponent;
  @ViewChild("drawer") private _drawer: MatDrawer;
  @ViewChild(MatPaginator) private _paginator: MatPaginator;
  @ViewChild(MatSort) private _sort: MatSort;
  // Patien List Variablea
  userInfo: any;
  public myMath = Math;
  patients$ = new BehaviorSubject<any>([]);
  pageSize = 10;
  currentPage = 0;
  filterVal = "";
  filterSubject = new Subject();
  totalRecords$ = new BehaviorSubject<any>(null);
  fromDate: Date;
  dateForm: FormGroup;
  sortDirection = "";
  sortBy = "";
  selectedDoctor='all';
  fileName = "Appointments List.xlsx";
  uploadData: any = [];
  appointmentType = 0;
  statusType = 0;
  calAppoinments: any[] = [];
  //End  Patien List Variablea
  patientName:string = '';
  calendars: Calendar[];
  calendarPlugins: any[] = [
    dayGridPlugin,
    interactionPlugin,
    listPlugin,
    momentPlugin,
    rrulePlugin,
    timeGridPlugin,
  ];
  drawerMode: CalendarDrawerMode = "side";
  drawerOpened: boolean = true;
  event: CalendarEvent;
  eventEditMode: CalendarEventEditMode = "single";
  eventForm: FormGroup;
  eventTimeFormat: any;
  events: CalendarEvent[] = [];
  selectedStatus:number = 0;
  tabs: any[] = [];
  panelMode: CalendarEventPanelMode = "view";
  settings: CalendarSettings;
  view: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listYear" =
    "dayGridMonth";
  views: any;
  viewTitle: string;
  private _eventPanelOverlayRef: OverlayRef;
  private _fullCalendarApi: FullCalendar;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  private ngUnsubscribe: Subject<any> = new Subject<any>();

  appTypes: any;
  statusTypes: any = [ 
    {
      data_name:'Pending',
      masterdata_id: 8
    },
    {
      data_name:'Running',
      masterdata_id: 9
    },
    {
      data_name:'Completed',
      masterdata_id: 10
    },
    {
      data_name:'Cancelled',
      masterdata_id: 13
    }

];
visits:any = [ {
  data_name:'Hospital Visit',
  masterdata_id:72
},
{
  data_name:'Video Consultaion',
  masterdata_id:73
}];

  bookingConfirmationTypes: any[] = [];
  appointmentData: any;
  doctors: any = [];
  doctorId: any = 0;
  tabIndex: Tabs = Tabs.List_View;
  constructor(
    private _calendarService: CalendarService,
    private _changeDetectorRef: ChangeDetectorRef,
    @Inject(DOCUMENT) private _document: Document,
    private _formBuilder: FormBuilder,
    private _matDialog: MatDialog,
    private _overlay: Overlay,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _viewContainerRef: ViewContainerRef,
    private auth: AuthService,
    private httpService: APIService,
    private fb: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private snackBar: MatSnackBar,
    private _router: Router,
    private dataService: DataService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
    //  this.renderCalendar();
  }

  get recurrenceStatus(): string {
    // Get the recurrence from event form
    const recurrence = this.eventForm.get("recurrence").value;

    // Return null, if there is no recurrence on the event
    if (!recurrence) {
      return null;
    }

    // Convert the recurrence rule to text
    let ruleText = RRule.fromString(recurrence).toText();
    ruleText = ruleText.charAt(0).toUpperCase() + ruleText.slice(1);

    // Return the rule text
    return ruleText;
  }

  gotoProfilePage(data:any) {

    let category = 0;
    let isSecondOpinion = data?.patient_service_type == 7 || data.subscription_typeid == 7 ? true : false
    data.opinion_id = data.opinion_id ? data.opinion_id: 0;
    
    if(data.opinion_id && data.appointment_category == 'Follow Up') {
      category = -1;
    } else if(data.opinion_id) {
      category = 2;
    }

    if(this.userInfo.admin_account == 3) {
      this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&opinion_id=${data.opinion_id}&secondopionion=${isSecondOpinion}&appointment=${data.calender_id}`);

    } else {
      this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}`);
    }

    
  }

  ngOnInit(): void {
    console.log(this.userInfo.admin_account);

    this.statusType = this.selectedStatus;
    
    
    //this.getBookingTypes();
    //this.getStatusMasterDataInfo();
    this.getMasterDataInfo();
    // view Types
    this.tabs = [
      {
        id: "calendar-view",
        title: "Calender View",
      },
      {
        id: "task-view",
        title: "Task View",
      },
    ];
    // Create the event form
    this.eventForm = this._formBuilder.group({
      id: [""],
      calendarId: [""],
      recurringEventId: [null],
      title: [""],
      description: [""],
      start: [null],
      end: [null],
      duration: [null],
      allDay: [true],
      recurrence: [null],
      range: [{}],
    });

    // Subscribe to 'range' field value changes
    this.eventForm.get("range").valueChanges.subscribe((value) => {
      if (!value) {
        return;
      }

      // Set the 'start' field value from the range
      this.eventForm.get("start").setValue(value.start, { emitEvent: false });

      // If this is a recurring event...
      if (this.eventForm.get("recurrence").value) {
        // Update the recurrence rules if needed
        this._updateRecurrenceRule();

        // Set the duration field
        const duration = moment(value.end).diff(moment(value.start), "minutes");
        this.eventForm.get("duration").setValue(duration, { emitEvent: false });

        // Update the end value
        this._updateEndValue();
      }
      // Otherwise...
      else {
        // Set the end field
        this.eventForm.get("end").setValue(value.end, { emitEvent: false });
      }
    });

    // Subscribe to 'recurrence' field changes
    this.eventForm.get("recurrence").valueChanges.subscribe((value) => {
      // If this is a recurring event...
      if (value) {
        // Update the end value
        this._updateEndValue();
      }
    });

    // Get calendars
    this._calendarService.calendars$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((calendars) => {
        // Store the calendars
        this.calendars = calendars;
        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Get settings
    this._calendarService.settings$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((settings) => {
        // Store the settings
        this.settings = settings;

        // Set the FullCalendar event time format based on the time format setting
        this.eventTimeFormat = {
          hour: settings.timeFormat === "24" ? "numeric" : " 2-digit",
          hour12: settings.timeFormat === "24",
          minute: "2-digit",
          meridiem: settings.timeFormat === "24" ? " short" : false,
        };

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        // Set the drawerMode and drawerOpened if the given breakpoint is active
        if (matchingAliases.includes("md")) {
          this.drawerMode = "side";
          this.drawerOpened = true;
        } else {
          this.drawerMode = "over";
          this.drawerOpened = false;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
      });

    // Build the view specific FullCalendar options
    this.views = {
      dayGridMonth: {
        eventLimit: 3,
        eventTimeFormat: this.eventTimeFormat,
        fixedWeekCount: false,
        showNonCurrentDates: false,
      },
      timeGrid: {
        allDayText: "",
        columnHeaderFormat: {
          weekday: "short",
          day: "numeric",
          omitCommas: true,
        },
        columnHeaderHtml: (date): string => `<span class="fc-weekday">${moment(
          date
        ).format("ddd")}</span>
                                                       <span class="fc-date">${moment(
                                                         date
                                                       ).format("D")}</span>`,
        slotDuration: "01:00:00",
        slotLabelFormat: this.eventTimeFormat,
      },
      timeGridWeek: {},
      timeGridDay: {},
      listYear: {
        allDayText: "All day",
        eventTimeFormat: this.eventTimeFormat,
        listDayFormat: false,
        listDayAltFormat: false,
      },
    };

    if (history.state.patientName) {
      this.patientName = history.state.patientName.trim();
      this.filterVal = history.state.patientName.trim();
    }

    // patient calls
    this.initForm();
    //this.getPatientsInfo();
    this.filterSubject
      .pipe(
        debounceTime(500),
        map((val) => {
          this.getPatientsInfo();
        })
      )
      .subscribe();

      this.dataService.getData().subscribe((data) => {
        if(data) {

          this.patientName= data;
          this.filterData(this.patientName);

        }
    });
  }

  renderCalendar(doctorId?:any) {
    // Get the full calendar API
    this._fullCalendarApi = this._fullCalendar.getApi();

    // Get the current view's title
    this.viewTitle = this._fullCalendarApi.view.title;

    // Get the view's current start and end dates, add/subtract
    // 60 days to create a ~150 days period to fetch the data for
    const viewStart = moment(this._fullCalendarApi.view.currentStart).subtract(
      60,
      "days"
    );
    const viewEnd = moment(this._fullCalendarApi.view.currentEnd).add(
      60,
      "days"
    );

    // Get events
    this.getAppointments(
      viewStart.format("YYYY-MM-DD"),
      viewEnd.format("YYYY-MM-DD"),doctorId
    );

    
    // this._calendarService.getEvents(viewStart, viewEnd, true).subscribe();
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
   // this.userInfo.user_id=8888;
    if (this.userInfo.role_id)  {
      const url = `api/User/GetCoordinatorTeam?userid=${this.userInfo.user_id}`;

      this.httpService.getAll(url).subscribe((res: any) => {
        // this.doctors = res.data.userdata ? res.data.userdata : [];
  
        this.doctors = res.data ? res.data : [];

        if(history.state && history.state.patientName && history.state.doctor_id) {
          let doctor = this.doctors.find(item => item.doctorid == history.state.doctor_id);

          if (doctor) {
            this.doctorId = doctor.doctorid;
            this.selectedDoctor = doctor.doctorid;
          } else {
            this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
            this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
          }

        } else if (!history.state.patientName && sessionStorage.getItem('sessionDoctorId') ) {

          const filteredDoctor = this.doctors.find(item => item.doctorid == sessionStorage.getItem('sessionDoctorId'));
         
          if (filteredDoctor) {
            this.doctorId = filteredDoctor.doctorid;
            this.selectedDoctor = filteredDoctor.doctorid;
          }else {

            if(this.userInfo.role_id==481) {
              this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
              this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
            } else {
              this.doctorId = this.userInfo.user_id;
              this.selectedDoctor = this.userInfo.user_id;
            }

          }
        } else {
          if(this.userInfo.role_id == 5 && this.userInfo.isadmin_account ) {
              
            if( !(history.state  && history.state.appointmentDate)) {
              this.selectedDoctor = this.userInfo.user_id;
            }
            this.doctorId = this.userInfo.user_id; 
          } 
          else if(this.userInfo.role_id==481)  {
            this.doctorId = this.doctors ? this.doctors[0].doctorid : 0;
            this.selectedDoctor = this.doctors ? this.doctors[0].doctorid : undefined;
          } else {
            this.doctorId = this.userInfo.user_id;
          }

          
         // this.selectedDoctor = this.userInfo.user_id;
        }

  
      //  this.doctorId = this.userInfo.user_id;
  
        if (history.state && history.state.navType) {
          this.tabIndex = Tabs.List_View;
          this.statusType = history.state.navType;
          this.selectedStatus = history.state.navType;
          this.getPatientsInfo(true);
          
        } else {
          this.getPatientsInfo(true);
  
        }
  
        
  
        
          
      });
    }
   

  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    // Dispose the overlay
    if (this._eventPanelOverlayRef) {
      this._eventPanelOverlayRef.dispose();
    }

    if(this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Drawer
   */
  toggleDrawer(): void {
    // Toggle the drawer
    this._drawer.toggle();
  }

  /**
   * Open recurrence panel
   */
  openRecurrenceDialog(): void {
    // Open the dialog
    const dialogRef = this._matDialog.open(CalendarRecurrenceComponent, {
      panelClass: "calendar-event-recurrence-dialog",
      data: {
        event: this.eventForm.value,
      },
    });

    // After dialog closed
    dialogRef.afterClosed().subscribe((result) => {
      // Return if canceled
      if (!result || !result.recurrence) {
        return;
      }

      // Only update the recurrence if it actually changed
      if (this.eventForm.get("recurrence").value === result.recurrence) {
        return;
      }

      // If returned value is 'cleared'...
      if (result.recurrence === "cleared") {
        // Clear the recurrence field if recurrence cleared
        this.eventForm.get("recurrence").setValue(null);
      }
      // Otherwise...
      else {
        // Update the recurrence field with the result
        this.eventForm.get("recurrence").setValue(result.recurrence);
      }
    });
  }

  /**
   * Change the event panel mode between view and edit
   * mode while setting the event edit mode
   *
   * @param panelMode
   * @param eventEditMode
   */
  changeEventPanelMode(
    panelMode: CalendarEventPanelMode,
    eventEditMode: CalendarEventEditMode = "single"
  ): void {
    // Set the panel mode
    this.panelMode = panelMode;

    // Set the event edit mode
    this.eventEditMode = eventEditMode;

    // Update the panel position
    setTimeout(() => {
      this._eventPanelOverlayRef.updatePosition();
    });
  }

  /**
   * Get calendar by id
   *
   * @param id
   */
  getCalendar(id): Calendar {
    if (!id) {
      return;
    }

    return this.calendars.find((calendar) => calendar.id === id);
  }

  /**
   * Change the calendar view
   *
   * @param view
   */
  changeView(
    view: "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listYear"
  ): void {
    // Store the view
    this.view = view;

    // If the FullCalendar API is available...
    if (this._fullCalendarApi) {
      // Set the view
      this._fullCalendarApi.changeView(view);
      // Update the view title
      this.viewTitle = this._fullCalendarApi.view.title;

      // Get the view's current end date
      const end = moment(this._fullCalendarApi.view.currentEnd);

      const start = moment(this._fullCalendarApi.view.currentStart);

      this.getAppointments(
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD")
      );
    }
  }

  /**
   * Moves the calendar one stop back
   */
  previous(): void {
    // Go to previous stop
    this._fullCalendarApi.prev();

    // Update the view title
    this.viewTitle = this._fullCalendarApi.view.title;

    // Get the view's current start date
    const start = moment(this._fullCalendarApi.view.currentStart);

    const end = moment(this._fullCalendarApi.view.currentEnd);

    // Prefetch past events
    this.getAppointments(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
  }

  /**
   * Moves the calendar to the current date
   */
  today(): void {
    // Go to today
    this._fullCalendarApi.today();

    // Update the view title
    this.viewTitle = this._fullCalendarApi.view.title;

    const end = moment(this._fullCalendarApi.view.currentEnd);

    const start = moment(this._fullCalendarApi.view.currentStart);

    this.getAppointments(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
  }

  /**
   * Moves the calendar one stop forward
   */
  next(): void {
    // Go to next stop
    this._fullCalendarApi.next();

    // Update the view title
    this.viewTitle = this._fullCalendarApi.view.title;

    // Get the view's current end date
    const end = moment(this._fullCalendarApi.view.currentEnd);

    const start = moment(this._fullCalendarApi.view.currentStart);

    this.getAppointments(start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));

    // Prefetch future events
    // this._calendarService.prefetchFutureEvents(end).subscribe();
  }

  /**
   * On date click
   *
   * @param calendarEvent
   */
  onDateClick(calendarEvent): void {
    // Prepare the event
    const event = {
      id: null,
      calendarId: this.calendars[0].id,
      recurringEventId: null,
      isFirstInstance: false,
      title: "",
      description: "",
      start: moment(calendarEvent.date).startOf("day").toISOString(),
      end: moment(calendarEvent.date).endOf("day").toISOString(),
      duration: null,
      allDay: true,
      recurrence: null,
      range: {
        start: moment(calendarEvent.date).startOf("day").toISOString(),
        end: moment(calendarEvent.date).endOf("day").toISOString(),
      },
    };

    // Set the event
    this.event = event;

    // Set the el on calendarEvent for consistency
    calendarEvent.el = calendarEvent.dayEl;

    // Reset the form and fill the event
    this.eventForm.reset();
    this.eventForm.patchValue(event);

    // Open the event panel
    this._openEventPanel(calendarEvent);

    // Change the event panel mode
    this.changeEventPanelMode("add");
  }

  /**
   * On event click
   *
   * @param calendarEvent
   */
  onEventClick(calendarEvent): void {
    // Find the event with the clicked event's id
    const event: any = cloneDeep(
      this.events.find((item) => item.id == calendarEvent.event.id)
    );

    // Set the event
    this.event = event;

    // Prepare the end value
    let end;

    // If this is a recurring event...
    if (event.recuringEventId) {
      // Calculate the end value using the duration
      end = moment(event.start).add(event.duration, "minutes").toISOString();
    }
    // Otherwise...
    else {
      // Set the end value from the end
      end = event.end;
    }

    // Set the range on the event
    event.range = {
      start: event.start,
      end,
    };

    // Reset the form and fill the event
    this.eventForm.reset();
    this.eventForm.patchValue(event);

    // Open the event panel
    this._openEventPanel(calendarEvent);
  }

  /**
   * On event render
   *
   * @param calendarEvent
   */
  onEventRender(calendarEvent): void {
    // Get event's calendar
    const calendar = this.calendars.find(
      (item) => item.id === calendarEvent.event.extendedProps.calendarId
    );

    // Return if the calendar doesn't exist...
    if (!calendar) {
      return;
    }

    // If current view is year list...
    if (this.view === "listYear") {
      // Create a new 'fc-list-item-date' node
      const fcListItemDate1 = `<td class="fc-list-item-date">
                                            <span>
                                                <span>${moment(
                                                  calendarEvent.event.start
                                                ).format("D")}</span>
                                                <span>${moment(
                                                  calendarEvent.event.start
                                                ).format("MMM")}, ${moment(
        calendarEvent.event.start
      ).format("ddd")}</span>
                                            </span>
                                        </td>`;

      // Insert the 'fc-list-item-date' into the calendar event element
      calendarEvent.el.insertAdjacentHTML("afterbegin", fcListItemDate1);

      // Set the color class of the event dot
      calendarEvent.el
        .getElementsByClassName("fc-event-dot")[0]
        .classList.add(calendar.color);

      // Set the event's title to '(No title)' if event title is not available
      if (!calendarEvent.event.title) {
        calendarEvent.el.querySelector(".fc-list-item-title").innerText =
          "(No title)";
      }
    }
    // If current view is not month list...
    else {
      // Set the color class of the event
      calendarEvent.el.classList.add(calendar.color);

      // Set the event's title to '(No title)' if event title is not available
      if (!calendarEvent.event.title) {
        calendarEvent.el.querySelector(".fc-title").innerText = "(No title)";
      }
    }

    // Set the event's visibility
    calendarEvent.el.style.display = calendar.visible ? "flex" : "none";
  }

  /**
   * On calendar updated
   *
   * @param calendar
   */
  onCalendarUpdated(calendar): void {
    // Re-render the events
    this._fullCalendarApi.rerenderEvents();
  }

  /**
   * Add event
   */
  addEvent(): void {
    // Get the clone of the event form value
    let newEvent = clone(this.eventForm.value);

    // If the event is a recurring event...
    if (newEvent.recurrence) {
      // Set the event duration
      newEvent.duration = moment(newEvent.range.end).diff(
        moment(newEvent.range.start),
        "minutes"
      );
    }

    // Modify the event before sending it to the server
    newEvent = omit(newEvent, ["range", "recurringEventId"]);

    // Add the event
    this._calendarService.addEvent(newEvent).subscribe(() => {
      // Reload events
      this._calendarService.reloadEvents().subscribe();

      // Close the event panel
      this._closeEventPanel();
    });
  }

  /**
   * Update the event
   */
  updateEvent(): void {
    // Get the clone of the event form value
    let event = clone(this.eventForm.value);
    const { range, ...eventWithoutRange } = event;

    // Get the original event
    const originalEvent = this.events.find((item) => item.id === event.id);

    // Return if there are no changes made to the event
    if (isEqual(eventWithoutRange, originalEvent)) {
      // Close the event panel
      this._closeEventPanel();

      // Return
      return;
    }

    // If the event is a recurring event...
    if (event.recurrence && event.recurringEventId) {
      // Update the recurring event on the server
      this._calendarService
        .updateRecurringEvent(event, originalEvent, this.eventEditMode)
        .subscribe(() => {
          // Reload events
          this._calendarService.reloadEvents().subscribe();

          // Close the event panel
          this._closeEventPanel();
        });

      // Return
      return;
    }

    // If the event is a non-recurring event...
    if (!event.recurrence && !event.recurringEventId) {
      // Update the event on the server
      this._calendarService.updateEvent(event.id, event).subscribe(() => {
        // Close the event panel
        this._closeEventPanel();
      });

      // Return
      return;
    }

    // If the event was a non-recurring event but now it will be a recurring event...
    if (event.recurrence && !event.recurringEventId) {
      // Set the event duration
      event.duration = moment(event.range.end).diff(
        moment(event.range.start),
        "minutes"
      );

      // Omit unnecessary fields
      event = omit(event, ["range", "recurringEventId"]);

      // Update the event on the server
      this._calendarService.updateEvent(event.id, event).subscribe(() => {
        // Reload events
        this._calendarService.reloadEvents().subscribe();

        // Close the event panel
        this._closeEventPanel();
      });

      // Return
      return;
    }

    // If the event was a recurring event but now it will be a non-recurring event...
    if (!event.recurrence && event.recurringEventId) {
      // Set the end date
      event.end = moment(event.start)
        .add(event.duration, "minutes")
        .toISOString();

      // Set the duration as null
      event.duration = null;

      // Update the recurring event on the server
      this._calendarService
        .updateRecurringEvent(event, originalEvent, this.eventEditMode)
        .subscribe(() => {
          // Reload events
          this._calendarService.reloadEvents().subscribe();

          // Close the event panel
          this._closeEventPanel();
        });
    }
  }

  /**
   * Delete the given event
   *
   * @param event
   * @param mode
   */
  deleteEvent(event, mode: CalendarEventEditMode = "single"): void {
    // If the event is a recurring event...
    if (event.recurrence) {
      // Delete the recurring event on the server
      this._calendarService.deleteRecurringEvent(event, mode).subscribe(() => {
        // Reload events
        this._calendarService.reloadEvents().subscribe();

        // Close the event panel
        this._closeEventPanel();
      });
    }
    // If the event is a non-recurring, normal event...
    else {
      // Update the event on the server
      this._calendarService.deleteEvent(event.id).subscribe(() => {
        // Close the event panel
        this._closeEventPanel();
      });
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create the event panel overlay
   *
   * @private
   */
  private _createEventPanelOverlay(positionStrategy): void {
    // Create the overlay
    this._eventPanelOverlayRef = this._overlay.create({
      panelClass: ["calendar-event-panel"],
      backdropClass: "",
      hasBackdrop: true,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      positionStrategy,
    });

    // Detach the overlay from the portal on backdrop click
    this._eventPanelOverlayRef.backdropClick().subscribe(() => {
      this._closeEventPanel();
    });
  }

  /**
   * Open the event panel
   *
   * @private
   */
  private _openEventPanel(calendarEvent): void {
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(calendarEvent.el)
      .withFlexibleDimensions(false)
      .withPositions([
        {
          originX: "end",
          originY: "top",
          overlayX: "start",
          overlayY: "top",
          offsetX: 8,
        },
        {
          originX: "start",
          originY: "top",
          overlayX: "end",
          overlayY: "top",
          offsetX: -8,
        },
        {
          originX: "start",
          originY: "bottom",
          overlayX: "end",
          overlayY: "bottom",
          offsetX: -8,
        },
        {
          originX: "end",
          originY: "bottom",
          overlayX: "start",
          overlayY: "bottom",
          offsetX: 8,
        },
      ]);

    // Create the overlay if it doesn't exist
    if (!this._eventPanelOverlayRef) {
      this._createEventPanelOverlay(positionStrategy);
    }
    // Otherwise, just update the position
    else {
      this._eventPanelOverlayRef.updatePositionStrategy(positionStrategy);
    }

    // Attach the portal to the overlay
    this._eventPanelOverlayRef.attach(
      new TemplatePortal(this._eventPanel, this._viewContainerRef)
    );

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Close the event panel
   *
   * @private
   */
  private _closeEventPanel(): void {
    // Detach the overlay from the portal
    this._eventPanelOverlayRef.detach();

    // Reset the panel and event edit modes
    this.panelMode = "view";
    this.eventEditMode = "single";

    // Mark for check
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Update the recurrence rule based on the event if needed
   *
   * @private
   */
  private _updateRecurrenceRule(): void {
    // Get the event
    const event = this.eventForm.value;

    // Return if this is a non-recurring event
    if (!event.recurrence) {
      return;
    }

    // Parse the recurrence rule
    const parsedRules = {};
    event.recurrence.split(";").forEach((rule) => {
      // Split the rule
      const parsedRule = rule.split("=");

      // Add the rule to the parsed rules
      parsedRules[parsedRule[0]] = parsedRule[1];
    });

    // If there is a BYDAY rule, split that as well
    if (parsedRules["BYDAY"]) {
      parsedRules["BYDAY"] = parsedRules["BYDAY"].split(",");
    }

    // Do not update the recurrence rule if ...
    // ... the frequency is DAILY,
    // ... the frequency is WEEKLY and BYDAY has multiple values,
    // ... the frequency is MONTHLY and there isn't a BYDAY rule,
    // ... the frequency is YEARLY,
    if (
      parsedRules["FREQ"] === "DAILY" ||
      (parsedRules["FREQ"] === "WEEKLY" && parsedRules["BYDAY"].length > 1) ||
      (parsedRules["FREQ"] === "MONTHLY" && !parsedRules["BYDAY"]) ||
      parsedRules["FREQ"] === "YEARLY"
    ) {
      return;
    }

    // If the frequency is WEEKLY, update the BYDAY value with the new one
    if (parsedRules["FREQ"] === "WEEKLY") {
      parsedRules["BYDAY"] = [moment(event.start).format("dd").toUpperCase()];
    }

    // If the frequency is MONTHLY, update the BYDAY value with the new one
    if (parsedRules["FREQ"] === "MONTHLY") {
      // Calculate the weekday
      const weekday = moment(event.start).format("dd").toUpperCase();

      // Calculate the nthWeekday
      let nthWeekdayNo = 1;
      while (
        moment(event.start).isSame(
          moment(event.start).subtract(nthWeekdayNo, "week"),
          "month"
        )
      ) {
        nthWeekdayNo++;
      }

      // Set the BYDAY
      parsedRules["BYDAY"] = [nthWeekdayNo + weekday];
    }

    // Generate the rule string from the parsed rules
    const rules = [];
    Object.keys(parsedRules).forEach((key) => {
      rules.push(
        key +
          "=" +
          (Array.isArray(parsedRules[key])
            ? parsedRules[key].join(",")
            : parsedRules[key])
      );
    });
    const rrule = rules.join(";");

    // Update the recurrence rule
    this.eventForm.get("recurrence").setValue(rrule);
  }

  /**
   * Update the end value based on the recurrence and duration
   *
   * @private
   */
  private _updateEndValue(): void {
    // Get the event recurrence
    const recurrence = this.eventForm.get("recurrence").value;

    // Return if this is a non-recurring event
    if (!recurrence) {
      return;
    }

    // Parse the recurrence rule
    const parsedRules = {};
    recurrence.split(";").forEach((rule) => {
      // Split the rule
      const parsedRule = rule.split("=");

      // Add the rule to the parsed rules
      parsedRules[parsedRule[0]] = parsedRule[1];
    });

    // If there is an UNTIL rule...
    if (parsedRules["UNTIL"]) {
      // Use that to set the end date
      this.eventForm.get("end").setValue(parsedRules["UNTIL"]);

      // Return
      return;
    }

    // If there is a COUNT rule...
    if (parsedRules["COUNT"]) {
      // Generate the RRule string
      const rrule =
        "DTSTART=" +
        moment(this.eventForm.get("start").value)
          .utc()
          .format("YYYYMMDD[T]HHmmss[Z]") +
        "\nRRULE:" +
        recurrence;

      // Use RRule string to generate dates
      const dates = RRule.fromString(rrule).all();

      // Get the last date from dates array and set that as the end date
      this.eventForm
        .get("end")
        .setValue(moment(dates[dates.length - 1]).toISOString());

      // Return
      return;
    }

    // If there are no UNTIL or COUNT, set the end date to a fixed value
    this.eventForm
      .get("end")
      .setValue(moment().year(9999).endOf("year").toISOString());
  }

  initForm() {
    let endDate = new Date(new Date().getTime()+(6*24*60*60*1000));

    if(history.state && history.state.appointmentDate) {
      endDate = new Date(new Date(history.state.appointmentDate).getTime()+(6*24*60*60*1000));
    }
    //console.log(moment().subtract(7, 'days'));
    this.dateForm = this.fb.group({
      fromDate: [history.state && history.state.appointmentDate ? new Date(history.state.appointmentDate) : null],
      toDate: [null],
    });
    if (this.userInfo.role_id == 5) {

      
      if (history.state && history.state.navType) {
        this.tabIndex = Tabs.List_View;
        this.statusType = history.state.navType;
        this.selectedStatus = history.state.navType;
       // this.getPatientsInfo();
        
      } else {
       // this.getPatientsInfo();

      }

    } 
    this.dateForm.valueChanges.subscribe((data: any) => {
      console.log(data);
      this.getPatientsInfo();
    });

    this.dataService.getCalendarData()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe((data) => {
      if(data) {

        this.patientName= data.patientName;
        this.filterVal = data.patientName;
        this.selectedStatus = 0;
        this.statusType = 0;
        this.selectedDoctor = data.doctor_id;
        this.doctorId  = data.doctor_id;
        this.dateForm.patchValue({
          fromDate: new Date(data.appointmentDate),
          toDate: new Date(new Date(data.appointmentDate).getTime()+(6*24*60*60*1000)), 
        })

        


      }
  });
  }

  completeAppointment(data:any) {
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${data.calender_id}&statusid=10&actionby=${this.userInfo.user_id}&patientid=${data.patient_id}`;
    this.httpService.create(url, {}).subscribe((res: any) => {
      this.getPatientsInfo();
      
    },(error: any) => {
      console.warn("error", error);
    })
  }

 
  getPatientsInfo(initCall?:boolean) {
    console.log(this.userInfo);
    const currentDate=moment().format('YYYY-MM-DD');
    const afterWeekDate=(moment().add(6, 'days')).format('YYYY-MM-DD');
    let allDoctors = false;
    
    // for dashboard to click nextvisit date all doctors should display
    if( !(this.userInfo.role_id  == 5 && !this.userInfo.isadmin_account) ) {
      allDoctors = initCall && history.state  && history.state.appointmentDate ? true :false;
    }
    

    const url = `api/Doctor/GetPatientAppointments`;
    const body = {
      appointmenttypeid: this.appointmentType,
      statusid: this.statusType,
      pagesize: this.pageSize,
      pageno: this.currentPage + 1,
      searchkey: this.filterVal,
      isdoctorlogged: this.userInfo.admin_account === this.userInfo.user_id ? false : allDoctors ? false : this.userInfo.role_id == 6 ? false: this.userInfo.role_id == 4 ? false: this.userInfo.role_id == 5? true : this.doctorId == this.userInfo.user_id ? false: true,
      fromdt: this.dateForm.get("fromDate").value ? moment(this.dateForm.get("fromDate").value).format("YYYY-MM-DD") : null,
      todt: this.dateForm.get("toDate").value ? moment(this.dateForm.get("toDate").value).format("YYYY-MM-DD"): null,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      allrecords: false,
      isqueued: false,
      doctorid:  this.userInfo.role_id == 6 ? this.userInfo.admin_account: this.userInfo.role_id == 4 ? this.userInfo.admin_account: this.doctorId,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      this.patients$.next(res.data.patientAppointments);
      this.totalRecords$.next(res.data.totalRecords);
    });
  }

  onPageChange(index: any) {
    this.currentPage = index.pageIndex;
    this.pageSize = index.pageSize;
    this.getPatientsInfo();
  }

  filterData(val: any) {
    this.filterVal = val;
    this.currentPage = 0;
    this.filterSubject.next(val);
  }

  sortData(event: any) {
    this.sortBy = event.active;
    this.sortDirection = event.direction;
    this.getPatientsInfo();
  }

  downloadData() {
    this.getAllRecords();
  }

  getAllRecords() {
    const url = `api/Doctor/GetPatientAppointments`;
    const body = {
      allrecords: false,
      pageSize: 1,
      pageNo: 100,
      searchkey: "",
      isdoctorlogged:
        this.userInfo.role_id == 5 
          ? true
          : this.doctorId == this.userInfo.user_id
          ? false
          : true,

      // fromdate: null,
      // todate: null,
      fromdate: this.dateForm.get("fromDate").value
        ? moment(this.dateForm.get("fromDate").value).format("YYYY-MM-DD")
        : null,
      todate: this.dateForm.get("toDate").value
        ? moment(this.dateForm.get("toDate").value).format("YYYY-MM-DD")
        : null,
      sortBy: "",
      sortDirection: "",
      isqueued: false,
      appointmenttypeid: 0,
      doctorid:
        this.userInfo.role_id == 5 ? this.userInfo.user_id : this.doctorId,
    };
    this.httpService.create(url, body).subscribe((res: any) => {
      const usersData = res.data?.patientAppointments;
      if (usersData?.length > 0) {
        let patientId = "Queue Number";
        let personalInfo = "Patient Info";
        let phoneNumber = "Phone Number";
        // let riskCondition = "Risk/Condition";
        let appointmentDate = "Appointment Date & Time";
        // let appointmentType = "Appointment Type";
        let appointmentStatus = "Status";
        const headers = [
          patientId,
          personalInfo,
          phoneNumber,
          // riskCondition,
          appointmentDate,
          // appointmentType,
          appointmentStatus,
        ];
        this.uploadData.push(headers);
        let i = 0;
        usersData.map((data: any) => {
          patientId = "HK00000" + (i + 1);
          personalInfo =
            data.first_name +
            " " +
            data.last_name +
            "," +
            data.age +
            "yrs," +
            data.gender;
          phoneNumber = data.mobile_no;
          // riskCondition = "--";
          appointmentDate = data.appointment_date;
          // appointmentType = data.appointment_type;
          // this.statusType=data.status_id;

          appointmentStatus = data.status;
          const importData = [
            patientId,
            personalInfo,
            phoneNumber,
            // riskCondition,
            appointmentDate,
            // appointmentType,
            appointmentStatus,
          ];
          this.uploadData.push(importData);
        });
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.uploadData);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, this.fileName);
        this.uploadData = [];
      }
    });
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {

    if (tabChangeEvent.index == 1) {
      this.renderCalendar();
    }  else  {
      this.getPatientsInfo();
    }
  
    this.filterVal = '';
  }

  gotoProfileDoctorPage(data:any) {

    console.log(data.appointment_category)

    let category = 0;

    let userId = this.userInfo.role_id == 5 ? this.userInfo.user_id : this.doctorId;
    let isSecondOpinion = data?.patient_service_type == 7 || data.subscription_typeid == 7 ? true : false
    data.opinion_id = data.opinion_id ? data.opinion_id: 0;
    
    if(data.opinion_id && data.appointment_category == 'Follow Up') {
      category = -1;
    } else if(data.opinion_id) {
      category = 2;
    }

    if (data.status=='Start' || data.status === 'Pending') {
    
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
        data.calender_id
      }&statusid=${9}&actionby=${userId}&patientid=${data.patient_id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {

           
              this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&opinion_id=${data.opinion_id}&secondopionion=${isSecondOpinion}`, {state:{tabNavigation:category}});

          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );

    } else {
            this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&opinion_id=${data.opinion_id}&secondopionion=${isSecondOpinion}`, {state:{tabNavigation:category}});
    }




  }
  gotoProfileinfo(data:any){
    this._router.navigateByUrl(`/pages/profile?id=${data.patient_id}&appointment=${data.calender_id}`);
  }

  getMasterDataInfo() {
    const url = `api/User/GetMasterData?mastercategoryid=24`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this.appTypes = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );

    const queueStatus = `api/User/GetMasterData?mastercategoryid=59`;

    this.httpService.getAll(queueStatus).subscribe(
      (res: any) => {
        this.bookingConfirmationTypes = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  onQueueVisitChange(event?:any, data?:any) {

    if (event.value == 486) {
      this.noShowConfirmation(event, data)
    }else{
      this.updateStatus(event, data);
    }



  }

  noShowConfirmation(event, data: any): void {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Appointment Cancelled',
      message: 'Are you sure you want to cancel? This action cannot be undone!',
      actions: {
        confirm: {
          label: 'Ok',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      console.log(result);
      if (result === 'confirmed') {
        const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
          data.calender_id
        }&statusid=${13}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;

         this.httpService.create(url, {}).subscribe(
          (res: any) => {

            this.snackBar.open('Appointment canceled successfully', 'close', {
              panelClass: 'snackBarSuccess',
              duration: 2000,
            });

            this.updateStatus(event, data);

          },
          (error: any) => {
            this.snackBar.open(error, 'close', {
              panelClass: 'snackBarFailure',
              duration: 2000,
            });
          }
        );
      } else {
        this.getPatientsInfo();
      }
    });
  }

  updateStatus(event, data) {
    const url = `api/Doctor/GetAppointmentVisitstatus?appointmentid=${data?.calender_id}&visitstatusid=${event.value}`;

      this.httpService.create(url, {}).subscribe(
        (res: any) => {
  
          if(!res.data) {
            this.snackBar.open("Try again", "close", {
              panelClass: "snackBarWarning",
              duration: 2000,
            });
          }
          this.getPatientsInfo();
         },
        (error: any) => {
          console.log("error", error);
        }
      );
  }

  getStatusMasterDataInfo() {
    const url = `api/User/GetMasterData?mastercategoryid=4`;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        //this.statusTypes = res.data;
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  // getBookingTypes() {
  //   this.bookingConfirmationTypes = [
  //     {
  //       mastercategory_id: 124,
  //       category_name: "Booking Status",
  //       category_type: "Doctor",
  //       data_name: "Approved",
  //       masterdata_id: 981,
  //     },
  //     {
  //       mastercategory_id: 124,
  //       category_name: "Booking Status",
  //       category_type: "Doctor",
  //       data_name: "Reschedule",
  //       masterdata_id: 982,
  //     },
  //   ];
  // }


  billingModel(data) {
    this._matDialog
      .open(BillingComponent, {
        width: "60rem",
        height: "100%",
        panelClass:"no-padding-popup",
        position: { right: "0" },
        data: data,
      })
      .afterClosed()
      .subscribe((dataObj) => {
        if (dataObj) {
           data.have_vitals = true;
         // this.getPatientVital();
        }
        this.getPatientsInfo();
      });
  }

  appointmentEdit(data: any, page?:any) {
    
    this.bookAppointment(data,page);
    // const url = `api/Doctor/GetAppointmentById?appointmentid=${data?.calender_id}`;

    // this.httpService.getAll(url).subscribe(
    //   (res: any) => {
    //     this.appointmentData = res.data;
    //     this.bookAppointment(this.appointmentData, data);
    //   },
    //   (error: any) => {
    //     console.log("error", error);
    //   }
    // );
  }

  cancelAppointment(data) {
    const confirmation = this._fuseConfirmationService.open({
      title: "Cancel Appointment",
      message:
        "Are you sure you want to cancel this appointment? This action cannot be undone!",
      actions: {
        confirm: {
          label: "Cancel",
        },
        cancel: {
          label: "Close",
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === "confirmed") {
          // this.openDialog();
        const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${data.calender_id}&statusid=${13}&actionby=${this.userInfo.user_id}&patientid=${data.patient_id}`;
        this.httpService.create(url, null).subscribe((res: any) => {
            if (res?.isSuccess) {
              this.getPatientsInfo();
              this.snackBar.open("Appointment canceled successfully. ","close",
                {
                  panelClass: "snackBarSuccess",
                  duration: 2000,
                }
              );
            }
          },
          (error: any) => {
            console.log("error", error);
          }
        );
      }
    });
  }

  bookAppointment(appointmentdata?: any, page?:any) {
    this._matDialog
      .open(AppointmentFormModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: {
          appointmentdata: appointmentdata, page:page, patient: appointmentdata
          // patientid: data.patient_id,
          // doctorName: data?.doctor_name,
          // appType: data?.appointment_type,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.getPatientsInfo();
        }
      });
  }

  deleteAppointment(data) {
    const dialogRef = this._matDialog.open(ReasonForCancelComponent, {
      width: "450px",
      data: { patientData: data },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getPatientsInfo();
      console.log("The dialog was closed");
      //   this.animal = result;
    });
    // const confirmation = this._fuseConfirmationService.open({
    //   title: "Cancel Appointment",
    //   message:
    //     "Are you sure you want to cancel this appointment? This action cannot be undone!",
    //   actions: {
    //     confirm: {
    //       label: "Cancel",
    //     },
    //     cancel: {
    //       label: "Close",
    //     },
    //   },
    // });
    // confirmation.afterClosed().subscribe((result) => {
    //   if (result === "confirmed") {
    //       this.openDialog();
    //     const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${id}&statusid=${13}&actionby=1`;
    //     this.httpService.create(url, null).subscribe(
    //       (res: any) => {
    //         if (res?.isSuccess) {
    //           this.getPatientsInfo();
    //           this.snackBar.open(
    //             "Appointment canceled successfully. ",
    //             "close",
    //             {
    //               panelClass: "snackBarSuccess",
    //               duration: 2000,
    //             }
    //           );
    //           this.getPatientsInfo();
    //         }
    //       },
    //       (error: any) => {
    //         console.log("error", error);
    //       }
    //     );
    //   }
    // });
  }
  // openDialog(): void {

  // }
  onSelectionChange(key) {
    this.appointmentType = key.value;
    this.getPatientsInfo();
  }
  onStatusChange(key) {
    this.currentPage = 0;
    this.statusType = key.value;
    this.getPatientsInfo();
  }

  onDoctorChange(key) {
    this.currentPage = 0;
    if(key.value == 'all'){
      this.doctorId = this.userInfo.user_id;
    }else{
      this.doctorId = key.value ;
    }
    
    if(key.value && key.value != 'all') {
      sessionStorage.setItem('sessionDoctorId', key.value)
    } else {
      sessionStorage.removeItem('sessionDoctorId');
    }

    this.getPatientsInfo();
  }

  onDoctorChangeCalendar(key) {
    console.log(key)
    // this.doctorId = key.value ? key.value : this.userInfo.user_id;
    if(key.value == 'all'){
      this.doctorId = this.userInfo.user_id;
    }else{
      this.doctorId = key.value ;
    }

    const end = moment(this._fullCalendarApi.view.currentEnd);

    const start = moment(this._fullCalendarApi.view.currentStart);

    if (key.value && key.value != 'all') {
      this.getAppointments(
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD"),
        this.doctorId
      );
      sessionStorage.setItem('sessionDoctorId', key.value)
    } else {
      this.getAppointments(
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD")
      );
      sessionStorage.removeItem('sessionDoctorId');
    }

  }

  onBookingChange(event, data) {
    if (event.value == 981) {
      const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
        data.calender_id
      }&statusid=${8}&actionby=${data.doctor_id}`;
      this.httpService.create(url, null).subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.getPatientsInfo();
            this.snackBar.open(
              "Appointment Confirmed successfully. ",
              "close",
              {
                panelClass: "snackBarSuccess",
                duration: 2000,
              }
            );
            this.getPatientsInfo();
          }
        },
        (error: any) => {
          console.log("error", error);
        }
      );
    } else if (event.value == 982) {
      this.appointmentEdit(data,'edit');
    }
  }

  isApproved: boolean = false;

  confirmAppointment(data) {
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
      data.calender_id
    }&statusid=${8}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;
    this.httpService.create(url, null).subscribe(
      (res: any) => {
        if (res?.isSuccess) {
          this.isApproved = true;
          this.getPatientsInfo();
          this.snackBar.open("Appointment Confirmed successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
          this.getPatientsInfo();
        } else {
          this.isApproved = false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }



  gotoProfile(data) {
    console.log("started");
    const url = `api/Doctor/UpdateAppointmentStatus?appointmentid=${
      data.calender_id
    }&statusid=${9}&actionby=${data.doctor_id}&patientid=${data.patient_id}`;
    this.httpService.create(url, null).subscribe(
      (res: any) => {
        if (res?.isSuccess) {
          // this.isApproved=true;
          this.getPatientsInfo();
          // this.snackBar.open(
          //   "Appointment Confirmed successfully. ",
          //   "close",
          //   {
          //     panelClass: "snackBarSuccess",
          //     duration: 2000,
          //   }
          // );
          // this.getPatientsInfo();
        } else {
          // this.isApproved=false;
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  //   this._router.navigate([], { queryParams: {layout: null}}).then(() => {
  // });

  setDisplayPrescription() {
    localStorage.setItem("displayPrescription", "appointments");
  }

  // get appointments
  
  getAppointments(startDate: string, endDate: string, doctorId?: any) {
    // let userId = this.userInfo.user_id;
    let userId
    let allrecords = false;

    
      if (this.doctorId == this.userInfo.user_id && this.userInfo.role_id != 5) {
       
        allrecords = true;
       
      } else {
        allrecords = false;
        
      }
      
    
    // userId = this.userInfo.admin_account == 3 ? 3 :  userId;
    userId = this.userInfo.role_id == 6 ? this.userInfo.admin_account: this.userInfo.role_id == 4 ? this.userInfo.admin_account: this.doctorId
    // allrecords = this.userInfo.role_id != 5 &&  this.doctorId == this.userInfo.user_id ? true: allrecords;
    console.log(userId)
    
    const url = `api/Doctor/GetCalenderSchedule?from_date=${startDate}&to_date=${endDate}&doctorid=${userId}&allrecords=${true}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        if (res?.data) {
          let tmpEvensts = [];
          res?.data.forEach((e) => {
            let color = "blue";

            switch (e.status) {
              case "Running":
                color = "orange";
                break;
              case "Pending":
                color = "yellow";
                break;

              case "Cancelled":
                color = "red";
                break;

              case "Completed":
                color = "green";
                break;

              case "Start":
                color = "#24a0cf";
                break;

              default:
                color = "blue";
                break;
            }

            tmpEvensts.push({
              startEditable: false,
              id: e.calender_id,
              popupTitle: e.patient_name,
              title:
                e.status_id != 13
                  ? (e.patient_name.length > 10
                      ? e.patient_name.substr(0, 10) + "..."
                      : e.patient_name) + (e.status == 'Start' ? 'Pending':e.status)
                  : e.status == 'Start' ? 'Pending':e.status,
              doctor_name: e.doctor_name,
              duration: 15,
              status: e.status,
              backgroundColor: color,
              recurrence: "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR",
              start: e.schedule_date,
              end: moment(e.schedule_date).add(15, "minute").format(),
            });
          });
          this.events = tmpEvensts;
          this.calAppoinments = res?.data.length !== 0 ? res?.data : [];
          this._changeDetectorRef.detectChanges();
        } else {
          this.events = [];
          this.calAppoinments = [];
          this._changeDetectorRef.detectChanges();
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
  getAppoitnemt(id: number) {
    let result = this.calAppoinments.find((x: any) => x.calender_id === id);
    return result;
  }
  editAppointment(data: any) {
    // Close the event panel
    this._closeEventPanel();
    this._router.navigateByUrl("/apps/patients");
  }
  deletecalAppointment(data: any) {
    this._closeEventPanel();

    let resultObj = this.getAppoitnemt(data.id);

    if (resultObj) {
      let obj = {
        ...resultObj,
        appointment_date: resultObj.schedule_date,
        appointment_typeid: resultObj.schedule_typeid,
      };
      const dialogRef = this._matDialog.open(ReasonForCancelComponent, {
        width: "450px",
        panelClass: "custom-dialog-container",
        data: { patientData: obj },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const end = moment(this._fullCalendarApi.view.currentEnd);

          const start = moment(this._fullCalendarApi.view.currentStart);
          this.getAppointments(
            start.format("YYYY-MM-DD"),
            end.format("YYYY-MM-DD")
          );
        }
        console.log("The dialog was closed");
      });
    }
  }
  addSpace(data: any) {
    const formatText = data.match(/.{1,5}/g);
    return formatText.join(" ");
  }
}
enum Tabs {
  Calendar_View = 1,
  List_View = 0,
}
