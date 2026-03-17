import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { APIService } from 'app/core/api/api';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexMarkers,
  ApexYAxis,
  ApexTheme,
  ApexTitleSubtitle,
  ApexFill,
  ApexPlotOptions,
} from "ng-apexcharts";
import * as moment from "moment";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  theme: ApexTheme;
  yaxis: ApexYAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
};
@Component({
  selector: 'app-water-logs',
  templateUrl: './water-logs.component.html',
  styleUrls: ['./water-logs.component.scss']
})
export class WaterLogsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;

  emptyChart:boolean = false;
  weekNames: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  monthNames: string[] = [];
  YearNames: string[] = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  public chartOptions: Partial<ChartOptions>;
  segmentList: any = [
    {
      name: "Day",
      value: 0,
    },
    {
      name: "Week",
      value: 1,
    },
    {
      name: "Month",
      value: 2,
    },
    {
      name: "Year",
      value: 3,
    },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<any>,
    private httpService: APIService
  ) { }

 ngOnInit(): void {
  //   this.monthNames = Array.from({ length: moment().daysInMonth() }, (x, i) =>
  //   moment().startOf("month").add(i, "days").format("DD")
  // );
  let labels = [];

  
this.monthNames = this.getMonthDayNames();

console.log(labels);
    this.getSteps()
  }

  getTypeName(id: number): string {
    let name;

    for (let i = 0; i < this.segmentList.length; i++) {
      if (this.segmentList[i].value == id) {
        name = this.segmentList[i].name;
        break;
      }
    }

    return name;
  }

  getMonthDayNames():any[] {

    const last30Days = [];

    for (let i = 29; i >= 0; i--) {
      const date = moment().subtract(i, 'days').format('DD');
      last30Days.push({
        month: moment().subtract(i, 'days').format('MM'),
        day: moment().subtract(i, 'days').format('DD')
      });
    }

    return last30Days;

  }

  setWeekdata(data: any, name: string): any {
    let obj = {};
    for (let i = 0; i < data.length; i++) {
      
      if (moment(data[i].created_on).format('DD').toLocaleLowerCase() == name.toLocaleLowerCase()) {
        obj = data[i];
        break;
      }
    }

    return obj;
  }

  setMonthData(data: any, month: any): any {
    let obj = {};
  


    for (let i = 0; i < data.length; i++) {
      if (moment(data[i].created_on).format('DD') == month.day && moment(data[i].created_on).format('MM').toLocaleLowerCase() == month.month) {
        obj = data[i];
        break;
      }
    }

    return obj;
  }

  getSteps() {
    let type = 2;
    const url = `api/Patient/GetPatientDrinkingWaterinfo_last30days?patientId=${this.data.userId}`;
    this.httpService
      .getAll(url)
      .subscribe((res: any) => {
        if (res.data) {
          let data: any = [];

          if (type == 1) {
            this.weekNames.forEach((weekDataObj) => {
              let weekobj = this.setWeekdata(res.data, weekDataObj);
              if (weekobj.created_on) {
                data.push({
                  x: moment(weekobj.created_on).format('DD'),
                  y: weekobj.consumed_quantity ? weekobj.consumed_quantity : null,
                });
              } else {
                data.push({
                  x: weekDataObj,
                  y: null,
                });
              }
            });
          } else if (type == 2) {
            this.monthNames.forEach((monthObj:any) => {
              let weekobj = this.setMonthData(res.data, monthObj);
              if (weekobj.created_on) {
                data.push({
                  x: moment(weekobj.created_on).format('DD'),
                  y: weekobj.consumed_quantity ? weekobj.consumed_quantity : null,
                });
              } else {
                data.push({
                  x: monthObj.day,
                  y: null,
                });
              }
            });
          } else if (type == 3) {
            this.YearNames.forEach((yearobj) => {
              let weekobj = this.setWeekdata(res.data, yearobj);
              if (weekobj.created_on) {
                data.push({
                  x: moment(weekobj.created_on).format('DD'),
                  y: weekobj.consumed_quantity ? weekobj.consumed_quantity : null,
                });
              } else {
                data.push({
                  x: yearobj,
                  y: null,
                });
              }
            });
          } else {
            res.data.forEach((dataObj) => {

              if (dataObj.consumed_quantity) {
                data.push({
                  x: moment(dataObj.created_on).format('DD'),
                  y: dataObj.consumed_quantity ? dataObj.consumed_quantity : null,
                });
              }
            });
          }

          let series = [];
          series.push({
            name: "Water",
            data: data,
          });

          console.log(series);

          this.initiateGraph(series, type);
         

        } else {

          // this.loading = false;
          this.emptyChart = true;
          this.emptyDataGraph(type);
        }

      

      });
  }

  initiateGraph(series: any, type: number) {
    const dynamicWidth = series[0].data.length * 100;
    const chartWidth = dynamicWidth < window.innerWidth ? "100%" : dynamicWidth;

    this.chartOptions = {
      series: series,
      chart: {
        type: "area",
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top",
            orientation: "vertical",
          },
          horizontal: false,
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ["#000"],
        },
        formatter: function (val, opt) {
          return val ? `${val}` : undefined;
        },
      },
      stroke: {
        curve: "straight",
      },
      fill: {
        opacity: 0.8,
        type: "pattern",
        pattern: {
          style: "horizontalLines",
          width: 5,
          height: 5,
          strokeWidth: 3,
        },
      },
      markers: {
        size: 5,
        hover: {
          size: 9,
        },
      },

      tooltip: {
        intersect: true,
        shared: false,
      },
      theme: {
        palette: "palette1",
      },
      yaxis: {
        tickAmount:5
      },
    };

    if (type == 2) {
      this.chartOptions.xaxis = {
        // min: 1,
        // max: 31,
        // tickAmount: 5,
        title: {
          text: "Last 30 Days"
        }
      };

      //  this.chartOptions.chart.width =  '100%';
    } else {
      this.chartOptions.xaxis = {};
    }
    setTimeout(() => {
      this.chart.updateOptions({});
    }, 500);

    // if(type==0) {
    //   this.chartOptions.chart.width =  chartWidth;
    // }
  }

  emptyDataGraph(type: number) {
    let data: any = [];

    if (type == 1) {
      this.weekNames.forEach((weekDataObj) => {
        data.push({
          x: weekDataObj,
          y: null,
        });
      });
    } else if (type == 2) {
      this.monthNames.forEach((monthObj:any) => {
        data.push({
          x: monthObj.day,
          y: null,
        });
      });
    } else if (type == 3) {
      this.YearNames.forEach((yearobj) => {
        data.push({
          x: yearobj,
          y: null,
        });
      });
    } else {
      data = [];
    }

    let series = [];
    series.push({
      name: "Water",
      data: data,
    });

    this.initiateGraph(series, type);
  }
}
