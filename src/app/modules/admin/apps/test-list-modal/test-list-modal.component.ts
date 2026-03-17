import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  NgZone,
  ElementRef,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { APIService } from "app/core/api/api";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "app/core/auth/auth.service";
import { ThemePalette } from "@angular/material/core";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { TestRangeModalComponent } from "../test-range-modal/test-range-modal.component";

import * as moment from "moment";
import { borderBottomLeftRadius } from "html2canvas/dist/types/css/property-descriptors/border-radius";
@Component({
  selector: "app-test-list-modal",
  templateUrl: "./test-list-modal.component.html",
  styleUrls: ["./test-list-modal.component.scss"],
})
export class TestListModalComponent implements OnInit {
  @ViewChild("picker") picker: any;

  public date: moment.Moment;
  sampleDate: any;
  public disabled = false;
  public showSpinners = true;
  public showSeconds = false;
  public touchUi = false;
  selectedServices: any[] = [];
  approvedDate: any;
  saveLoading:boolean = false;
  printLoading:boolean = false;
  sendPatientLoading:boolean = false;
  public enableMeridian = false;
  currentDate: Date = new Date();

  public minDate: moment.Moment;
  // public maxDate: moment.Moment;
  maxDate: Date = new Date();
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public color: ThemePalette = "primary";
  checkList: boolean[] = [];
  public stepHours = [1, 2, 3, 4, 5];
  public stepMinutes = [1, 5, 10, 15, 20, 25];
  public stepSeconds = [1, 5, 10, 15, 20, 25];
  TestsList: any[] = [];
  isParametersExist:boolean = true;
  public options = [
    { value: true, label: "True" },
    { value: false, label: "False" },
  ];

  public listColors = ["primary", "accent", "warn"];
  testListForm: FormGroup;
  userInfo: any;
  lastAction: boolean = false;
  @ViewChild("testListFormNGForm") testListFormNGForm: NgForm;
  testData: any = [
    {
      masterdata_id: 1,
      test_name: "1, 25 Dihydroxy Vitamin D Serum",
    },

    {
      masterdata_id: 2,
      test_name: "17 Ketosteroids (Urine)",
    },
  ];
  billId: any;
  id: any;
  age:any;
  refferedBy:any;
  gender:any;
  billno:any;
  department:any;
  printTitle: string;
  name: any;
  refered_by:any;
  role_name :any;
  @ViewChild("print") printBtn: ElementRef<HTMLElement>;
  constructor(
    private _matDialogRef: MatDialogRef<TestListModalComponent>,
    public dialogRef: MatDialogRef<any>,
    private _matDialog: MatDialog,
    private fb: FormBuilder,
    private httpService: APIService,
    private snackBar: MatSnackBar,
    private auth: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.data.patient);

    console.log(this.userInfo);
    this.name = this.data.patient.patient_name;
    this.id = this.data.patient.patient_uniqueid;
    this.age=this.data.patient.age;
    this.refered_by=this.data.patient.refered_by;

    this.gender=this.capitalizeFirstLetter(this.data.patient.gender);
    this.billno=this.data.patient.lab_billno; 
    this.department=this.data.patient.department; 
    this.role_name = this.data.patient.role_id == 5 ? 'Doctor' :  this.data.patient.role_id == 474 ? 'Front Desk' : this.data.patient.role_id == 477 ? 'Lab' : ''
    this.testListForm = this.fb.group({
      tests: this.fb.array([]),
    });

    this.date = moment();
    this.getTestsList();
  }
  dismiss() {
    this._matDialogRef.close();
  }

  get tests() {
    return this.testListForm.controls["tests"] as FormArray;
  }

  addTests(test: any, isDisabled: boolean) {

    let controlsDisabled:boolean = false;
    if (!test.sample_type || !test.test_unit || !test.department || !test.test_range) {
      controlsDisabled = true
    }

    const testForm = this.fb.group({
      patientId: [test.patient_id, Validators.required],
      hospitalServiceId: [test.hospital_service_id, Validators.required],
      paymentId: [test.payment_id, Validators.required],
      name: [test.test_name, Validators.required],
      dateControl: [{ value: test.sample_collection, disabled: isDisabled || controlsDisabled }],
      sample_result: [{value:test.results, disabled: controlsDisabled}],
      verified: [{value:test.verification, disabled:controlsDisabled}],
      sampletype: [test.sample_type],
      unit: [test.test_unit],
      range: [test.test_range],
      units : [test.test_unit],
      group_name: [test.group_name],
      approved_date: [test.report_approvedon],
      isHide: [isDisabled ? true : false],
      isEditPopupHide: [controlsDisabled],
      labtest_id:[test.labtest_id],
      isChecked: [{ value: false, disabled: !test.verification}],
      result_type: [{value:test.result_type ? test.result_type : "", disabled: controlsDisabled}],
    });

    this.tests.push(testForm);
  }

  closePicker() {
    this.picker.cancel();
  }
  getTestsList() {
    this.httpService
      .getAll(
        `api/Lab/GetPatienttest_bylabgroup?labuniqueid=${this.data.labId}&patientid=${this.data.patient.patient_id}`
      )
      .subscribe(
        (res: any) => {
          if (res.data) {
            this.TestsList = res.data;
            let sampleTypes = [];
            console.log(this.TestsList);

            this.TestsList.sort(
              (a, b) =>
                a.sample_type && a.sample_type.localeCompare(b.sample_type)
            );

            for (let i = 0; i < this.TestsList.length; i++) {
            
              if (!this.TestsList[i].sample_type || !this.TestsList[i].test_unit || !this.TestsList[i].department || !this.TestsList[i].test_range) {
                this.isParametersExist = false;
              }
              let index = sampleTypes.indexOf(this.TestsList[i].sample_type);
              if (index == -1) {
                sampleTypes.push(this.TestsList[i].sample_type);
                this.addTests(this.TestsList[i], false);
              } else {
                this.addTests(this.TestsList[i], true);
              }
            }
            console.log(this.tests);
          }
        },
        (error: any) => {
          console.warn("error", error);
        }
      );
  }
  onChange(item) {
    item.checked = !item.checked;

    this.lastAction = item.checked;

    console.log(this.lastAction);
  }
  getSampleDate(type: string) {
    let date: any;

    for (let i = 0; i < this.tests.value.length; i++) {
      if (
        this.tests.value[i].dateControl &&
        type == this.tests.value[i].sampletype
      ) {
        date = this.tests.value[i].dateControl;
        break;
      }
    }
    return date;
  }

  getVerifiedSample(type: string) {
    let isVerified: boolean;

    for (let i = 0; i < this.tests.value.length; i++) {
      if (
        this.tests.value[i].dateControl &&
        type == this.tests.value[i].sampletype
      ) {
        isVerified = this.tests.value[i].verified;
        break;
      }
    }
    return isVerified;
  }
  save() {
   
    this.saveLoading = true;
    let input_fiiled_arrray =[];
    input_fiiled_arrray = this.tests.value.filter( item =>{
      return item.dateControl;
    }
    
    )
    
    if(input_fiiled_arrray.length == 0){
      this.snackBar.open("Please enter atleast one Sample Collection.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      this.saveLoading = false;
      return;
    }
    
    const testListArray = [];
    this.tests.value.forEach((data) => {
      data.approved_date =
        data.approved_date && data.approved_date != "0001-01-01T00:00:00"
          ? data.approved_date
          : data.verified
          ? moment().format("YYYY-MM-DD[T]HH:mm:ss[Z]")
          : undefined;
      testListArray.push({
        paymentid: data.paymentId,
        hospitalserviceid: data.hospitalServiceId,
        samplecollection: data.dateControl
          ? data.dateControl
          : this.getSampleDate(data.sampletype),
        results: data.sample_result,
        result_type: data.result_type,
        labuniqueid: this.data.labId,
        patientid: data.patientId,
        test_name: data.name,
        labbillno: this.data.patient.lab_billno,
        createdby: this.userInfo.user_id,
        group_name: data.group_name,
        approved_date:
          data.approved_date && data.approved_date != "0001-01-01T00:00:00"
            ? data.approved_date
            : data.verified
            ? moment().format("YYYY-MM-DD[T]HH:mm:ss[Z]")
            : undefined,
        verification: data.verified
          ? data.verified
          : this.getVerifiedSample(data.sampletype),
      });
    });

    this.httpService
      .create("api/User/UpdatePatientServiceBillsByList", testListArray)
      .subscribe(
        (res: any) => {
          if (res?.isSuccess) {
            this.snackBar.open("Result saved successfully.", "close", {
              panelClass: "snackBarSuccess",
              duration: 2000,
            });
            
            while (this.tests.length !== 0) {
              this.tests.removeAt(0)
            }

            this.getTestsList();
          } else {
            this.snackBar.open(res.data, "close", {
              panelClass: "snackBarWarning",
              duration: 2000,
            });
          }
          this.saveLoading = false;
        },
        (error: any) => {
          this.saveLoading = false;
          console.warn("error", error);
        }
      );
  }
 
  showOptions(event: any, data: any, index: number) {
    if (event.checked) {
      if (data.value.approved_date) {
        data.controls.isChecked.enable();
      }
    } else {
      data.controls.isChecked.disable();
    }
  }
  enableVerifiation(event: any, data: any, index: number) {
    console.log(event.length)
    console.log(data.value)
    if (event && event.length != 0) {
      
        data.controls.verified.enable();
      
    } else {
      data.controls.verified.disable();
    }
  }
  disableBtn:boolean = true;
  checkedOptions(event: any, data: any, index: number){
    let checkedArray =[];
    checkedArray = this.tests.value.filter(item =>{
      return item.isChecked
    })
    if(checkedArray.length > 0){
      this.disableBtn = false
    }else{
      this.disableBtn = true
    }

  }

  generateBill(isSendToPatient?: boolean) {
    
    if (isSendToPatient) {
      this.sendPatientLoading = true;
    } else {
      this.printLoading = true;
    }
    

    // data.lab_uniqueid,data.patient_id
    this.selectedServices = [];
    let serviceNames = [];
    let duplicateErrorFound = false;
    this.currentDate = new Date();

    let list=[];
    let selectedList;
    list.push(...this.tests.value.filter(obj=> obj.isChecked))
    selectedList=this.tests.value.filter(t=> list.some(obj=>   t.sampletype.includes(obj.sampletype) ))
    this.tests.value.forEach((data) => {
      if (data.isChecked) {
        if (serviceNames.length == 0) {
          serviceNames.push(data.sampletype);
        } else if (serviceNames.indexOf(data.sampletype) == -1) {
          duplicateErrorFound = true;
        }
        if (!duplicateErrorFound) {
          for(var i=0;i<selectedList.length;i++)

          this.selectedServices.push({
            test_name: selectedList[i].name,
            sample_type:selectedList[i].sampletype,
            dateControl: selectedList[i].dateControl,
            results: selectedList[i].sample_result,
            result_type: selectedList[i].result_type,
            unit: selectedList[i].unit,
            approved_date: selectedList[i].approved_date,
            range: selectedList[i].range,
            test_unit:selectedList[i].units


          });
        }
      }
    });

    if (this.selectedServices.length == 0) {
      this.snackBar.open("Please select atleast one test.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      if (isSendToPatient) {
        this.sendPatientLoading = false;
      } else {
        this.printLoading = false;
      }
      return;
    }

    this.printTitle = `${this.data.patient.patient_name}_${
      serviceNames[0]
    }_${moment(this.currentDate).format("DD-MMM-YYYY")}`;
    this.sampleDate = this.selectedServices[0].dateControl;
    this.approvedDate = this.selectedServices[0].approved_date;

    if (!duplicateErrorFound) {
      setTimeout(() => {
        // let el: HTMLElement = this.printBtn.nativeElement;
        // el.click();

        this.generatePDF(isSendToPatient, selectedList[0]);
        // this.billLoading = false;
      }, 2000);
    } else {
      this.snackBar.open("Please select only one specimen type.", "close", {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      if (isSendToPatient) {
        this.sendPatientLoading = false;
      } else {
        this.printLoading = false;
      }
    }
  }

  async generatePDF(isSendToPatient: boolean, selctedService:any) {
    // Invoice markup
    // Author: Max Kostinevich
    // BETA (no styles)
    // http://pdfmake.org/playground.html
    // playground requires you to assign document definition to a variable called dd

    // CodeSandbox Example: https://codesandbox.io/s/pdfmake-invoice-oj81y

    var dd = {
      footer: {
        
        columns: [
         [
          { text: 'Checked by', alignment: 'left',  margin: [ 50, -100, 0, 0 ] },
          
          
          //  { text: this.department, alignment: 'right',  margin: [ 0, -70, 50, 0 ] }
        ],[
          { text: 'Department', alignment: 'right', margin: [ 0, -100, 50, 0 ] },
        { text: this.department, alignment: 'left',  margin: [ 175, 10, 0, 0 ] }
      ],
        ]
        
          
      },
    
      content: [
        // Header

        // Billing Headers

        // Billing Details
        {
          margin: [ 0, 50, 0, 0 ],
          columns: [
            {
             
              stack: [
                
                {
                  columns: [
                    {
                      text: "Patient Name:",
                      style: "invoiceSubTitle",
                      width: "*",
                      margin:[0,0,0,1]
                       
                    },
                    {
                      text: this.name,
                      style: "invoiceSubValue",
                      width: 150,
                      
                      
                      
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: "Age & Gender:",
                      style: "invoiceSubTitle",
                      width: "*",
                      margin:[0,1,0,0],
                    },
                    {
                      text: this.age+" "+"yrs,"+this.gender,
                      style: "invoiceSubValue",
                      width: 150,
                      
                    },
                  ],
                },

                {
                  columns: [
                    {
                      text: "UHID:",
                      style: "invoiceSubTitle",
                      width: "*",
                      margin:[0,1,0,0],

                    },
                    {
                      text: this.id,
                      style: "invoiceSubValue",
                      width: 150,
                      
                    },
                  ],
                },

                {
                  columns: [
                    {
                      text: "Referred by:",
                      style: "invoiceSubTitle",
                      width: "*",
                    },
                    {
                      text:
                        this.userInfo.first_name +
                        " " +
                        this.refered_by + '(' + this.role_name + ')',
                      style: "invoiceSubValue",
                      width: 150,
                    },
                  ],
                },
                {
                  columns: [
                    {
                      text: "Department:",
                      style: "invoiceSubTitle",
                      width: "*",
                    },
                    {
                      text:this.department,
                      style: "invoiceSubValue",
                      width: 150,
                    },
                  ],
                },
                
              ],
            },

            [
              {
                stack: [
                  
                  {
                    columns: [
                      {
                        text: "Sample Collected on:",
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: moment(this.sampleDate).format(
                          "DD, MMM, YYYY : hh:mm a"
                        ),
                        style: "invoiceSubValue",
                        width: 120,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: "Report Generated on:",
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text: moment(this.currentDate).format(
                          "DD, MMM, YYYY : hh:mm a"
                        ),
                        style: "invoiceSubValue",
                        width: 120,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: "Bill No:",
                        style: "invoiceSubTitle",
                        width: "*",
                      },
                      {
                        text:this.billno,
                        style: "invoiceSubValue",
                        width: 120,
                      },
                    ],
                  },
                  

                ],

              },
            ],
            
          ],
        },
        // var footer={
        //   content:[
        //     {
        //       stack:[
        //         {text:'checked by',style:"leftfooter"},
        //         {text:'',style:"rightfooter"}
        //       ],
              
        //     },
        //   ]
        // }
          
        // Billing Address Title

        // Billing Address

        // Line breaks
        "\n\n",
        // Items
        {
          canvas: 
          [
              {
                  type: 'line',
                  x1: -100, y1: 0,
                  x2: 600, y2: 0,
                  lineWidth: 0.5
              },
              // {
              //     type: 'polyline',
              //     lineWidth: 3,
              //     closePath: true,
              //     points: [{ x: 10, y: 10}, { x: 35, y: 40 }, { x: 100, y: 40 }, { x: 125, y:10 }]
              // }
          ]
       },
      
        {
          layout:'noBorders',
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: 
            [200,100,100,100,],

            body: [
              // Table Header
              [
                {
                  text: "TEST PARAMETER",
                  style: "itemsHeader",
                },
                {
                  text: "SPECIMEN",
                  style: "itemsHeader",
                
                },
                {
                  text: "RESULT",
                  style: ["itemsHeader"],
                },
                // {
                //   text: "UNIT",
                //   style: ["itemsHeader"],
                // },
                {
                  text: "BIOLOGICAL REF. INTERVAL",
                  style: ["itemsHeader"],
                },
                // {
                //   text: "METHODS",
                //   style: ["itemsHeader"],
                // },
                
              ],

              ...this.selectedServices.map((p) => [
                p.test_name,
                p.sample_type,
                {
                  text: p.result_type == "normal" ? p.results : p.results + "*",
                  style:
                    p.result_type == "normal"
                      ? "reslutsNormal"
                      : "resultsInNormal",
                },
                // p.unit,
                p.range+" "+p.test_unit,

                // "Method name",
              ]),

              

              // Items
              // Item 1
              //  [
              //      {
              //          text:'1',
              //          style:'itemNumber'
              //      },
              //      {
              //          text:'1',
              //          style:'itemNumber'
              //      },
              //      {
              //          text:'$999.99',
              //          style:'itemNumber'
              //      },
              //      {
              //          text:'0%',
              //          style:'itemNumber'
              //      }

              //  ],
              // Item 2

              // END Items
            ],
          }, // table
          //  gurl: 'lightHorizontalLines'
        },
        // TOTAL

        // Signature
        // 
        
      ],
      styles: {
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: "right",
          margin: [0, 0, 0, 15],
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 10,
          // 			alignment:'right'
        },

        resultsInNormal: {
          bold: true,
        },
        invoiceSubValue: {
          fontSize: 10,
          bold: true,
          // margin: [0, 0, 0, 5],
          margin:[-20,0,0,5]
          // 			alignment:'right'
        },
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: "left",
          margin: [0, 20, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails: {
          alignment: "left",
        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true,
        },
        invoiceBillingAddress: {},
        // Items Header
        itemsHeader: {
          margin: [0, 10, 0, 5],
          bold: true,
          fontSize: 10,
          decoration:"underline",
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11,
        },
        itemNumber: {
          margin: [2, 5, 0, 5],
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: "center",
        },

        center: {
          alignment: "center",
        },
      },
      defaultStyle: {
        columnGap: 20,
      },
    };

    if (isSendToPatient) {
      const pdfDocGenerator = pdfMake.createPdf(dd);
      pdfDocGenerator.getBase64((data) => {
        this.saveLabReport(data, selctedService);
      });
    } else {
      pdfMake.createPdf(dd).download(this.printTitle + ".pdf");
    }
    if (isSendToPatient) {
      this.sendPatientLoading = false;
    } else {
      this.printLoading = false;
    }
  }

  saveLabReport(data: any, selectedService:any) {
    const bodyInvestigation = {
      investigationid: 0,
      patientid: parseInt(this.data.patient.patient_id),
      recorddate: moment(this.currentDate).format("YYYY-MM-DD"),
      testname: undefined,
      docnotes: undefined,
      createdby: this.userInfo.user_id,
      reportfor: parseInt(this.data.patient.patient_id),
      reporttypeid: 57,
      "is_notify": true,
      "notify_msg": "Lab Techncian sent to report please check your lab report",    
      reportcategoryid: 57,
      labtestid: selectedService.labtest_id,
      investigationReportList: [
        {
          patientreportid: 0,
          filename: `${moment().format("DDMMYYYYHHmmss")}.pdf`,
          mimetype: "pdf",
          fileBase64: data,
        },
      ],
    };
    // const bodyPrescrition = {
    //   prescriptionid: 0,
    //   patientid: parseInt(this.patientId),
    //   recorddate: this.reportForm.controls.recordDate.value ? moment(this.reportForm.controls.recordDate.value).format("YYYY-MM-DD") : undefined,
    //   filename: this.reportForm.controls.fileName.value,
    //   docnotes: this.reportForm.controls.notes.value,
    //   createdby: this.userInfo.user_id,
    //   reportcategoryid: parseInt(this.reportForm.controls.reportType.value),
    //   patientReports: [
    //     {
    //       patientreportid: 0,
    //       filename: `${moment().format("DDMMYYYYHHmmss")}.${fileExtenstion}`,
    //       mimetype: this.mimetype,
    //       fileBase64: this.fileBase64
    //     }
    //   ]
    // }
    const url = `api/Investigations/ManageInvestigations_forlabtest`;
    this.httpService.create(url, bodyInvestigation).subscribe(
      (res: any) => {
        this.snackBar.open("report uploaded successfully. ", "close", {
          panelClass: "snackBarSuccess",
          duration: 2000,
        });
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  checkDataFill(labtest_id, index:number) {

    const url = `api/Lab/GetHospitalTestLabServices_ById?labid=${labtest_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
          console.log(res.data);

         
          if (res.data && res.data[0] && (res.data[0].sample_type && res.data[0].unit && res.data[0].department && res.data[0].range)) {
            this.tests
            .at(index)
            .get("dateControl")
            .enable();

            this.tests
            .at(index)
            .get("sample_result")
            .enable();

            this.tests
            .at(index)
            .get("verified")
            .enable();
            
            this.tests
            .at(index)
            .get("isEditPopupHide")
            .setValue(false);

            this.tests
            .at(index)
            .get("result_type")
            .enable();


            this.isParametersExist = true;

             for (let i = 0; i < this.TestsList.length; i++) {
            
              if (!this.TestsList[i].sample_type || !this.TestsList[i].test_unit || !this.TestsList[i].department || !this.TestsList[i].test_range) {
                this.isParametersExist = false;
                break;
              }
             
            }

           
          }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  openReangeTest(data, index:number) {


    const url = `api/Lab/GetHospitalTestLabServices_ById?labid=${data.labtest_id}`;
    this.httpService.getAll(url).subscribe(
      (res: any) => {
        this._matDialog
      .open(TestRangeModalComponent, {
        width: "50rem",
        height: "100%",
        panelClass: "no-padding-popup",
        position: { right: "0" },
        data: {
          data: res.data[0],
        },
      })
      .afterClosed()
      .subscribe((dataObj) => {
        if (dataObj) {
          this.isParametersExist = true;
          this.checkDataFill(data.labtest_id, index);
          // this.getTestsList();

          // while (this.tests.length !== 0) {
          //   this.tests.removeAt(0)
          // }
        

        }
      });
      },
      (error: any) => {
        console.log("error", error);
      }
    );

    

    
  }
  capitalizeFirstLetter(string) {
    if(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    } else {
      return "";
    }
    
}

updateDate() {
  this.maxDate = new Date();
}
}
