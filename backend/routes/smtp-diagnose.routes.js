import express from "express";
import net from "node:net";
import dns from "node:dns";
import https from "node:https";

const router = express.Router();

const tcpConnect = (host, port, timeoutMs = 8000) =>
  new Promise((resolve) => {
    const socket = new net.Socket();
    const timer = setTimeout(() => {
      socket.destroy();
      resolve({ ok: false, error: "timeout" });
    }, timeoutMs);
    socket.once("connect", () => {
      clearTimeout(timer);
      socket.destroy();
      resolve({ ok: true, localAddress: socket.localAddress });
    });
    socket.once("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, error: `${err.code} ${err.address || ""}`.trim() });
    });
    socket.connect(port, host);
  });

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ timedOut: true, label }), ms)),
  ]);

const httpsGet = (url, timeoutMs = 8000) =>
  new Promise((resolve) => {
    const req = https.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve({ ok: true, status: res.statusCode });
    });
    req.on("timeout", () => req.destroy());
    req.on("error", (err) => resolve({ ok: false, error: err.message }));
  });

const lookup = (rrtype) =>
  new Promise((resolve) => {
    dns.resolve("smtp.gmail.com", rrtype, (err, addresses) =>
      err ? resolve({ error: err.code }) : resolve({ addresses })
    );
  });

router.get("/", async (_req, res) => {
  const [a, aaaa, v4, v4Alt, v465, http, ipify] = await Promise.all([
    withTimeout(lookup("A"), 6000, "lookupA"),
    withTimeout(lookup("AAAA"), 6000, "lookupAAAA"),
    withTimeout(tcpConnect("smtp.gmail.com", 587), 9000, "587"),
    withTimeout(tcpConnect("64.233.184.108", 587), 9000, "587-hardip"),
    withTimeout(tcpConnect("smtp.gmail.com", 465), 9000, "465"),
    withTimeout(httpsGet("https://smtp.gmail.com/"), 9000, "https-smtp"),
    withTimeout(httpsGet("https://api.ipify.org"), 9000, "https-ipify"),
  ]);
  res.status(200).json({
    success: true,
    data: { a, aaaa, v4, v4Alt, v465, http, egressIp: ipify },
  });
});

export default router;
