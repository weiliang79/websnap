var screenshot = {
      /**
       * @description Current tab ID
       * @type {Number}
       */
      tabId: null,

      /**
       * @description Canvas element
       * @type {Object}
       */
      screenshotCanvas: null,

      /**
       * @description 2D context of scrennshotCanvas element
       * @type {Object}
       */
      screenshotContext: null,

      /**
       * @description The pixels whereby to move the screen
       * @type {Number}
       */
      scrollBy: 0,

      /**
       * @description Sizes of the page
       * @type {Object}
       */
      size: {
            width: 0,
            height: 0,
      },

      /**
       * @description The original params of the page
       * @type {Object}
       */
      originalParams: {
            overflow: "",
            scrollTop: 0,
      },

      /**
       * @description The hid elements of the page
       * @type {Object}
       */
      hidElements: {
            count: 0,
            elements: [],
      },

      /**
       * @description Initialize the extension
       */
      initialize: function () {
            this.screenshotCanvas = document.createElement("canvas");
            this.screenshotContext = this.screenshotCanvas.getContext("2d");
            this.bindEvents();
      },

      /**
       * @description Bind browserAction.onClicked and runtime.onMessage events
       */
      bindEvents: function () {
            browser.browserAction.onClicked.addListener(function (tab) {
                  this.tabId = tab.id;

                  browser.tabs.sendMessage(this.tabId, {
                        "message": "getPageDetails",
                  });
            }.bind(this));

            browser.runtime.onMessage.addListener(function (request, sender, callback) {
                  if (request.message === "setPageDetails") {
                        this.size = request.size;
                        this.scrollBy = request.scrollBy;
                        this.originalParams = request.originalParams;

                        this.screenshotCanvas.width = this.size.width;
                        this.screenshotCanvas.height = this.size.height;

                        this.scrollTo(0);
                  } else if (request.message === "capturePage") {
                        if (typeof request.hidElements !== "undefined") {
                              this.hidElements.count = request.hidElements.count;
                              this.hidElements.elements = request.hidElements.elements;
                        }

                        this.capturePage(request.position, request.lastCapture);
                  }
            }.bind(this));
      },

      /**
       * @description Send message to scroll page with specified position
       * @param {Number} position 
       */
      scrollTo: function (position) {
            browser.tabs.sendMessage(this.tabId, {
                  "message": "scrollPage",
                  "size": this.size,
                  "scrollBy": this.scrollBy,
                  "scrollTo": position,
                  "hidElements": this.hidElements,
            });
      },

      /**
       * @description Take screenshot on visible area and merges it
       * @param {Number} position 
       * @param {Boolean} lastCapture 
       */
      capturePage: function (position, lastCapture) {

            setTimeout(function () {

                  browser.tabs.captureVisibleTab(this.tabId, {
                        "format": "png",
                  }, function (dataURI) {

                        var image = new Image();

                        if (typeof dataURI !== "undefined") {
                              image.onload = function () {
                                    self.screenshot.screenshotContext.drawImage(image, 0, position);

                                    if (lastCapture) {
                                          self.screenshot.resetPage();

                                          browser.tabs.create({
                                                index: self.screenshot.tabId + 1,
                                                url: browser.runtime.getURL('test.html'),
                                          }).then(() => {
                                                browser.tabs.executeScript({
                                                      code: "document.getElementById('screenshot').src = '" + self.screenshot.screenshotCanvas.toDataURL("image/png") + "';",
                                                });
                                          });

                                    } else {
                                          self.screenshot.scrollTo(position + self.screenshot.scrollBy);
                                    }
                              };

                              image.src = dataURI;
                        } else {
                              //TODO: hendle error if the captured uri is undefined
                              console.log("error");
                        }
                  })

            }, 300);

      },

      /**
       * @description Send message to reset back the original params and elements of the page
       */
      resetPage: function () {
            browser.tabs.sendMessage(this.tabId, {
                  "message": "resetPage",
                  "originalParams": this.originalParams,
                  "hidElements": this.hidElements,
            });
      },
}

screenshot.initialize();
