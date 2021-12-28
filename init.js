const axios = require("axios").default
const fs = require("fs")
const chalk = require('chalk')

console.clear()
console.log(chalk.redBright("██████╗░██████╗░██╗░░░░░██╗░░██╗░░░░░░░██████╗░██████╗░░█████╗░██╗░░░██╗██████╗░░██████╗"))
console.log(chalk.redBright("██╔══██╗██╔══██╗██║░░░░░╚██╗██╔╝░░░░░░██╔════╝░██╔══██╗██╔══██╗██║░░░██║██╔══██╗██╔════╝"))
console.log(chalk.redBright("██████╔╝██████╦╝██║░░░░░░╚███╔╝░█████╗██║░░██╗░██████╔╝██║░░██║██║░░░██║██████╔╝╚█████╗░"))
console.log(chalk.redBright("██╔══██╗██╔══██╗██║░░░░░░██╔██╗░╚════╝██║░░╚██╗██╔══██╗██║░░██║██║░░░██║██╔═══╝░░╚═══██╗"))
console.log(chalk.redBright("██║░░██║██████╦╝███████╗██╔╝╚██╗░░░░░░╚██████╔╝██║░░██║╚█████╔╝╚██████╔╝██║░░░░░██████╔╝"))
console.log(chalk.redBright("╚═╝░░╚═╝╚═════╝░╚══════╝╚═╝░░╚═╝░░░░░░░╚═════╝░╚═╝░░╚═╝░╚════╝░░╚═════╝░╚═╝░░░░░╚═════╝░\n\n"))

const preferences = { // err config ⚙️
    started: 0, // dont you dare change this 🔫
    webhook: {
        enabled: false,
        url: "",
    },
    int: { // group id
        min: 3000000,
        max: 10000000,
    },
    interval: 5,
    /**
     * Over 600 groups per minute if "interval" is below 100.
     * 
     * 60000/(interval)
     */
    logToFile: {
        enabled: true,
        fileName: Date.now().toString() // exstension will be added automaticly 'fileName: "log"'
    },
    repeat: true, // "true" for continues || "false" for 1 time
    proxy: true, // https://proxyscrape.com/free-proxy-list
    proxyFile: "http_proxies.txt",
}

if (preferences.logToFile.enabled) {
    var wStream = fs.createWriteStream(preferences.logToFile.fileName + ".txt")

    wStream.write("\n\nMade by completelyfcked#0001\nGroups can be unable to load, the Roblox do api does not show if it loads or not.\n\n")
}

var stats = { groupsFound: 0, requestsMade: 0 }

var currentProxy = { host: null, port: null, index: 0 };
function axiosConfig(host, port) {
    if (!preferences.proxy) return {};

    return {
        proxy: {
            host: host,
            port: port
        }
    };
}
function newProxy() {
    if (!preferences.proxy) return;

    var proxies = fs.readFileSync(preferences.proxyFile)
    proxies = proxies.toString().split("\n")

    if (!proxies[currentProxy.index++]) {
        currentProxy.index = 0;
    }

    var proxy = proxies[currentProxy.index++]
    proxy = proxy.toString().split(":")

    currentProxy.host = proxy[0]
    currentProxy.port = proxy[1]
}

var currentint = preferences.int.min;
var miner = setInterval(() => {
    if (!preferences.started == 1) { console.log(chalk.gray("[APP]:") + chalk.greenBright(" Started")); preferences.started++; } // dont you dare change this 🔫
    if (currentint > preferences.int.max) return end(); else { currentint++; };

    if (preferences.proxy) {
        console.log(chalk.gray("[APP]: ") + "starting request with proxy " + `${currentProxy.host}:${currentProxy.port}`)

        newProxy()
    } else {
        console.log(chalk.gray("[APP]: ") + "starting request")
    };

    var conf = axiosConfig(currentProxy.host, currentProxy.port)

    axios.get(`https://groups.roblox.com/v1/groups/${currentint}`,
        conf
    ).then((res, req) => {
        stats.requestsMade++; updateStats();

        var data = res.data;

        console.log(chalk.gray("[APP]: ") + chalk.blue(currentint))

        //if (data.owner.username == "" || !data.owner && data.isLocked == false || !data.isLocked && data.publicEntryAllowed == true) {
        if (data.owner.DisplayName == "" && data.IsLocked != true && data.PublicEntryAllowed == true) {
            valid(data)
        }
    }).catch((err) => {
        if (err.response) {
            var done = 0;

            if (err.response.status == 429) {
                console.warn(chalk.gray("[APP]:") + chalk.red(" 429 (RATE LIMIT)"))
                done++;
            } else if (err.response.status == 502) {
                console.log(chalk.gray("[APP]:") + chalk.red(" 502 (BAD GATEWAY)"))
                done++;
            } else if (err.response.status == 404) {
                console.log(chalk.gray("[APP]:") + chalk.red(" 404 (NOT FOUND)"))
                done++;
            } else if (err.response.status == 503) {
                console.error(chalk.gray("[APP]:") + chalk.red(" 503 (TOO MANY OPEN CONNECTIONS)"))
                done++;
            } else if (err.response.status == 403) {
                console.log(chalk.gray("[APP]:") + chalk.red(" 403 (FORBIDDEN)"))
                done++;
            } else {
                console.log(chalk.gray("[APP]: ") + chalk.red(err.response.status))
            };
        }
    })
}, preferences.interval)

function end() {
    if (preferences.repeat == false) {
        console.warn(chalk.gray("[APP]:") + " Finished")

        clearInterval(miner) // Stops it from running again
    };

    currentint = preferences.int.min;
}

function valid(data) {
    if (preferences.logToFile.enabled) {
        wStream.write(`${data.name} - ${data.id}\n`)
    }

    console.warn(chalk.gray("[APP]:") + chalk.bgGreenBright.whiteBright(`${data.name} - ${data.id}`))
    stats.groupsFound++; updateStats()
}

function updateStats() {
    process.title = `RBLX-GROUPS | ${stats.requestsMade} Requests - ${stats.groupsFound} Groups`
}