// ==UserScript==
// @name          Canvas Untracker
// @namespace     https://www.artemive.tk/ashore
// @description   Prevent canvas from knowing you changed tabs
// @author        Solanaceae
// @version       1.0
// @match         http*://*canvas.*.edu/*
// @match         http*://canvas.com/*
// @match         http*://*.instructure.com/*
// @run-at        document-start
// @icon          https://canvas.instructure.com/favicon.ico
// ==/UserScript==

const log = (str, ...data) => {
  if (isEmptyArray(data)) {
    console.log(`[CQU] - ${str}`);
  } else {
    console.log(`[CQU] - ${str}:`, data);
  }
};

const get = (selector) =>
  selector
    .replace(/\[([^\[\]]*)\]/g, ".$1.")
    .split(".")
    .filter((t) => t !== "")
    .reduce((prev, cur) => prev && prev[cur], window);

const isEmptyObject = (obj) => JSON.stringify(obj) === "{}";

const isEmptyArray = (arr) => !arr.length;

const waitUntil = (fn) => {
  return new Promise(async (resolve, reject) => {
    if (typeof fn !== "function") {
      reject();
    }
    while (Boolean(fn()) !== true) {
      await new Promise((r) => setTimeout(r, 10));
    }
    resolve(true);
  });
};

const main = () => {
  waitUntil(() => get("jQuery") !== undefined).then(() => {
    const ajaxOriginal = window.jQuery.ajax;
    window.jQuery.ajax = function () {
      const ID = (Math.random() * 1e18).toString(36).substring(0, 6);
      const ajaxOptions = arguments?.[0];
      //log(`[${ID}] ajaxOptions`, ajaxOptions);
      if (
        ajaxOptions?.url?.search?.("events") > -1 ||
        ajaxOptions?.url?.search?.("page_views") > -1
      ) {
        const moddedData =
          typeof ajaxOptions?.data === "string" &&
          JSON.parse(ajaxOptions?.data ?? "{}");
        if (!isEmptyObject(moddedData)) {
          const unfiltered = moddedData.quiz_submission_events;
          moddedData.quiz_submission_events =
            moddedData?.quiz_submission_events?.filter?.(
              (e) => e.event_type.search("page") == -1
            );
          if (isEmptyArray(moddedData.quiz_submission_events)) {
            log(
              `[${ID}] Skipped sending an empty log, not sending!`,
              moddedData
            );
            return Promise.resolve();
          }
          log(
            `[${ID}] Cleaned AJAX request, [before, after]`,
            unfiltered,
            moddedData.quiz_submission_events
          );
          ajaxOptions.data = JSON.stringify(moddedData);
          return ajaxOriginal.apply(this, arguments);
        }
        log(`[${ID}] Not sending this AJAX request!`, ajaxOptions);
        return Promise.resolve();
      }
      log(`[${ID}] Sending unmodified`, ajaxOptions);
      return ajaxOriginal.apply(this, arguments);
    };
  });
};

if (["complete", "interactive"].indexOf(document.readyState) > -1) {
  main();
} else {
  document.addEventListener("DOMContentLoaded", main, false);
}
