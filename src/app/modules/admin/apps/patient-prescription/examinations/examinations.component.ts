import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { APIService } from "app/core/api/api";
import { AuthService } from "app/core/auth/auth.service";
import moment from "moment";

@Component({
  selector: "app-examinations",
  templateUrl: "./examinations.component.html",
  styleUrls: ["./examinations.component.scss"],
})
export class ExaminationsComponent implements OnInit {
  examinationForm: FormGroup;
  today = moment();
  submitted = false;
  seasons: string[] = ["Absent", "Mild", "Moderate", "Severe"];
  state: string[] = ["Present", "abscent"];
  @ViewChild("examinationNGForm") chiefComplaintNGForm: NgForm;
  sofaScore: any;
  category31: any;
  category32: any;
  editMode = false;
  userInfo: any;
  isLoadingSpinner=false;
  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<any>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private httpService: APIService,
    private auth: AuthService
  ) {
    this.userInfo = JSON.parse(this.auth.user);
  }

  ngOnInit(): void {
    console.log(this.today);
    console.log(this.data);
    if (this.data && this.data.userId && this.data.examin) {
      this.editMode = true;
    }
    this.getMasterDataInfo(31);
    this.getMasterDataInfo(32);
    this.getMasterDataInfo(33);
    this.examinationForm = this._formBuilder.group({
      general: [""],
      general_text: [""],
      general_abnormal_text:[""],

      skin_hair_nails: [""],
      skin_hair_nails_text: [""],
      skin_hair_nails_abnormal_text:[""],
      
      head: [""],
      head_text: [""],
      head_abnormal_text:[""],

      eyes: [""],
      eyes_text: [""],
      eyes_abnomral_text:[""],

      ears: [""],
      ears_text: [""],
      ears_abnormal_text:[""],

      nose: [""],
      nose_text: [""],
      nose_abnormal_text: [""],

      mouth_throat: [""],
      mouth_throat_text: [""],
      mouth_throat_abnormal_text:[""],

      neck: [""],
      neck_text: [""],
      neck_abnormal_text:[""],

      breasts: [""],
      breasts_text: [""],
      breasts_abnormal_text:[""],

      lymph_nodes: [""],
      lymph_nodes_text: [""],
      lymph_nodes_abnormal_text:[""],

      chest: [""],
      chest_text: [""],
      chest_abnormal_text:[""],

      lungs: [""],
      lungs_text: [""],
      lungs_abnormal_text:[""],

      heart: [""],
      heart_text: [""],
      heart_abnormal_text:[""],

      abdomen: [""],
      abdomen_text: [""],
      abdomen_abnormal_text:[""],

      genitour_male: [""],
      genitour_male_text: [""],
      genitour_male_abnormal_text:[""],

      genitour_female: [""],
      genitour_female_text: [""],
      genitour_female_abnormal_text:[""],

      neurologic: [""],
      neurologic_text: [""],
      neurologic_abnormal_text:[""],

      psychiatric: [""],
      psychiatric_text: [""],
      psychiatric_abnormal_text:[""]
    });

    this.examinationForm.patchValue({
     
      general: this.data.examin ? this.data.examin.general : "",
      general_text: this.data.examin.general == 'normal' ? this.data.examin.general_text : "",
      general_abnormal_text: this.data.examin.general == 'abnormal' ? this.data.examin.general_text : "",

      skin_hair_nails: this.data.examin ? this.data.examin.skin_hair_nails : "",
      skin_hair_nails_text: this.data.examin.skin_hair_nails  == 'normal' ? this.data.examin.skin_hair_nails_text : "",
      skin_hair_nails_abnormal_text: this.data.examin.skin_hair_nails  == 'abnormal' ? this.data.examin.skin_hair_nails_text : "",

      head: this.data.examin ? this.data.examin.head : "",
      head_text: this.data.examin.head == 'normal' ? this.data.examin.head_text : "",
      head_abnormal_text: this.data.examin.head == 'abnormal' ? this.data.examin.head_text : "",

      eyes: this.data.examin ? this.data.examin.eyes : "",
      eyes_text: this.data.examin.eyes == 'normal' ? this.data.examin.eyes_text : "",
      eyes_abnomral_text: this.data.examin.eyes == 'abnormal' ? this.data.examin.eyes_text : "",

      ears: this.data.examin ? this.data.examin.ears : "",
      ears_text: this.data.examin.ears == 'normal'? this.data.examin.ears_text : "",
      ears_abnormal_text: this.data.examin.ears == 'abnormal'? this.data.examin.ears_text : "",

      nose: this.data.examin ? this.data.examin.nose : "",
      nose_text: this.data.examin.nose == 'normal' ? this.data.examin.nose_text : "",
      nose_abnormal_text: this.data.examin.nose == 'abnormal' ? this.data.examin.nose_text : "",

      mouth_throat: this.data.examin ? this.data.examin.mouth_throat : "",
      mouth_throat_text: this.data.examin.mouth_throat == 'normal' ? this.data.examin.mouth_throat_text : "",
      mouth_throat_abnormal_text: this.data.examin.mouth_throat == 'abnormal' ? this.data.examin.mouth_throat_text : "",

      neck: this.data.examin ? this.data.examin.neck : "",
      neck_text: this.data.examin.neck == 'normal'  ? this.data.examin.neck_text : "",
      neck_abnormal_text: this.data.examin.neck == 'abnormal'  ? this.data.examin.neck_text : "",

      breasts: this.data.examin ? this.data.examin.breasts : "",
      breasts_text: this.data.examin.breasts == 'normal'? this.data.examin.breasts_text : "",
      breasts_abnormal_text: this.data.examin.breasts == 'abnormal'? this.data.examin.breasts_text : "",


      lymph_nodes: this.data.examin ? this.data.examin.lymph_nodes : "",
      lymph_nodes_text: this.data.examin.lymph_nodes== 'normal' ? this.data.examin.lymph_nodes_text : "",
      lymph_nodes_abnormal_text: this.data.examin.lymph_nodes== 'abnormal' ? this.data.examin.lymph_nodes_text : "",

      chest: this.data.examin ? this.data.examin.chest : "",
      chest_text: this.data.examin.chest == 'normal' ? this.data.examin.chest_text : "",
      chest_abnormal_text: this.data.examin.chest == 'abnormal' ? this.data.examin.chest_text : "",

      lungs: this.data.examin ? this.data.examin.lungs : "",
      lungs_text: this.data.examin.lungs == 'normal' ? this.data.examin.lungs_text : "",
      lungs_abnormal_text: this.data.examin.lungs == 'abnormal' ? this.data.examin.lungs_text : "",

      heart: this.data.examin ? this.data.examin.heart : "",
      heart_text: this.data.examin.heart == 'normal' ? this.data.examin.heart_text : "",
      heart_abnormal_text: this.data.examin.heart == 'abnormal' ? this.data.examin.heart_text : "",

      abdomen: this.data.examin ? this.data.examin.abdomen : "",
      abdomen_text: this.data.examin.abdomen == 'normal' ? this.data.examin.abdomen_text : "",
      abdomen_abnormal_text: this.data.examin.abdomen == 'abnormal' ? this.data.examin.abdomen_text : "",

      genitour_male: this.data.examin ? this.data.examin.genitour_male : "",
      genitour_male_text: this.data.examin.genitour_male == 'normal' ? this.data.examin.genitour_male_text : "",
      genitour_male_abnormal_text: this.data.examin.genitour_male == 'abnormal' ? this.data.examin.genitour_male_text : "",

      genitour_female: this.data.examin ? this.data.examin.genitour_female : "",
      genitour_female_text: this.data.examin.genitour_female == 'normal' ? this.data.examin.genitour_female_text : "",
      genitour_female_abnormal_text: this.data.examin.genitour_female == 'abnormal' ? this.data.examin.genitour_female_text : "",

      neurologic: this.data.examin ? this.data.examin.neurologic : "",
      neurologic_text: this.data.examin.neurologic == 'normal' ? this.data.examin.neurologic_text : "",
      neurologic_abnormal_text: this.data.examin.neurologic == 'abnormal' ? this.data.examin.neurologic_text : "",

      psychiatric: this.data.examin ? this.data.examin.psychiatric : "",
      psychiatric_text: this.data.examin.psychiatric == 'normal' ? this.data.examin.psychiatric_text : "",
      psychiatric_abnormal_text: this.data.examin.psychiatric == 'abnormal' ? this.data.examin.psychiatric_text : "",
    });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.examinationForm.controls;
  }
  initiatevalue() {


    // const radioValue1 = this.examinationForm.get('general').value;
    // const radioValue2 = this.examinationForm.get('skin_hair_nails').value;
    // if (radioValue1 && radioValue1 === 'normal') {
    //   this.examinationForm.controls.general_text.setValue("Well nourished, well developed, oriented, alert, no apparent distress");
    // } else if (radioValue1 &&  radioValue1 === 'abnormal') {
     
    //    this.examinationForm.controls.general_text.setValue(null);
    //    console.log(this.examinationForm.controls.general_text.value)
    // } 
    // if (radioValue2 && radioValue2 === 'normal') {
    //   this.examinationForm.controls.skin_hair_nails_text.setValue("Skin appears normal with good turgor. No rash, no suspicious lesions, no ulceration, no nevi. Hair and nails normal.");
    // } else if (radioValue2 &&  radioValue2 === 'abnormal') {
    //   this.examinationForm.controls.skin_hair_nails_text.setValue(null);
    //   console.log(this.examinationForm.controls.skin_hair_nails_text.value)
    // } 
   
    if (this.examinationForm.controls.general.value == "normal") {
      this.examinationForm.patchValue({
        general_text:
          "Well nourished, well developed, oriented, alert, no apparent distress",
      });
    } 

    if (this.examinationForm.controls.skin_hair_nails.value == "normal") {
      this.examinationForm.patchValue({
        skin_hair_nails_text:
          "Skin appears normal with good turgor. No rash, no suspicious lesions, no ulceration, no nevi. Hair and nails normal.",
      });
    } 

    if (this.examinationForm.controls.head.value == "normal") {
      this.examinationForm.patchValue({
        head_text: "Normocephalic, scalp normal",
      });
    } 

    if (this.examinationForm.controls.eyes.value == "normal") {
      this.examinationForm.patchValue({
        eyes_text:
          "Eyelids normal, sclera white, conjunctiva clear, cornea normal. PERRLA, EOMI, no evidence of cataract, fundoscopy normal",
      });
    } 
    if (this.examinationForm.controls.ears.value == "normal") {
      this.examinationForm.patchValue({
        ears_text:
          "External ears normal. Tympanic membranes intact and normal on both sides. External auditory canals normal. No ear discharge, grossly normal hearing",
      });
    } 
    if (this.examinationForm.controls.nose.value == "normal") {
      this.examinationForm.patchValue({
        nose_text:
          "No deformities, nares patent, no polyps, no discharge, no deviation of nasal septum.",
      });
    } 
    if (this.examinationForm.controls.mouth_throat.value == "normal") {
      this.examinationForm.patchValue({
        mouth_throat_text:
          "Normal dentition, gingiva, tongue and oral mucosa normal. No oral lesions. Oral pharynx normal with no erythema or exudates.",
      });
    } 
    if (this.examinationForm.controls.neck.value == "normal") {
      this.examinationForm.patchValue({
        neck_text:
          "Neck supple, no mass, no abnormal cervical lymph nodes, no thyroid swelling. Trachea is in the midline. No suprasternal pulsation.",
      });
    } 
    if (this.examinationForm.controls.breasts.value == "normal") {
      this.examinationForm.patchValue({
        breasts_text:
          "Soft, no masses, no tenderness, no nipple discharge, no skin changes, no axillary lymphadenopathy",
      });
    } 
    if (this.examinationForm.controls.lymph_nodes.value == "normal") {
      this.examinationForm.patchValue({
        lymph_nodes_text: "Normal. No palpable lymphadenopathy",
      });
    } 
    if (this.examinationForm.controls.chest.value == "normal") {
      this.examinationForm.patchValue({
        chest_text:
          "Normal shape and expansion, symmetric, no scars, no deformities",
      });
    } 
    if (this.examinationForm.controls.lungs.value == "normal") {
      this.examinationForm.patchValue({
        lungs_text:
          "Normal vesicular breath sounds bilaterally. Lungs are clear to percussion and auscultation.",
      });
    } 
    if (this.examinationForm.controls.heart.value == "normal") {
      this.examinationForm.patchValue({
        heart_text:
          "Carotid artery upstroke and amplitude bilaterally normal. JVP normal. Normal PMI, regular heart rate and rhythm, Normal S1 and S2, no murmurs, rubs or gallops.",
      });
    } 
    if (this.examinationForm.controls.abdomen.value == "normal") {
      this.examinationForm.patchValue({
        abdomen_text:
          "Soft, non-tender, non-distended, no hepatosplenomegaly, no other masses, bowel sounds normal.",
      });
    } 
    if (this.examinationForm.controls.genitour_male.value == "normal") {
      this.examinationForm.patchValue({
        genitour_male_text:
          "No rash, no penile discharge, no scrotal swelling, no testicular mass or tenderness.",
      });
    } 
    if (this.examinationForm.controls.genitour_female.value == "normal") {
      this.examinationForm.patchValue({
        genitour_female_text:
          "Vulva and vagina appear normal. No evidence of abnormal lesions, discharge or mass per vaginum.",
      });
    } 
    if (this.examinationForm.controls.neurologic.value == "normal") {
      this.examinationForm.patchValue({
        neurologic_text:
          "Cranial nerves II to XII grossly intact. No focal deficits.",
      });
    } 
    if (this.examinationForm.controls.psychiatric.value == "normal") {
      this.examinationForm.patchValue({
        psychiatric_text: "Alert, OrientedX4.",
      });
    }
  }

  onSubmit() {
    console.log(this.examinationForm);
    this.isLoadingSpinner=true;
    this.submitted = true;
    const formValue = this.examinationForm.value; 
    // Although in this case it'd be semantically better to use .reduce, but for the sake of simplicity I'd prefer to use combination of .map + .some. If you're not afraid of .reduce, you can apply it here. 
    const mapped = Object.values(formValue).map(value => !!value);
    const hasValues = mapped.some(value => value);

    if(!hasValues) {
      this.snackBar.open( 'Please enter atleast one field.', 'close', {
        panelClass: "snackBarWarning",
        duration: 2000,
      });
      return;
    }
    // if (this.examinationForm.invalid) {
    //   return;
    // }
    const body = {
      examid: this.editMode ? this.data.examin.exam_id : 0,
      appointmentid: this.data.examin
        ? this.data.examin.appointment_id
        : this.data.appointmentId
        ? parseInt(this.data.appointmentId)
        : 0,
      patientid: parseInt(this.data.userId), // patientid from GetUserById

      createdby: this.userInfo.user_id,
      examinationdate: moment(),
    
      general_type: this.examinationForm.controls.general.value,
      generaltext: this.examinationForm.controls.general_text.value ? this.examinationForm.controls.general_text.value : this.examinationForm.controls.general_abnormal_text.value,

      skin_hair_nails_type: this.examinationForm.controls.skin_hair_nails.value,
      skin_hair_nailstext: this.examinationForm.controls.skin_hair_nails_text.value ? this.examinationForm.controls.skin_hair_nails_text.value : this.examinationForm.controls.skin_hair_nails_abnormal_text.value,

      head_type: this.examinationForm.controls.head.value,
      headtext: this.examinationForm.controls.head_text.value ? this.examinationForm.controls.head_text.value : this.examinationForm.controls.head_abnormal_text.value,

      eyes_type: this.examinationForm.controls.eyes.value,
      eyestext: this.examinationForm.controls.eyes_text.value ? this.examinationForm.controls.eyes_text.value : this.examinationForm.controls.eyes_abnomral_text.value,

      ears_type: this.examinationForm.controls.ears.value,
      earstext: this.examinationForm.controls.ears_text.value ? this.examinationForm.controls.ears_text.value : this.examinationForm.controls.ears_abnormal_text.value,

      nose_type: this.examinationForm.controls.nose.value,
      nosetext: this.examinationForm.controls.nose_text.value ? this.examinationForm.controls.nose_text.value : this.examinationForm.controls.nose_abnormal_text.value,

      mouth_throat_type: this.examinationForm.controls.mouth_throat.value,
      mouth_throattext: this.examinationForm.controls.mouth_throat_text.value ? this.examinationForm.controls.mouth_throat_text.value : this.examinationForm.controls.mouth_throat_abnormal_text.value,

      neck_type: this.examinationForm.controls.neck.value,
      necktext: this.examinationForm.controls.neck_text.value ? this.examinationForm.controls.neck_text.value : this.examinationForm.controls.neck_abnormal_text.value,

      breasts_type: this.examinationForm.controls.breasts.value,
      breaststext: this.examinationForm.controls.breasts_text.value ? this.examinationForm.controls.breasts_text.value : this.examinationForm.controls.breasts_abnormal_text.value,

      lymph_nodes_type: this.examinationForm.controls.lymph_nodes.value,
      lymph_nodestext: this.examinationForm.controls.lymph_nodes_text.value ? this.examinationForm.controls.lymph_nodes_text.value : this.examinationForm.controls.lymph_nodes_abnormal_text.value,

      chest_type:this.examinationForm.controls.chest.value ,
      chesttext: this.examinationForm.controls.chest_text.value ? this.examinationForm.controls.chest_text.value : this.examinationForm.controls.chest_abnormal_text.value,

      lungs_type: this.examinationForm.controls.lungs.value,
      lungstext: this.examinationForm.controls.lungs_text.value ? this.examinationForm.controls.lungs_text.value : this.examinationForm.controls.lungs_abnormal_text.value,

      heart_type: this.examinationForm.controls.heart.value, 
      hearttext: this.examinationForm.controls.heart_text.value ? this.examinationForm.controls.heart_text.value : this.examinationForm.controls.heart_abnormal_text.value,

      abdomen_type: this.examinationForm.controls.abdomen.value,
      abdomentext: this.examinationForm.controls.abdomen_text.value ? this.examinationForm.controls.abdomen_text.value : this.examinationForm.controls.abdomen_abnormal_text.value,

      genitour_male_type: this.examinationForm.controls.genitour_male.value,
      genitour_maletext: this.examinationForm.controls.genitour_male_text.value ? this.examinationForm.controls.genitour_male_text.value : this.examinationForm.controls.genitour_male_abnormal_text.value,

      genitour_female_type: this.examinationForm.controls.genitour_female.value,
      genitour_femaletext: this.examinationForm.controls.genitour_female_text.value ? this.examinationForm.controls.genitour_female_text.value : this.examinationForm.controls.genitour_female_abnormal_text.value,

      neurologic_type: this.examinationForm.controls.neurologic.value,
      neurologictext: this.examinationForm.controls.neurologic_text.value ? this.examinationForm.controls.neurologic_text.value : this.examinationForm.controls.neurologic_abnormal_text.value,

      psychiatric_type: this.examinationForm.controls.psychiatric.value,
      psychiatrictext: this.examinationForm.controls.psychiatric_text.value ? this.examinationForm.controls.psychiatric_text.value : this.examinationForm.controls.psychiatric_abnormal_text.value,
    };
    const url = "api/Doctor/SavePhysicalExamination";
    this.httpService.create(url, body).subscribe(
      (res: any) => {
        this.isLoadingSpinner=false;
        this.dialogRef.close(true);
        if (this.editMode) {
          this.snackBar.open("Examination updated successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        } else {
          this.snackBar.open("Examination saved successfully. ", "close", {
            panelClass: "snackBarSuccess",
            duration: 2000,
          });
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }

  onReset(): void {
    this.submitted = false;
    this.examinationForm.reset();
  }

  getMasterDataInfo(type) {
    const url = `api/User/GetMasterData?mastercategoryid=` + type;

    this.httpService.getAll(url).subscribe(
      (res: any) => {
        switch (type) {
          case 31:
            this.category31 = res.data;
            break;
          case 32:
            this.category32 = res.data;
            break;
          case 33:
            this.sofaScore = res.data;
            break;
          default:
        }
      },
      (error: any) => {
        console.log("error", error);
      }
    );
  }
}
