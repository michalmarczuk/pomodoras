import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BackendService } from "src/app/services/backend.service";
import { catchError, exhaustMap, take, tap } from "rxjs/operators";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
    constructor(private backendService: BackendService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return this.backendService.user.pipe(take(1), exhaustMap(user => {
            if (user) {
                const modifiedReq = req.clone({ params: new HttpParams().set('auth', user.token!) });
                return next.handle(modifiedReq);
            }

            return next.handle(req);
        }))
    }

}