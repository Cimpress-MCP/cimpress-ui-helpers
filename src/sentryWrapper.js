import * as Sentry from '@sentry/browser';
import {isLocalhost} from './utils.js';

let initialized = false;

/**
 * @param {*} sentrySettings {
 *    @param {*} dsn
 *    @param {*} releaseVersion
 *    @param {*} scope
 * }
 */

const initSentry = (sentrySettings) => {
    if (initialized) {
        console.warn('Sentry already initialized.');
        return;
    }
    initialized = true;

    if (isLocalhost()) {
        return;
    }
    Sentry.init({
        dsn: sentrySettings.dsn,
        release: sentrySettings.releaseVersion,
        attachStacktrace: true,
        debug: true,
    });

    Sentry.configureScope((scope) => {
        scope.setLevel(sentrySettings.scope || 'warning');
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
    if (!initialized) {
        console.error('FullStory not initialized.');
        return;
    }

    if (isLocalhost() || !profile) {
        return;
    }

    Sentry.configureScope((scope) => {
        scope.setUser({email: profile.email || profile.user_id});
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
    updateProfile,
};
