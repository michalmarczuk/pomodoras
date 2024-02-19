import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { BackendService } from 'src/app/services/backend.service';
import dayjs, { Dayjs } from "dayjs";
Chart.register(...registerables);

interface dayOnChart {
  toDo: number,
  done: number,
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private chart!: Chart;

  constructor(private backendService: BackendService) { }

  async ngOnInit(): Promise<void> {
    this.chart = await this.initChart();
  }

  public async updateChartDay() {
    const days: dayOnChart[] = await this.getDaysData(this.getLastNDays(5));
    this.updateChartData(days);

    this.chart.data.labels = this.getDaysLabels();
    this.chart.update();

    this.setYAxisMax(9);
  }

  public async updateChartWeek() {
    const days: dayOnChart[] = await this.getWeeksData(this.getLastNWeeks(5));

    this.updateChartData(days);
    this.chart.data.labels= this.getWeeksLabels();
    this.chart.update();

    this.setYAxisMax(60);
  }

  public async updateChartMonth() {
    const days: dayOnChart[] = await this.getMonthsData(this.getLastNMonths(5));

    this.updateChartData(days);
    this.chart.data.labels= this.getMonthsLabels();
    this.chart.update();

    this.setYAxisMax(260);
  }

  private updateChartData(data: dayOnChart[]) {
    const doneDataset = this.chart.data.datasets[0];
    const toDoDataset = this.chart.data.datasets[1];

    doneDataset.data = data.map(d => d.done);
    toDoDataset.data = data.map(d => d.toDo);
    
    this.chart.update();
  }

  private async initChart(): Promise<Chart> {
    const days: dayOnChart[] = await this.getDaysData(this.getLastNDays(5));

    const chart: Chart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: this.getDaysLabels(),
        datasets: [
          {
            label: 'Done',
            data: days.map(d => d.done),
            backgroundColor: '#4CA34A',
            hoverBackgroundColor: '#4CA34A99',
            borderColor: "#000",
            borderWidth: 1,
            borderRadius: 10,
          },
          {
            label: 'To Do',
            data: days.map(d => d.toDo),
            backgroundColor: '#FF5555',
            hoverBackgroundColor: '#FF555599',
            borderColor: "#000",
            borderWidth: 1,
            borderRadius: 10,
          }]
      }
    });

    chart.options = this.getOptions();
    chart.update();

    return chart;
  }

  private getOptions() {
    return {
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: '#000',
            font: {
              size: 18
            }
          }
        },
        y: {
          stacked: true,
          max: 9,
          ticks: {
            color: '#000',
            font: {
              size: 18
            }
          },
          afterFit(scale: any) {
            scale.width = 45;
          }
        }
      },
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: '#000',
            // padding: 10,
            font: {
              size: 16
            }
          }
        },
      }
    }
  }

  private setYAxisMax(max: number) {
    const options = this.getOptions();
    options.scales.y.max = max;
    this.chart.options = options;
    this.chart.update();
  }

  private getLastNDays(n: number): Dayjs[] {
    return Array.from({ length: n }, (_, i) => dayjs().subtract(Math.abs(i - 4), 'day'));
  }

  private getLastNWeeks(n: number): Dayjs[][] {
    const weeksArray = []
    
    //"TypeError: Cannot read property '1' of undefined" when changing week start => dayjs.locale('settings', { weekStart: 1 })
    const currentWeek = dayjs().startOf('week').add(1, 'day');

    for (let i = 0; i < n; i++) {
      const week = currentWeek.subtract(7 * i, 'day');
      weeksArray.push(Array.from({ length: 7 }, (_, j) => week.add(j, 'day')));
    }

    return weeksArray;
  }

  private getLastNMonths(n: number): Dayjs[] {
    return Array.from({ length: n }, (_, i) => dayjs().subtract(Math.abs(i - 4), 'month'));
  }

  private getDaysLabels(): string[] {
    return this.getLastNDays(5).map(d => dayjs(d).format('dddd, DD MMM'));
  }

  private getWeeksLabels(): string[] {
    return this.getLastNWeeks(5).map(w => [w[0].format('DD MMM'), w[6].format('DD MMM')].join(' - ')).reverse();
  }

  private getMonthsLabels(): string[] {
    return this.getLastNMonths(5).map(d => dayjs(d).format('YYYY MMMM'));
  }

  private async getDaysData(days: Dayjs[]): Promise<dayOnChart[]> {
    const datesFormated = days.map(day => day.format('YYYY-MM-DD'));

    const data: dayOnChart[] = []
    const history = await this.backendService.getHistory();
    const pomodorosToDo = (await this.backendService.getSettings()).pomodorosToDo;

    for (let date of datesFormated) {
      const foundDate = history.days.find(day => day.date === date);

      if (foundDate) {
        data.push({
          toDo: foundDate.pomodorosToDo,
          done: foundDate.pomodorosDone,
        })
      } else {
        data.push({
          toDo: pomodorosToDo,
          done: 0,
        })
      }
    }

    return data as dayOnChart[];
  }

  private async getWeeksData(weeks: Dayjs[][]): Promise<dayOnChart[]> {
    const weeksFormated = weeks.map(week => week.map(day => day.format('YYYY-MM-DD')));
    
    const data: dayOnChart[] = []
    const history = await this.backendService.getHistory();
    const pomodorosToDo = (await this.backendService.getSettings()).pomodorosToDo;

    for (let week of weeksFormated) {
      let toDo = 0;
      let done = 0;

      for (let date of week) {
        const foundDate = history.days.find(day => day.date === date);
  
        if (foundDate) {
          toDo += foundDate.pomodorosToDo;
          done += foundDate.pomodorosDone;
        } else {
          toDo += pomodorosToDo;
        }
      }

      data.push({
        toDo,
        done
      });
    }

    return data.reverse() as dayOnChart[];
  }

  private async getMonthsData(months: Dayjs[]): Promise<dayOnChart[]> {
    const data: dayOnChart[] = []
    const history = await this.backendService.getHistory();
    const pomodorosToDo = (await this.backendService.getSettings()).pomodorosToDo;

    for (let month of months) {
      const filteredDays = history.days.filter(d => dayjs(d.date).get('month') === month.get('month'))

      const monthData = filteredDays.reduce((day1, day2) => {
        return {
          toDo: day2.pomodorosToDo + day1.toDo,
          done: day2.pomodorosDone + day1.done
        }
      }, 
      {
        toDo: 0,
        done: 0
      });

      const emptyDaysInMonth = month.daysInMonth() - filteredDays.length;
      monthData.toDo = monthData.toDo + emptyDaysInMonth * (await this.backendService.getSettings()).pomodorosToDo;

      data.push(monthData);
    }

    return data;
  }
}
