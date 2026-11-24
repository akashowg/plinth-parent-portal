import json, io, wave, sys
from email.parser import BytesParser
from email.policy import HTTP
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
LOG="/home/claude/stt/requests.jsonl"
class H(BaseHTTPRequestHandler):
    def log_message(self,*a): pass
    def do_POST(self):
        n=int(self.headers.get("content-length",0)); body=self.rfile.read(n)
        msg=BytesParser(policy=HTTP).parsebytes(b"content-type: "+self.headers["content-type"].encode()+b"\r\n\r\n"+body)
        fs={}
        for part in msg.iter_parts(): fs[part.get_param("name",header="content-disposition")]=part.get_payload(decode=True)
        g=lambda k:(fs.get(k) or b"").decode() or None
        rec={"path":self.path,"key":self.headers.get("api-subscription-key"),"model":g("model"),"mode":g("mode"),"lang":g("language_code")}
        data=fs.get("file") or b""
        try:
            w=wave.open(io.BytesIO(data)); rec.update(rate=w.getframerate(),ch=w.getnchannels(),bits=w.getsampwidth()*8,secs=round(w.getnframes()/w.getframerate(),2))
        except Exception as e: rec["wav_error"]=str(e)
        # Failure switch for tests: /home/claude/stt/mode.json = {"after": N, "status": 403} fails every request after the Nth.
        try: mode=json.load(open("/home/claude/stt/mode.json"))
        except Exception: mode={}
        with open(LOG,"a") as f: f.write(json.dumps(rec)+"\n")
        idx=sum(1 for _ in open(LOG))
        if mode.get("status") and idx > mode.get("after",0):
            b=json.dumps({"error":{"message":"test failure"}}).encode(); self.send_response(mode["status"]); self.send_header("content-type","application/json"); self.send_header("content-length",str(len(b))); self.end_headers(); self.wfile.write(b); return
        out={"request_id":"x","transcript":f"piece{idx}","language_code":rec["lang"]}
        b=json.dumps(out).encode(); self.send_response(200); self.send_header("content-type","application/json"); self.send_header("content-length",str(len(b))); self.end_headers(); self.wfile.write(b)
ThreadingHTTPServer(("127.0.0.1",4599),H).serve_forever()
