export interface TableData {
    medicine: string;
    dose: string;
    food:string;
    duration:string;
    note:string;
  }
  export interface VaccinData {
    vaccination: string;
    date: string;
    name:string;
    roa:string;
    values:string;
    dose:string;
  }
  export interface VitalData{
    systolicBp:string;
    dystolicBp:string;
    heartRate:string;
    temperature:string;
    respiratoryRate:string;
    spo2:string;
    weight:string;
    tempid: number;
    sp02id: number;
    respiratoryid: number;
    heartid: number;
    bpid: number;
    weightid:number;

  }