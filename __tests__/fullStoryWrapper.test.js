const assert = require('assert');

const FSWrapper = require('../src/index').FSWrapper.default;
const { mockFSFunction } = require('./src/fullStorySimulator');
jest.mock('../src/defaultFSFunction', () => (...args) => mockFSFunction(...args));

const FS_SETTINGS = {
  org: 'my_org',
  namespace: 'my_namespace',
  allowLocalhost: true
};

describe('FSWrapper', () => {
  afterEach(() => {
    delete window[FS_SETTINGS.namespace];
    delete window._fs_org;
    delete window._fs_host;
    delete window._fs_namespace;
    delete window._fs_debug;
  });
  describe('for tryIdentifySession', () => {
    test('returns false if profile is null', async () => {
      const wrapper = new FSWrapper(FS_SETTINGS);
      const profile = null;

      const result = await wrapper.tryIdentifySession(profile);
      assert(!result);
    });

    test('returns false if user is blacklisted', async () => {
      const wrapper = new FSWrapper(FS_SETTINGS);
      const profile = { user_id: 'john@example.com' };
      const blacklist = ['john@example.com'];

      const result = await wrapper.tryIdentifySession(profile, blacklist);
      assert(!result);
    });

    test('returns false if running on localhost', async () => {
      const wrapper = new FSWrapper(Object.assign({}, FS_SETTINGS, { allowLocalhost: false }));
      const profile = { user_id: 'john@example.com' };

      const result = await wrapper.tryIdentifySession(profile);
      assert(!result);
    });

    test('returns false if FullStory is already running for a different org', async () => {
      window._fs_org = `not_${FS_SETTINGS.org}`;

      const wrapper = new FSWrapper(FS_SETTINGS);
      const profile = { user_id: 'john@example.com' };

      const result = await wrapper.tryIdentifySession(profile);
      assert(!result);
    });

    test('initializes FullStory if not yet initialized', async () => {
      const wrapper = new FSWrapper(FS_SETTINGS);
      const profile = { user_id: 'john@example.com' };

      const result = await wrapper.tryIdentifySession(profile);
      assert(result);

      assert(window[FS_SETTINGS.namespace]);
    });

    test('identifies session', async () => {
      const wrapper = new FSWrapper(FS_SETTINGS);
      const profile = { user_id: 'john@example.com' };

      const result = await wrapper.tryIdentifySession(profile);
      assert(result);

      assert(window[FS_SETTINGS.namespace].isIdentifiedSession);
      assert.strictEqual(window[FS_SETTINGS.namespace].sessionNumber, 0);
    });
  });

  describe('for splitSession', () => {
    test('splits anonymous session', async () => {
      const wrapper = new FSWrapper(FS_SETTINGS);
      const profile = { user_id: 'john@example.com' };

      const result = await wrapper.tryIdentifySession(profile);
      assert(result);

      assert(window[FS_SETTINGS.namespace].isIdentifiedSession);
      assert.strictEqual(window[FS_SETTINGS.namespace].sessionNumber, 0);

      wrapper.splitSession();
      assert(window[FS_SETTINGS.namespace].isAnonymousSession);
      assert.strictEqual(window[FS_SETTINGS.namespace].sessionNumber, 1);
    });
  });
});
