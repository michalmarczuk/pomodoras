import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { BehaviorSubject, throwError } from "rxjs";
import { User } from "../pages/auth/user.model";
import { Router } from "@angular/router";

interface loginResponse {
    email: string,
    localId: string,
    idToken: string,
    expiresIn: string,
    refreshToken: string
}

interface tokenRefreshResponse {
    user_id: string,
    project_id: string,
    id_token: string,
    expires_in: string,
    refresh_token: string
}

export interface pomodoroTimerResponse {
    id: string,
    date: string,
    timerCount: number,
    state: string,
    user: string,
    pomodorosDone: number,
}

export interface settingsResponse {
    id: string,
    user: string,
    pomodorosToDo: number,
    timerMax: number,
}

export interface historyResponse {
    id: string,
    user: string,
    days: day[]
}

export interface day {
    pomodorosToDo: number,
    pomodorosDone: number,
    date: string
}
 
@Injectable()
export class BackendService {
    user = new BehaviorSubject<User|null>(null);
    private tokenExpirationTimer: any;
    private refreshTokenInterval: any;
    private apiURL = 'https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app';

    constructor(private httpClient: HttpClient, private router: Router) { }

    async createPomodoroTimer(): Promise<pomodoroTimerResponse>  {
        await this.httpClient.post(`${this.apiURL}/pomodoroTimer.json`,
        {
            user: this.user.value?.email,
            date: JSON.stringify(new Date()),
            timerCount: 0,
            state: '',
            pomodorosDone: 0,
        }).toPromise();

        return await this.getPomodoroTimer();
    }

    async getPomodoroTimer(): Promise<pomodoroTimerResponse>  {
        const response = await this.httpClient.get(`${this.apiURL}/pomodoroTimer.json`).toPromise();

        const usersPomodoroTimers = this.fireBaseResponseToArrayOfCurrentResponse(response);
        const currentUserPomodoroTimer = usersPomodoroTimers.find(o => o.user === this.user.value?.email);

        return currentUserPomodoroTimer as pomodoroTimerResponse;
    }

    async updatePomodoroTimer(data: any) {
        const CurrentId = (await this.getPomodoroTimer()).id;
        await this.httpClient.put(`${this.apiURL}/pomodoroTimer/${CurrentId}.json`, data).toPromise();
    }

    async createSettings(): Promise<settingsResponse>  {
        await this.httpClient.post(`${this.apiURL}/settings.json`,
        {
            user: this.user.value?.email,
            pomodorosToDo: 8,
            timerMax: 300
        }).toPromise();

        return await this.getSettings();
    }

    async getSettings(): Promise<settingsResponse>  {
        const response = await this.httpClient.get(`${this.apiURL}/settings.json`).toPromise();

        const usersSettings = this.fireBaseResponseToArrayOfCurrentResponse(response);
        const currentUserSettings = usersSettings.find(o => o.user === this.user.value?.email);

        return currentUserSettings as settingsResponse;
    }

    async updateHistory(): Promise<historyResponse> {
        const history = await this.getHistory();
        if (!history) return await this.initHistory();

        const pomodorosDone = (await this.getPomodoroTimer()).pomodorosDone;
        const pomodorosToDo = (await this.getSettings()).pomodorosToDo - pomodorosDone;

        let todayIndex = history.days.findIndex(day => day.date.toString() === new Date().toISOString().slice(0, 10));
        if (todayIndex === -1) todayIndex = history.days.length;
        const userID = history.id;

        const response = await this.httpClient.patch(`${this.apiURL}//history/${userID}/days/${todayIndex}.json`,
        {
            pomodorosToDo: pomodorosToDo,
            pomodorosDone: pomodorosDone,
            date: new Date().toISOString().slice(0, 10)
        }).toPromise();

        return response as historyResponse;
    }

    async getHistory(): Promise<historyResponse> {
        const response = await this.httpClient.get(`${this.apiURL}/history.json`).toPromise();
        if (response === null) return response;

        const userHistory = this.fireBaseResponseToArrayOfCurrentResponse(response);
        const currentUserHistory = userHistory.find(o => o.user === this.user.value?.email);
        if (currentUserHistory === undefined) return currentUserHistory;

        return currentUserHistory as historyResponse;
    }

    login(data: any) {
        return this.httpClient.post<loginResponse>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAY-o2Y6IHk258A-kHAY1dUJRWMh4B5dOY',
        {...data, returnSecureToken: true}).pipe(catchError(errorRes => {
            return throwError(errorRes.error.error.message);
        }), tap(resData => {
            const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
            const user = new User(
                resData.email,
                resData.localId,
                resData.idToken,
                resData.refreshToken,
                expirationDate
            );

            localStorage.setItem('userData', JSON.stringify(user));
            this.user.next(user);
            this.autoLogout(+resData.expiresIn * 1000);
            this.refreshToken(+resData.expiresIn * 1000 * 0.9);
        }));
    }

    autoLogout(expirationDuration: number) {
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }

        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    refreshToken(expirationDuration: number) {
        this.refreshTokenInterval = setInterval(() => {
            this.httpClient.post<tokenRefreshResponse>('https://securetoken.googleapis.com/v1/token?key=AIzaSyAY-o2Y6IHk258A-kHAY1dUJRWMh4B5dOY',
                {
                    grant_type: 'refresh_token',
                    refresh_token: this.user.getValue()?.refreshToken
                }).pipe(catchError(errorRes => {
                    return throwError(errorRes.error.error.message);
                }), tap(resData => {
                    const expirationDate = new Date(new Date().getTime() + +resData.expires_in * 1000);
                    const user = new User(
                        this.user.getValue()!.email,
                        resData.user_id,
                        resData.id_token,
                        resData.refresh_token,
                        expirationDate
                    );
        
                    localStorage.setItem('userData', JSON.stringify(user));
                    this.user.next(user);
                    this.autoLogout(+resData.expires_in * 1000);
                })).toPromise();
        }, expirationDuration);
    }

    logout() {
        console.log('Bye bye');
        localStorage.removeItem('userData');
        this.user.next(null);
        this.router.navigate(['/']);

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
            this.tokenExpirationTimer = null;
        }
    }

    private fireBaseResponseToArrayOfCurrentResponse(response: any) {
        return Object.keys(response).map(id => {
            return {
                id,
                ...response[id as keyof Object]
            };
        });
    }

    private async initHistory(): Promise<historyResponse> {
        const pomodorosDone = (await this.getPomodoroTimer()).pomodorosDone;
        const pomodorosToDo = (await this.getSettings()).pomodorosToDo - pomodorosDone;

        const response = await this.httpClient.post(`${this.apiURL}/history.json`,
        {
            user: this.user.value?.email,
            days: [{
                pomodorosToDo,
                pomodorosDone,
                date: new Date().toISOString().slice(0, 10)
            }]
        }).toPromise();

        return response as historyResponse;
    }
}