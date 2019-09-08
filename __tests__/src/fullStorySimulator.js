class FSMock {
  constructor () {
    this.sessionNumber = 0;
    this.sessionProfile = null;

    if (window._fs_ready) {
      window._fs_ready();
    }
  }

  get isAnonymousSession () {
    return this.sessionProfile === null;
  }

  get isIdentifiedSession () {
    return this.sessionProfile !== null;
  }

  identify (profile, userVars) {
    if (profile === false) {
      this.sessionNumber++;
      this.sessionProfile = null;
      return;
    }

    if (this.isAnonymousSession && profile !== false) {
      this.sessionProfile = profile;
      return;
    }

    if (this.isIdentifiedSession && profile !== this.sessionProfile) {
      this.sessionNumber++;
      this.sessionProfile = profile;
    }
  }
}

const mockFSFunction = (_window, _document, _namespace, t, l, o, g, y) => {
  _window[_namespace] = new FSMock();
};

export {
  mockFSFunction,
  FSMock
};
