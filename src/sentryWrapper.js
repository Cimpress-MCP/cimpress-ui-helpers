import * as Sentry from '@sentry/browser';
import {isLocalhost} from './utils.js';

let initialized = false;

/**
 * @param {*} sentrySettings {
 *    @param {*} user_id
 *    @param {*} dsn
 *    @param {*} packageInfoPath
 * }
 * @param {*} fsSettings {
 *    @param {*} host
 *    @param {*} org
 *    @param {*} namespace
 *    @param {*} reportLocalhost
 * }
 * @param {*} reportingBlacklist
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
    const packageInfo = require(sentrySettings.packageInfoPath || '../package.json');

    Sentry.init({
        dsn: sentrySettings.dsn,
        release: packageInfo.version,
        attachStacktrace: true,
        debug: true,
    });

    Sentry.configureScope((scope) => {
        scope.setLevel(sentrySettings.scope || 'warning');
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
};
