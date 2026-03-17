import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { APIService } from "app/core/api/api";
import {
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexFill,
  ApexChart,
  ChartComponent,
  
} from "ng-apexcharts";
import moment from "moment";
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  labels: string[];
  stroke?: ApexStroke;
  colors?: any[];
};

@Component({
  selector: "app-circular-progress-chart",
  templateUrl: "./circular-progress-chart.component.html",
  styleUrls: ["./circular-progress-chart.component.scss"],
})
export class CircularProgressChartComponent implements OnInit {
  id: any;
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  @Input() chartTitle: string;
  @Input() chartColors: string[];
  @Input() chartData: column[];
  @Input() patientActivity:any;

  @Input() allChartData: column[];

  circleArray: circle[] = [
    {
      vector: "M18 5 a 13 13 0 0 1 0 26 a 13 13 0 0 1 0 -26",
      circumferance: 80.4,
    },
      
    {
      vector: "M18 7 a 11 11 0 0 1 0 22 a 11 11 0 0 1 0 -22",
      circumferance: 68,
    },
  ];

  dashArray: Array<number[]>;
  totalValue: number;
  appointmentId: any;
  opinion_id: any;
  target_count_micro: any;
  micros_sum: any;
  macros_sum: any;
  target_count_macro: any;

  constructor(
    private httpService: APIService,
    private _activatedRoute: ActivatedRoute
  ) {
    this.chartOptions = {
      series: [],

      chart: {
        height: 300,
        type: "radialBar",
        
      },

      plotOptions: {
        radialBar: {
          offsetX: 5,
          offsetY: 5,
          hollow: {
            margin: 5,
            size: "15%",
            background: "transparent",
          },
          track: {
            show: true,
            startAngle: undefined,
            endAngle: undefined,
            background: "#2B3236",
            strokeWidth: "97%",
            opacity: 1,
            margin: 25,
            dropShadow: {
              enabled: false,
              top: 0,
              left: 0,
              blur: 3,
              opacity: 0.5,
            },
          },

          dataLabels: {
            name: {
              fontSize: "22px",
            },
            value: {
              color: "#fff",
              fontSize: "16px",
            },
          },
        },
      },
      colors: ["#ff8a49", "#397EF5"],
      stroke: {
        lineCap: "round"
      },
      labels: ["Macro", "Micro"],
    };
  }

  ngOnInit() {
   

    this._activatedRoute.queryParams.subscribe((params) => {
      this.id = params["id"];
      this.appointmentId = params["appointment"];
      this.opinion_id = params["opinion_id"];
      this.getNutritionData();
    });
    this.totalValue = this.getTotalValue();
    this.dashArray = this.getStrokeDashArray();
    console.log(this.dashArray);
    console.log(this.allChartData);
  }

  getStrokeDashArray(): Array<number[]> {
    let result: Array<number[]> = [];
    for (let i = 0; i < this.chartData.length; i++) {
      //let percent = Math.round((this.chartData[i].Value / this.allChartData[i].Value) * 100);
      let percent = Math.floor(
        (this.chartData[i].Value / this.allChartData[i].Value) * 100
      );
      this.chartData[i].percentage = percent;
      let percentageValue = (percent * this.circleArray[i].circumferance) / 100;
      let resultArray = [percentageValue, this.circleArray[i].circumferance];
      result.push(resultArray);
    }
    console.log(result);
    return result;
  }

  getTotalValue(): number {
    let result = 0;
    for (let i = 0; i < this.chartData.length; i++) {
      result = result + this.chartData[i].Value;
    }
    return result;
  }
  getNutritionData() {
    let date = moment().format("YYYY-MM-DD");
    this.httpService
      .getAll(
        `api/PatientRegistration/GetMicroMacroNutrients?patientid=${this.id}&trackon=${date}`
      )
      .subscribe((res: any) => {
        if (res.data) {
          console.log(res.data);
          this.macros_sum = res.data.macros_sum;
          this.micros_sum = res.data.micros_sum;
          this.target_count_macro = res.data.target_count_macro;
          this.target_count_micro = res.data.target_count_micro;
          // console.log(this.patientActivity.daily_macros);
          // console.log(this.patientActivity.daily_micros);
          let macro_percentage;
          let micro_percentage
         
          macro_percentage = Math.round((this.macros_sum / this.target_count_macro) * 100);
          micro_percentage = Math.round((this.micros_sum / this.target_count_micro) * 100);

          // if(this.patientActivity.daily_macros && this.patientActivity.daily_micros)
          //   this.chartOptions.series = [macro_percentage, micro_percentage];
          // if(this.patientActivity.daily_macros && !this.patientActivity.daily_micros)
          //   this.chartOptions.series = [macro_percentage];
          // else if(!this.patientActivity.daily_macros && this.patientActivity.daily_micros)
          //   this.chartOptions.series = [micro_percentage];
          // else 
          this.chartOptions.series = [macro_percentage, micro_percentage];

        }
      });
  }
}

export class column {
  Name: string;
  Value: number;
  percentage?: number;
}

export class circle {
  vector: string;
  circumferance: number;
}
