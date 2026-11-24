import sys, time
from playwright.sync_api import sync_playwright
B="http://localhost:3100"
EMAIL=f"form.keep.{int(time.time())}@example.com"
def fill(pg, email):
    pg.fill("input[name=parentName]","Test Parent"); pg.select_option("select[name=relation]","Mother")
    pg.fill("input[name=email]",email); pg.fill("input[name=childName]","Test Child")
    pg.fill("input[name=dob]","2014-05-10"); pg.select_option("select[name=klass]","Class VI")
    pg.select_option("select[name=gender]","Girl"); pg.fill("input[name=city]","Kanker"); pg.fill("input[name=state]","Chhattisgarh")
    for cb in pg.locator(".consent-list input[type=checkbox]").all(): cb.check()
ok=True
def check(c,msg):
    global ok; print(("PASS " if c else "FAIL ")+msg); ok=ok and c
with sync_playwright() as p:
    for engine in ["chromium","webkit"]:
        try: b=getattr(p,engine).launch()
        except Exception as e: print("skip",engine,str(e)[:60]); continue
        ctx=b.new_context(viewport={"width":390,"height":844}); pg=ctx.new_page()
        em=f"{engine}.{EMAIL}"
        # browser rejects an address without a dot in the domain, before the server
        pg.goto(B+"/start"); fill(pg,"test@invalid"); pg.click("button[type=submit]"); pg.wait_for_timeout(800)
        check(pg.url.endswith("/start") and pg.locator("input[name=email]:invalid").count()==1, f"{engine}: browser flags test@invalid at the field")
        # five good submits each send a code and land on /verify
        for i in range(5):
            pg.goto(B+"/start"); fill(pg,em); pg.click("button[type=submit]")
            pg.wait_for_url("**/verify**", timeout=15000)
        check(True, f"{engine}: five submits each reach the code page")
        # sixth hits the hourly limit: the error must show and every value and tick must survive
        pg.goto(B+"/start"); fill(pg,em); pg.click("button[type=submit]")
        pg.wait_for_selector(".alert", timeout=15000)
        kept = pg.input_value("input[name=parentName]")=="Test Parent" and pg.input_value("input[name=email]")==em \
            and pg.input_value("select[name=klass]")=="Class VI" and pg.input_value("input[name=dob]")=="2014-05-10" \
            and all(cb.is_checked() for cb in pg.locator(".consent-list input[type=checkbox]").all())
        check(kept, f"{engine}: after a server error every field and consent tick is kept")
        box=pg.locator(".alert").bounding_box()
        check(box is not None and 0<=box["y"]<=844, f"{engine}: the error is on screen ({pg.locator('.alert').inner_text()[:50]})")
        ctx.close(); b.close()
print("\nALL PASSED" if ok else "\nSOME FAILED")
