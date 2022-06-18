browser.runtime.onMessage.addListener(function (request, sender, callback) {
      switch (request.message) {
            case "getPageDetails": {
                  var size = {
                        width: Math.max(
                              document.documentElement.clientWidth,
                              document.body.scrollWidth,
                              document.documentElement.scrollWidth,
                              document.body.offsetWidth,
                              document.documentElement.offsetWidth,
                        ),
                        height: Math.max(
                              document.documentElement.clientHeight,
                              document.body.scrollHeight,
                              document.documentElement.scrollHeight,
                              document.body.offsetHeight,
                              document.documentElement.offsetHeight,
                        ),
                  }

                  browser.runtime.sendMessage({
                        "message": "setPageDetails",
                        "size": size,
                        "scrollBy": window.innerHeight,
                        "originalParams": {
                              "overflow": document.querySelector("body").style.overflow,
                              "scrollTop": document.documentElement.scrollTop,
                        },
                  });
                  break;
            }
            case "scrollPage": {
                  var lastCapture = false;

                  //show fixed elements
                  if (request.scrollTo !== 0) {
                        setTimeout(restoreHidElement(request.hidElements), 300);
                  }
                  
                  window.scrollTo(0, request.scrollTo);

                  if (request.scrollTo === 0) {
                        document.querySelector("body").style.overflow = "hidden";

                        if (request.size.height <= window.scrollY + request.scrollBy) {
                              lastCapture = true;
                              request.scrollTo = request.size.height - request.scrollBy;
                        }
      
                        browser.runtime.sendMessage({
                              "message": "capturePage",
                              "position": request.scrollTo,
                              "lastCapture": lastCapture,
                              "hidElements": {
                                    count: 0, 
                                    elements: [],
                              },
                        });
                  } else {
                        //hide fixed elements
                        hideFixedElement().then((hidElements) => {
                              
                              if (request.size.height <= window.scrollY + request.scrollBy) {
                                    lastCapture = true;
                                    request.scrollTo = request.size.height - request.scrollBy;
                              }
            
                              browser.runtime.sendMessage({
                                    "message": "capturePage",
                                    "position": request.scrollTo,
                                    "lastCapture": lastCapture,
                                    "hidElements": hidElements,
                              });
                        })
                  }

                  break;
            }
            case "resetPage": {
                  setTimeout(restoreHidElement(request.hidElements), 300);
                  window.scrollTo(0, request.originalParams.scrollTop);
                  document.querySelector("body").style.overflow = request.originalParams.overflow;
                  break;
            }
            case "error": {
                  //TODO: popup with error
                  console.log("error");
            }
      }
});

/**
 * @description Hide the elements with fixed or sticky position
 * @returns {Object} hidElements
 */
function hideFixedElement() {

      return new Promise((resolve, reject) => {
            setTimeout(() => {

                  var hidElements = {
                        count: 0,
                        elements: [],
                  };
                  var elems = document.body.getElementsByTagName("*");
                  for (var i = 0; i < elems.length; i++) {
                        var pos = window.getComputedStyle(elems[i], null).getPropertyValue('position');
                        if (pos == 'sticky' || pos == 'fixed') {
                              hidElements.count++;
                              hidElements.elements.push(window.getComputedStyle(elems[i], null).getPropertyValue('visibility'));
                              elems[i].style.visibility = "hidden";
                        }
                  }
                  resolve(hidElements);

            }, 300);
      });
}

/**
 * @description Restore back the hid elements
 * @param {Object} hidElements 
 */
function restoreHidElement(hidElements) {
      var count = 0;

      if (hidElements.count !== 0) {
            var elems = document.body.getElementsByTagName("*");
            for (var i = 0; i < elems.length; i++) {
                  var pos = window.getComputedStyle(elems[i], null).getPropertyValue('position');
                  if (pos == 'sticky' || pos == 'fixed') {
                        elems[i].style.visibility = hidElements.elements[count];
                        count++;
                  }
            }
      }

}