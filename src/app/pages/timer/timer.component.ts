import { Component, OnDestroy, OnInit } from '@angular/core';
import { BackendService } from 'src/app/services/backend.service';
import { Subscription, timer, interval } from 'rxjs';
import { map, take, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {
  circleMax = 283;
  circleCurrent = 0;
  timerMax = 25;
  timerCurrent = 25;
  counting = false;
  private user = this.backendService.user;
  private pomodoroTimer!: Subscription;

  constructor(private backendService: BackendService) { }

  async ngOnInit(): Promise<void> {
    let current = await this.backendService.getPomodoroTimer();
    if (!!!current) {
      current = await this.backendService.createPomodoroTimer();
    }

    if (this.isToday(current.date)) {
      if (current.state === 'start') {
        const timeDiff = this.getDiffFromNowToGivenDateInSeconds(new Date(JSON.parse(current.date)));
        if (timeDiff > this.timerMax) {
          this.onSendCurrentState('stop');
          this.addPomodoro();
        } else {
          this.startTimer(this.timerCurrent - timeDiff);
          this.counting = true;
        }
      }
  
      if (current.state === 'pause') {
        this.timerCurrent = current.timerCount;
        this.circleCurrent = this.circleMax - ((this.circleMax / this.timerMax) * this.timerCurrent);
      }
    }
  }

  async ngOnDestroy(): Promise<void> {
    if (this.pomodoroTimer) {
      this.pomodoroTimer.unsubscribe();
    }   
  }

  onSendCurrentState(state: string) {
    this.backendService.updatePomodoroTimer({
      date: JSON.stringify(new Date()),
      timerCount: this.timerCurrent,
      state,
      user: this.user.value?.email,
    })
  }

  onClickStopPomodoroTimer() {
    if (this.pomodoroTimer) {
      this.pomodoroTimer.unsubscribe();
    }

    this.resetTimer();
    this.onSendCurrentState('stop');
  }

  async onClickStartPausePomodoroTimer() {
    const current = await this.backendService.getPomodoroTimer();
    if (current.state === 'start') {
      this.onSendCurrentState('pause');
      this.pomodoroTimer.unsubscribe();
      this.counting = false;
    } else {
      this.onSendCurrentState('start');
      if (this.timerCurrent === 0) this.timerCurrent = this.timerMax;
      this.startTimer(this.timerCurrent);
      this.counting = true;
    }
  }

  private startTimer(seconds: number) {
    //timer(delay, interval)
    //map - i on iterations => 1, 2, 3, ...
    //take - take number of elements
    this.pomodoroTimer = timer(0, 1000)
      .pipe(map((i) => seconds - i))
      .pipe(take(seconds + 1))
      .pipe(finalize(async () => {
        if (this.timerCurrent === 0) {
          this.resetTimer();
          this.onSendCurrentState('stop');
          this.addPomodoro();
        }
      }))
      .subscribe((x) => { 
        this.circleCurrent = this.circleMax - ((this.circleMax / this.timerMax) * x);
        this.timerCurrent = x;
    });
  }

  private resetTimer() {
    this.timerCurrent = this.timerMax;
    this.circleCurrent = 0;
    this.counting = false;
  }

  private isToday(dateString: string) {
    const date = new Date(JSON.parse(dateString));
    const today = new Date();

    return date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear();
  }

  private getDiffFromNowToGivenDateInSeconds(date: Date) {
    return Math.round((new Date().getTime() - date.getTime()) / 1000);
  }

  private addPomodoro() {
    console.log('Pomodoro!!!!!!!');
  }
}
