chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "collectData") {
        
        const data = {
            url: window.location.href,
            timestamp: new Date().toLocaleString('pt-BR'),
            userAgent: navigator.userAgent,
            resolution: `${window.screen.width}x${window.screen.height}`
        };
    
        sendResponse(data);
    }
});