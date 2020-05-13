import { isLocalhost } from './utils.js';
import defaultFSFunction from './defaultFSFunction';

class FSWrapper {
  constructor (params) {
    const validParams = ['host', 'org', 'namespace', 'debug', 'allowLocalhost'];
    Object.keys(params)
      .forEach(p => {
        if (!validParams.includes(p)) {
          console.error(`Invalid param ${p} passed to FSWrapper`);
        }
      });
    const { host, org, namespace, debug, allowLocalhost } = params;
    this.host = host || 'fullstory.com';
    this.org = org;
    this.namespace = namespace || 'FS';
    this.debug = debug || false;
    this.allowLocalhost = allowLocalhost || false;
  }

  _initFs () {
    window._fs_host = this.host;
    window._fs_org = this.org;
    window._fs_debug = this.debug;

    defaultFSFunction(window, document, this.namespace, 'script', 'user');
  }

  _warn (msg) {
    if (this.debug) {
      console.warn(msg);
    }
  }

  _isActiveOrg () {
    const activeOrg = FSWrapper.getActiveOrg();
    if (activeOrg && activeOrg !== this.org) {
      this._warn(`FullStory is already recording for a different organization ${activeOrg}. The sessions for org ${this.org} will not be recorded.`);
      return false;
    }

    return true;
  }

  /**
   * @param {Object} profile {
   *    @property {string} user_id
   *    @property {string} email
   * }
  */
  async tryIdentifySession (profile, reportingUsersBlacklist) {
    const sProfile = profile || {};
    if (!sProfile.user_id) {
      this._warn('Profile or user id are missing.');
    }

    if (reportingUsersBlacklist && reportingUsersBlacklist.includes(sProfile.user_id)) {
      this._warn('This session will be ignored by FullStory because the current user is blacklisted.');
      return false;
    }

    if (!this.allowLocalhost && isLocalhost()) {
      this._warn('This session will be ignored by FullStory because it is a local session.');
      return false;
    }

    if (!this._isActiveOrg()) { return false; }

    const activeOrg = FSWrapper.getActiveOrg();
    if (!activeOrg) { this._initFs(); }

    return this._setIdentity(sProfile);
  }

  splitSession () {
    if (!this._isActiveOrg) { return false; }

    const activeOrg = FSWrapper.getActiveOrg();
    if (!activeOrg) { return false; }

    if (window[this.namespace].identify) {
      window[this.namespace].identify(false);
    } else {
      window._fs_ready = null;
    }

    return true;
  }

  async _setIdentity (profile) {
    if (!this._isActiveOrg()) { return false; }

    if (window[this.namespace].identify) {
      window[this.namespace].identify(profile.user_id, {
        displayName: profile.name,
        email: profile.email
      });

      return true;
    } else {
      return new Promise(resolve => {
        window._fs_ready = () => {
          if (!this._isActiveOrg()) { resolve(false); return; }

          window[this.namespace].identify(profile.user_id, {
            displayName: profile.name,
            email: profile.email
          });

          resolve(true);
        };
      });
    }
  }
}

FSWrapper.getActiveOrg = () => window._fs_org;

export default FSWrapper;
