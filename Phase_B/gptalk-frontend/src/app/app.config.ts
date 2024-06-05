import { ApplicationConfig } from '@angular/core';
import { ErrorHandler, importProvidersFrom } from '@angular/core';
import {
	provideRouter,
	withComponentInputBinding,
	withEnabledBlockingInitialNavigation,
	withHashLocation,
	withInMemoryScrolling,
} from '@angular/router';
import {
	HTTP_INTERCEPTORS,
	provideHttpClient,
	withFetch,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import routes from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { NgPipesModule } from 'ngx-pipes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { GlobalErrorHandler } from './core/interceptors/global-error.interceptor';

export const appConfig: ApplicationConfig = {
	providers: [
		provideRouter(
			routes,
			withEnabledBlockingInitialNavigation(),
			withComponentInputBinding(),
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }),
			withHashLocation(),
		),
		provideHttpClient(withInterceptorsFromDi(), withFetch()),
		// animations
		provideAnimations(),
		// ngx-toastr
		provideToastr({
			closeButton: true,
			progressBar: true,
			positionClass: 'toast-bottom-right',
		}),
		// ngx-pipes
		importProvidersFrom(NgPipesModule),
		// interceptors
		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		{ provide: ErrorHandler, useClass: GlobalErrorHandler },
	],
};
