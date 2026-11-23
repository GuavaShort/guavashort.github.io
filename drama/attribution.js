(function (window, document) {
  if (window.AdAttribution) return;

  var landing = null;
  var sdkUrl = 'https://connect.facebook.net/en_US/fbevents.js';

  function readCookie(name) {
    var prefix = name + '=';
    var item = document.cookie
      .split(';')
      .map(function (value) {
        return value.trim();
      })
      .find(function (value) {
        return value.indexOf(prefix) === 0;
      });
    return item ? item.slice(prefix.length) : '';
  }

  function initializePixel(id) {
    if (!window.fbq) {
      var fbq = function () {
        if (fbq.callMethod) {
          fbq.callMethod.apply(fbq, arguments);
        } else {
          fbq.queue.push(Array.prototype.slice.call(arguments));
        }
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      window.fbq = fbq;
    }
    if (!window._fbq) window._fbq = window.fbq;

    if (!document.querySelector('script[src="' + sdkUrl + '"]')) {
      var script = document.createElement('script');
      script.async = true;
      script.src = sdkUrl;
      document.head.appendChild(script);
    }

    window.fbq('init', id);
  }

  function buildAdjustParams(entryQuery, timestamp, extraParams) {
    var query = new URLSearchParams(entryQuery);
    var params = new URLSearchParams();
    var ua = window.navigator.userAgent || '';
    var fbclid = query.get('fbclid') || '';
    var fbp = readCookie('_fbp');
    var fbc = readCookie('_fbc');

    if (!fbc && fbclid) {
      fbc = 'fb.1.' + timestamp + '.' + fbclid;
    }

    function set(name, value) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(name, String(value));
      }
    }

    set('campaign', query.get('c') || query.get('campaign'));
    set('adgroup', query.get('adset') || query.get('adgroup'));
    set('creative', query.get('ad') || query.get('creative'));
    set('fbclid', fbclid);

    if (/android/i.test(ua)) set('os_name', 'android');
    else if (/iPhone|iPad|iPod/i.test(ua)) set('os_name', 'ios');

    // 同一标识写入多个接收字段，接收方按约定使用。
    set('adj_sub1', fbp);
    set('fbpid', fbp);
    set('dc_fbp', fbp);
    set('adj_sub2', fbc);
    set('dc_fbc', fbc);
    set('adj_sub4', ua);
    set('dc_ua', ua);

    Object.keys(extraParams || {}).forEach(function (key) {
      set(key, extraParams[key]);
    });
    return params;
  }

  function getAdjustClickUrl(playUrl) {
    if (!landing || !landing.token) return null;
    var url = new URL('https://app.adjust.com/' + encodeURIComponent(landing.token));
    var params = buildAdjustParams(landing.entryQuery, landing.timestamp, landing.extraParams);
    if (playUrl) params.set('redirect_android', playUrl);
    url.search = params.toString();
    return url.href;
  }

  function init(options) {
    if (landing) return;
    options = options || {};
    var id = String(options.pixelId || '').trim();
    var token = String(options.adjustToken || '').trim();
    if (!id) {
      throw new Error('请填写 pixelId。');
    }

    var entryQuery = window.location.search;
    var timestamp = Date.now();
    initializePixel(id);
    window.fbq('track', 'PageView');
    window.fbq('track', 'ViewContent');
    landing = {
      token: token,
      entryQuery: entryQuery,
      timestamp: timestamp,
      extraParams: Object.assign({}, options.extraParams || {}),
    };
  }

  function track(eventName, eventParams) {
    if (!landing) {
      throw new Error('请先调用 AdAttribution.init()。');
    }
    window.fbq('trackCustom', eventName, eventParams || {});
  }

  window.AdAttribution = { init: init, track: track, getAdjustClickUrl: getAdjustClickUrl };
})(window, document);
