chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'get-value') {
        (async () => {
            const { key, defaultValue } = message;
            const value = (await chrome.storage.local.get({ [key]: defaultValue }))[key];
            sendResponse(value);
        })();
    } else if (message.type === 'set-value') {
        (async () => {
            const { key, newValue } = message;
            await chrome.storage.local.set({ [key]: newValue });
            sendResponse();
        })();
    }
    return true;
});
