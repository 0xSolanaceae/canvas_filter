// ==UserScript==
// @name          Canvas Filter
// @namespace     https://solanaceae.xyz/
// @description   Prevent your activity from being returned to Instructure's canvas
// @version       1.0
// @match         http*://*canvas.*.edu/*
// @match         http*://canvas.com/*
// @match         http*://*.instructure.com/*
// @run-at        document-start
// @icon          https://canvas.instructure.com/favicon.ico
// ==/UserScript==

(() => {
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
      return new Promise((resolve, reject) => {
          if (typeof fn !== "function") {
              reject();
          }
          const interval = setInterval(() => {
              if (Boolean(fn()) === true) {
                  clearInterval(interval);
                  resolve(true);
              }
          }, 10);
      });
  };

  const cleanAjaxData = (data) => {
      try {
          const moddedData = JSON.parse(data ?? "{}");
          if (!isEmptyObject(moddedData)) {
              const unfiltered = moddedData.quiz_submission_events;
              moddedData.quiz_submission_events = moddedData.quiz_submission_events?.filter(
                  (e) => e.event_type.search("page") === -1
              );
              return {
                  moddedData,
                  unfiltered
              };
          }
      } catch (error) {
          log("Error parsing AJAX data", error);
      }
      return null;
  };

  const main = () => {
      waitUntil(() => get("jQuery") !== undefined).then(() => {
          const ajaxOriginal = window.jQuery.ajax;
          window.jQuery.ajax = function() {
              const ID = (Math.random() * 1e18).toString(36).substring(0, 6);
              const ajaxOptions = arguments?.[0];
              if (
                  ajaxOptions?.url?.includes("events") ||
                  ajaxOptions?.url?.includes("page_views")
              ) {
                  const cleanedData = cleanAjaxData(ajaxOptions?.data);
                  if (cleanedData) {
                      const {
                          moddedData,
                          unfiltered
                      } = cleanedData;
                      if (isEmptyArray(moddedData.quiz_submission_events)) {
                          log(`[${ID}] Skipped sending an empty log, not sending!`, moddedData);
                          return Promise.resolve();
                      }
                      log(`[${ID}] Cleaned AJAX request, [before, after]`, unfiltered, moddedData.quiz_submission_events);
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

  if (["complete", "interactive"].includes(document.readyState)) {
      main();
  } else {
      document.addEventListener("DOMContentLoaded", main, false);
  }
})();