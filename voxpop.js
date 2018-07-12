/*!
 * VoxPop JS Embed Script
 * Saves audio messages
 * 
 * Example Usage:
 *
  <blockquote class="voxpop-embed" data-target="./voxpop.html" * data-conversation-id="2">
    <p>
      Thoughts? Leave a voicemail at this number: <a href="tel:8888888888">(888) 888-8888</a>
    </p>
  </blockquote>
  <script async src="voxpop.js"></script>
 *
 */

const win = window;
const APP = win.VOXPOP || {
  name: 'voxpop',
  hasAttached: false,
  frames: {},
  origin: null
};

function canPostMessage() {
  return !!win.postMessage;
}

function receiveMessage(event) {
  if (event.origin === APP.origin && event.data) {
    APP.frames[event.data.id].setAttribute('height', event.data.height);
  }
}

function setFrameHeight() {
  const frame = this;
  if (frame && frame.contentWindow) {
    frame.contentWindow.postMessage('autoHeight', APP.origin);
  }
}

function setFrameHeights() {
  const frames = APP.frames;
  Object.keys(frames).forEach((key) => {
    frames[key].contentWindow.postMessage('autoHeight', APP.origin);
  });
}

function limit(func, wait, debounce) {
  let timeout;
  return function () {
    function throttler() {
      timeout = undefined;
      func.call(this);
    }
    if (debounce) {
      clearTimeout(timeout);
    }
    if (debounce || !timeout) {
      timeout = setTimeout(throttler, wait);
    }
  };
}

function throttle(func, wait) {
  return limit(func, wait, false);
}

(function (doc) {
  const elemClass = `${APP.name}-embed`;
  const elem = doc.getElementsByClassName(elemClass)[0];
  const parent = elem.parentNode;
  let srcLink;
  let frame;
  let id;

  if (elem) {
    id = elem.attributes['data-conversation-id'].value;
    frame = doc.createElement('iframe');
    frame.src = elem.attributes['data-target'].value;
    frame.id = `${APP.name}-${id}`;
    frame.setAttribute('allowTransparency', true);
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('height', 0);
    frame.setAttribute('width', '100%');
    frame.style.minWidth = '320px';
    frame.setAttribute('frameBorder', 0);
    parent.insertBefore(frame, elem);
    parent.removeChild(elem);
    APP.frames[id] = frame;

    if (canPostMessage()) {
      if (!APP.hasAttached) {
        srcLink = doc.createElement('A');
        srcLink.setAttribute('href', frame.src);
        if (srcLink.port !== "") {
          // Adds port for local testing, remove in production
          APP.origin = `${srcLink.protocol}//${srcLink.hostname}:${srcLink.port}`;
        } else {
          APP.origin = `${srcLink.protocol}//${srcLink.hostname}`;
        }
        win.addEventListener('message', receiveMessage, false);
        win.addEventListener('resize', throttle(setFrameHeights, 100), false);
        APP.hasAttached = true;
      }
      frame.onload = setFrameHeight;
    } else {
      // Old browser, default to content overflow scroll
      frame.setAttribute('scrolling', 'yes');
      frame.setAttribute('height', 'auto');
    }
    win.VOXPOP = APP;
  }
}(document));


