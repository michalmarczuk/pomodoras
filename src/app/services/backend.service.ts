import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { catchError, exhaustMap, take, tap } from "rxjs/operators";
import { BehaviorSubject, Subject, throwError } from "rxjs";
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
        this.httpClient.put(`${this.apiURL}/pomodoroTimer/${CurrentId}.json`, data)
            .subscribe(response => console.log(response));
    }

    // async removeCurrent(id: any) {
    //     this.httpClient.delete(`https://pomodoras-4403d-default-rtdb.europe-west1.firebasedatabase.app/current/current/${id}`)
    //         .subscribe(response => console.log(response));
    // }

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
        const currentUserPomodoroTimer = usersSettings.find(o => o.user === this.user.value?.email);

        return currentUserPomodoroTimer as settingsResponse;
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
            console.log(user);

            localStorage.setItem('userData', JSON.stringify(user));
            this.user.next(user);
            // this.autoLogout(+resData.expiresIn * 1000);
            this.refreshToken(+resData.expiresIn * 1000 / 2);
        }));
    }

    autoLogout(expirationDuration: number) {
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

    // private fireBaseResponseToPomodoroTimer(response: any) {
    //     const id = Object.keys(response)[0];

    //     return {
    //         id,
    //         ...response[id as keyof Object]
    //     } as currentResponse;
    // }

    private fireBaseResponseToArrayOfCurrentResponse(response: any) {
        return Object.keys(response).map(id => {
            return {
                id,
                ...response[id as keyof Object]
            };
        });
    }
}