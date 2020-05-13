import * as Sentry from '@sentry/browser';
import { isLocalhost } from './utils.js';

let initialized = false;

/**
 * @param {*} sentrySettings {
 *    @param {*} dsn
 *    @param {*} releaseVersion
 *    @param {*} scope
 * }
 */

const initSentry = (params) => {
  const validParams = [ 'dsn', 'releaseVersion', 'scope']
  const { dsn, releaseVersion, scope } = params;
  Object.keys(params)
    .forEach(p => {
      if (!validParams.includes(p)) {
        console.error(`Invalid param ${p} passed to SentryWrapper`);
      }
    })

  if (initialized) {
    console.warn('Sentry already initialized.');
    return;
  }
  initialized = true;

  if (isLocalhost()) {
    return;
  }
  Sentry.init({
    dsn: dsn,
    release: releaseVersion,
    attachStacktrace: true,
    debug: true
  });

  Sentry.configureScope((s) => {
    s.setLevel(scope || 'warning');
  });
};

/**
   * @param {Object} profile {
   *    @property {string} user_id
   *    @property {string} name
   *    @property {string} email
   * }
*/
const updateProfile = (profile) => {
  const prof = profile || {};
  if (!initialized) {
    console.error('Sentry not initialized.');
    return;
  }

  if (isLocalhost()) {
    return;
  }

  Sentry.configureScope((scope) => {
    scope.setUser({ email: prof.email || prof.user_id });
  });
};

const reportError = (error, errorInfo) => {
  if (!initialized) {
    console.error('Sentry is not initialized. Not reporting the error.');
    return;
  }

  if (!isLocalhost()) {
    Sentry.withScope((scope) => {
      Object
        .keys(errorInfo || {})
        .forEach((key) => {
          scope.setExtra(key, errorInfo[key]);
        });
      Sentry.captureException(error);
    });
  } else {
    console.error(error, errorInfo);
  }
};

export {
  initSentry,
  reportError,
  updateProfile
};
