// Jaynlin's settings. GoHighLevel runs on the server (/api/submit).
// The email notification is sent FROM THE VISITOR'S BROWSER via Web3Forms,
// because Web3Forms' free plan only accepts client-side sends (their keys are
// designed to be public). 2026-08-01 fix: server-side sends were being rejected
// with "method not allowed (Pro plan required)" - silently. 
window.SF_CONFIG = {
  agentName: "Jaynlin Slone",
  endpoint: "/api/submit",
  web3formsKey: "2ece0cfb-1f73-495d-bb1b-3dbc9011d5a9",
  notifyEmail: "Jaynlin@kristahomes.com"
};
