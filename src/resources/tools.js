// More detailed string pattern suffixes, stored by their common root.
const TRACKERS_BY_ROOT = {
  // Google's Urchin Tracking Module
  utm_: [
    "source",
    "medium",
    "term",
    "campaign",
    "content",
    "name",
    "cid",
    "reader",
    "viz_id",
    "pubreferrer",
    "swu",
  ],

  // Adobe Omniture SiteCatalyst
  IC: ["ID"],

  // Adobe Omniture SiteCatalyst
  ic: ["id"],

  // Hubspot
  _hs: ["enc", "mi"],

  // Marketo
  mkt_: ["tok"],

  // MailChimp
  // https://developer.mailchimp.com/documentation/mailchimp/guides/getting-started-with-ecommerce/
  mc_: ["cid", "eid"],

  // comScore Digital Analytix?
  // http://www.about-digitalanalytics.com/comscore-digital-analytix-url-campaign-generator
  ns_: ["source", "mchannel", "campaign", "linkname", "fee"],

  // Simple Reach
  sr_: ["share"],

  // Vero
  vero_: ["conv", "id"],

  // Non-prefixy and 1-offs
  "": [
    // Facebook Click Identifier
    // http://thisinterestsme.com/facebook-fbclid-parameter/
    "fbclid",
    // Instagram Share Identifier
    "igshid",
    "srcid",
    // Google Click Identifier
    "gclid",
    // Some other Google Click thing
    "ocid",
    // Unknown
    "ncid",
    // Unknown
    "nr_email_referer",
    // Generic-ish. Facebook, Product Hunt and others
    "ref",
    // Alibaba-family 'super position model' tracker:
    // https://github.com/newhouse/url-tracking-stripper/issues/38
    "spm",
    "si",
  ],
};

const DOMAIN_TRACKERS = {
  google: [
    "source",
    "medium",
    "term",
    "campaign",
    "content",
    "name",
    "cid",
    "reader",
    "viz_id",
    "pubreferrer",
    "swu",
    "sca_esv",
    "sca_eid",
    "gs_lp",
    "gs_lpos",
    "sca_upv",
    "sca_uid",
    "newwindow",
    "ei",
    "ved",
    "oq",
    "sclient",
    "uact",
  ],
  tiktok: [
    "u_code",
    "preview_pb",
    "_d",
    "timestamp",
    "user_id",
    "share_app_name",
    "share_iid",
    "source",
  ],
  facebook: [
    "hc_[a-z_%\\[\\]0-9]*",
    "[a-z]*ref[a-z]*",
    "__tn__",
    "eid",
    "__(?:xts|cft)__(?:\\[|%5B)\\d(?:\\]|%5D)",
    "comment_tracking",
    "dti",
    "app",
    "video_source",
    "ftentidentifier",
    "pageid",
    "padding",
    "ls_ref",
    "action_history",
    "tracking",
    "referral_code",
    "referral_story_type",
    "eav",
    "sfnsn",
    "idorvanity",
    "wtsid",
    "rdc",
    "rdr",
    "paipv",
    "_nc_x",
    "_rdr",
    "mibextid",
  ],
  reddit: [
    "%24deep_link",
    "\\$deep_link",
    "correlation_id",
    "ref_campaign",
    "ref_source",
    "%243p",
    "rdt",
    "\\$3p",
    "%24original_url",
    "\\$original_url",
    "_branch_match_id",
  ],
  bing: ["cvid", "form", "sk", "sp", "sc", "qs", "qp"],
  instagram: ["igshid", "igsh"],
  twitter: ["ref_src", "ref_url", "ref_src", "ref_url"],
  linkedin: ["trk"],
  amazon: ["ascsubtag"],
  ebay: ["_trkparms", "_trksid", "_from", "hash"],
  youtube: ["feature", "gclid", "kw", "si"],
  github: ["email_token", "email_source"],
  aliexpress: [
    "ws_ab_test",
    "btsid",
    "algo_expid",
    "algo_pvid",
    "gps-id",
    "scm[_a-z-]*",
    "cv",
    "af",
    "mall_affr",
    "sk",
    "dp",
    "terminal_id",
    "aff_request_id",
  ],
  bilibili: [
    "callback",
    "spm_id_from",
    "from_source",
    "from",
    "seid",
    "mid",
    "share_source",
    "msource",
    "refer_from",
    "share_from",
    "share_medium",
    "share_source",
    "share_plat",
    "share_tag",
    "share_session_id",
    "timestamp",
    "unique_k",
    "vd_source",
    "plat_id",
    "buvid",
    "is_story_h5",
    "up_id",
    "bbid",
    "ts",
  ],
};

const ALL_TRACKERS = Object.keys(TRACKERS_BY_ROOT).reduce((trackers, root) => {
  TRACKERS_BY_ROOT[root].forEach((suffix) => trackers.push(root + suffix));
  return trackers;
}, []);

const TRACKER_REGEXES_BY_TRACKER = ALL_TRACKERS.reduce((memo, tracker) => {
  memo[tracker] = new RegExp("((^|&)" + tracker + "=[^&#]*)", "ig");
  return memo;
}, {});

// Actually strip out the tracking codes/parameters from a URL and return the cleansed URL
function removeTrackersFromUrl(url, trackers) {
  if (!url) return url;

  const urlPieces = url.split("?");

  // If no params, nothing to modify
  if (urlPieces.length === 1) {
    return url;
  }

  trackers.forEach((tracker) => {
    urlPieces[1] = urlPieces[1].replace(
      TRACKER_REGEXES_BY_TRACKER[tracker],
      ""
    );
  });

  let host = new URL(url).hostname.replace(/^www\./, "");
  host = host.split(".").slice(0, -1).join(".");
  if (host.indexOf(".") > -1) {
    host = host.split(".").slice(1).join(".");
  }
  if (DOMAIN_TRACKERS[host]) {
    DOMAIN_TRACKERS[host].forEach((tracker) => {

      urlPieces[1] = urlPieces[1].replace(
        new RegExp("((^|&)" + tracker + "=[^&#]*)", "ig"),
        ""
      );
    });
  }

  while (urlPieces[1].charAt(0) === "&") {
    urlPieces[1] = urlPieces[1].substr(1);
  }

  return urlPieces[1] ? urlPieces.join("?") : urlPieces[0];
}

function setSetting(key, value) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      // console.log("Settings (" + key + "): " + value + " saved.");
      resolve();
    });
  });
}

function getSetting(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (items) => {
      resolve(items[key]);
    });
  });
}

function getShortUrl(url, service, KEY = "") {
  if (service === "tinyurl") {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://tinyurl.com/api-create.php?url=" + url, false);
    xhr.onerror = function () {
      console.error("Error getting short URL from is.gd");
      return url;
    };
    xhr.send();
    return xhr.responseText;
  } else if (service === "isgd") {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://is.gd/create.php?format=simple&url=" + url, false);
    xhr.onerror = function () {
      console.error("Error getting short URL from is.gd");
      return url;
    };
    xhr.send();
    return xhr.responseText;
  } else if (service === "bitly") {
    if (KEY === "") {
      console.error("No API key provided for Bitly");
      return url;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api-ssl.bitly.com/v4/shorten", false);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", "Bearer " + KEY);
    xhr.send(JSON.stringify({ long_url: url }));
    let response = JSON.parse(xhr.responseText);
    return response.link;
  }
}

if (document.getElementById("year") !== null) {
  document.getElementById("year").innerText = new Date().getFullYear();
}
