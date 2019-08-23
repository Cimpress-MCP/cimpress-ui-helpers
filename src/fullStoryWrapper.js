import {isLocalhost} from './utils.js';

let _initialized = false;
let _reportingUsersBlacklist = [];

/**
   * @param {Object} fsSettings {
   *    @property {string} host
   *    @property {string} org
   *    @property {string} namespace
   * }
   * @param {Object} profile {
   *    @property {string} user_id
   *    @property {string} name
   *    @property {string} email
   * }
   * @param {array} reportingUsersBlacklist
   */
const initFS = (fsSettings, profile, reportingUsersBlacklist) => {
    if (_initialized) {
        console.warn('FullStory already initialized.');
        return;
    }
    _initialized = true;

    if (Array.isArray(reportingUsersBlacklist)) {
        _reportingUsersBlacklist = reportingUsersBlacklist;
    }

    window['_fs_debug'] = false;
    window['_fs_host'] = fsSettings.host || 'fullstory.com';
    window['_fs_org'] = fsSettings.org;
    window['_fs_namespace'] = fsSettings.namespace || 'FS';

    defaultFSFunction(window, document, window['_fs_namespace'], 'script', 'user');
    updateProfile(profile);
};

/**
   * @param {Object} profile {
   *    @property {string} user_id
   *    @property {string} name
   *    @property {string} email
   * }
   */
const updateProfile = (profile) => {
    if (!_initialized) {
        console.error('FullStory not initialized.');
        return;
    }

    if (isLocalhost() || (profile && _reportingUsersBlacklist.includes(profile.user_id))) {
        return;
    }

    window['_fs_ready'] = () => {
        window.FS.identify(profile.user_id, {
            displayName: profile.name,
            email: profile.email,
        });
    };
};


const defaultFSFunction = (m, n, e, t, l, o, g, y) => {
    /* eslint-disable */
    if (e in m) { if (m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].'); } return; }
    g = m[e] = function (a, b, s) { g.q ? g.q.push([a, b, s]) : g._api(a, b, s); }; g.q = [];
    o = n.createElement(t); o.async = 1; o.crossOrigin = 'anonymous'; o.src = 'https://' + window._fs_host + '/s/fs.js';
    y = n.getElementsByTagName(t)[0]; y.parentNode.insertBefore(o, y);
    g.identify = function (i, v, s) { g(l, { uid: i }, s); if (v) { g(l, v, s); } }; g.setUserVars = function (v, s) { g(l, v, s); }; g.event = function (i, v, s) { g('event', { n: i, p: v }, s); };
    g.shutdown = function () { g('rec', !1); }; g.restart = function () { g('rec', !0); };
    g.consent = function (a) { g('consent', !arguments.length || a); };
    g.identifyAccount = function (i, v) { o = 'account'; v = v || {}; v.acctId = i; g(o, v); };
    g.clearUserCookie = function () { /* */ };
    /* eslint-enable */
};

export {
    initFS,
    updateProfile,
};
