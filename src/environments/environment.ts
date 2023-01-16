// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  NODE_API: 'http://localhost:3333',

  toastConfig: {
    positionClass: 'toast-top-center',
    preventDuplicates: true,
    enableHtml: true,
    progressBar: true,
    timeOut: 6000,
  },
};

export const TOKEN_STORAGE = 'visitante-token';
export const CRYPTO = {
  key: '202209@Çdc!',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
