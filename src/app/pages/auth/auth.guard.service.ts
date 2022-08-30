import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { BackendService } from "src/app/services/backend.service";
import { catchError, exhaustMap, take, tap, map } from "rxjs/operators";

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private backendService: BackendService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        return this.backendService.user.pipe(
            take(1),
            map(user => {
                const isLoggedIn: boolean = !!user;
                const path: string|undefined = route.routeConfig?.path;

                if (!isLoggedIn && path && path.length > 0) {
                    return this.router.createUrlTree(['/']);
                } else if (isLoggedIn && path === '') {
                    return this.router.createUrlTree(['timer']);
                }

                return true;
            })
        );
    }
}