/**
 * structuredClone is somewhat recent, thus maybe not available in all browsers.
 */
(function () {
  if (typeof structuredClone !== 'undefined') {
    return;
  }

  function structuredClone<T>(obj: T): T {
    const jsonString = JSON.stringify(obj);
    return JSON.parse(jsonString);
  }

  if (typeof window !== 'undefined') {
    window.structuredClone = structuredClone;
  } else {
    throw new Error('Could not attach structuredClone polyfill to the window object');
  }
})();
