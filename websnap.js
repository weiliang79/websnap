function test(){
      browser.tabs.insertCSS({code: "body { border: 20px solid red; }"});
}

browser.browserAction.onClicked.addListener(test);
