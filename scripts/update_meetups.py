# -*- coding: utf-8 -*-
"""从 FEC·兽展日历 (furrycons.cn) 自动拉取兽聚信息，更新 data/meetups.json

数据源：https://www.furrycons.cn/ 首页 __NEXT_DATA__ 内嵌的未来活动列表，
每个活动再抓详情页补充 QQ 群（结果缓存在 data/meetups_cache.json，只抓新增活动）。

用法：
    python scripts/update_meetups.py                    # 更新数据（默认会补齐缺失封面到本地）
    python scripts/update_meetups.py --dry-run          # 只看结果不写盘
    python scripts/update_meetups.py --enrich           # 额外逐个抓详情页补 QQ 群（慢）
    python scripts/update_meetups.py --skip-logos       # 跳过封面下载（纯文字数据）

供 GitHub Actions (.github/workflows/update-meetups.yml) 每天定时调用。
封面必须本地化：FEC 图床有 EdgeOne Bot 挑战，<img> 外链会加载失败。
已下载的封面直接复用，因此每天定时任务通常只需 1 次首页请求，秒级完成。
核心同步仅用标准库；Pillow 为可选依赖，用于把海报压成 WebP（不装则保留原图格式）。
"""
import json
import os
import re
import ssl
import sys
import time
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(ROOT, "data", "meetups.json")
CACHE_PATH = os.path.join(ROOT, "data", "meetups_cache.json")
LOGO_DIR = os.path.join(ROOT, "data", "meetup_logos")

HOME_URL = "https://www.furrycons.cn/"
EVENT_URL = "https://www.furrycons.cn/event/"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 FurUpMeetupSync/1.0")
CN_TZ = timezone(timedelta(hours=8))

# ---------------------------------------------------------------------------
# 城市 -> 省份 映射（热力图按省聚合用；港澳台按省级列出）
# ---------------------------------------------------------------------------
CITY_TO_PROVINCE = {
    # 直辖市
    "北京": "北京", "上海": "上海", "天津": "天津", "重庆": "重庆",
    # 河北
    "石家庄": "河北", "唐山": "河北", "秦皇岛": "河北", "邯郸": "河北", "邢台": "河北",
    "保定": "河北", "张家口": "河北", "承德": "河北", "沧州": "河北", "廊坊": "河北", "衡水": "河北",
    # 山西
    "太原": "山西", "大同": "山西", "阳泉": "山西", "长治": "山西", "晋城": "山西",
    "朔州": "山西", "晋中": "山西", "运城": "山西", "忻州": "山西", "临汾": "山西", "吕梁": "山西",
    # 内蒙古
    "呼和浩特": "内蒙古", "包头": "内蒙古", "乌海": "内蒙古", "赤峰": "内蒙古", "通辽": "内蒙古",
    "鄂尔多斯": "内蒙古", "呼伦贝尔": "内蒙古", "巴彦淖尔": "内蒙古", "乌兰察布": "内蒙古",
    # 辽宁
    "沈阳": "辽宁", "大连": "辽宁", "鞍山": "辽宁", "抚顺": "辽宁", "本溪": "辽宁",
    "丹东": "辽宁", "锦州": "辽宁", "营口": "辽宁", "阜新": "辽宁", "辽阳": "辽宁",
    "盘锦": "辽宁", "铁岭": "辽宁", "朝阳": "辽宁", "葫芦岛": "辽宁",
    # 吉林
    "长春": "吉林", "吉林": "吉林", "四平": "吉林", "辽源": "吉林", "通化": "吉林",
    "白山": "吉林", "松原": "吉林", "白城": "吉林", "延边": "吉林",
    # 黑龙江
    "哈尔滨": "黑龙江", "齐齐哈尔": "黑龙江", "鸡西": "黑龙江", "鹤岗": "黑龙江",
    "双鸭山": "黑龙江", "大庆": "黑龙江", "伊春": "黑龙江", "佳木斯": "黑龙江",
    "七台河": "黑龙江", "牡丹江": "黑龙江", "黑河": "黑龙江", "绥化": "黑龙江",
    # 江苏
    "南京": "江苏", "无锡": "江苏", "徐州": "江苏", "常州": "江苏", "苏州": "江苏",
    "南通": "江苏", "连云港": "江苏", "淮安": "江苏", "盐城": "江苏", "扬州": "江苏",
    "镇江": "江苏", "泰州": "江苏", "宿迁": "江苏",
    # 浙江
    "杭州": "浙江", "宁波": "浙江", "温州": "浙江", "嘉兴": "浙江", "湖州": "浙江",
    "绍兴": "浙江", "金华": "浙江", "衢州": "浙江", "舟山": "浙江", "台州": "浙江",
    "丽水": "浙江", "义乌": "浙江",
    # 安徽
    "合肥": "安徽", "芜湖": "安徽", "蚌埠": "安徽", "淮南": "安徽", "马鞍山": "安徽",
    "淮北": "安徽", "铜陵": "安徽", "安庆": "安徽", "黄山": "安徽", "滁州": "安徽",
    "阜阳": "安徽", "宿州": "安徽", "六安": "安徽", "亳州": "安徽", "池州": "安徽", "宣城": "安徽",
    # 福建
    "福州": "福建", "厦门": "福建", "莆田": "福建", "三明": "福建", "泉州": "福建",
    "漳州": "福建", "南平": "福建", "龙岩": "福建", "宁德": "福建",
    # 江西
    "南昌": "江西", "景德镇": "江西", "萍乡": "江西", "九江": "江西", "新余": "江西",
    "鹰潭": "江西", "赣州": "江西", "吉安": "江西", "宜春": "江西", "抚州": "江西", "上饶": "江西",
    # 山东
    "济南": "山东", "青岛": "山东", "淄博": "山东", "枣庄": "山东", "东营": "山东",
    "烟台": "山东", "潍坊": "山东", "济宁": "山东", "泰安": "山东", "威海": "山东",
    "日照": "山东", "临沂": "山东", "德州": "山东", "聊城": "山东", "滨州": "山东", "菏泽": "山东",
    # 河南
    "郑州": "河南", "开封": "河南", "洛阳": "河南", "平顶山": "河南", "安阳": "河南",
    "鹤壁": "河南", "新乡": "河南", "焦作": "河南", "濮阳": "河南", "许昌": "河南",
    "漯河": "河南", "三门峡": "河南", "南阳": "河南", "商丘": "河南", "信阳": "河南",
    "周口": "河南", "驻马店": "河南", "济源": "河南",
    # 湖北
    "武汉": "湖北", "黄石": "湖北", "十堰": "湖北", "宜昌": "湖北", "襄阳": "湖北",
    "鄂州": "湖北", "荆门": "湖北", "孝感": "湖北", "荆州": "湖北", "黄冈": "湖北",
    "咸宁": "湖北", "随州": "湖北", "恩施": "湖北",
    # 湖南
    "长沙": "湖南", "株洲": "湖南", "湘潭": "湖南", "衡阳": "湖南", "邵阳": "湖南",
    "岳阳": "湖南", "常德": "湖南", "张家界": "湖南", "益阳": "湖南", "郴州": "湖南",
    "永州": "湖南", "怀化": "湖南", "娄底": "湖南", "湘西": "湖南",
    # 广东
    "广州": "广东", "韶关": "广东", "深圳": "广东", "珠海": "广东", "汕头": "广东",
    "佛山": "广东", "江门": "广东", "湛江": "广东", "茂名": "广东", "肇庆": "广东",
    "惠州": "广东", "梅州": "广东", "汕尾": "广东", "河源": "广东", "阳江": "广东",
    "清远": "广东", "东莞": "广东", "中山": "广东", "潮州": "广东", "揭阳": "广东", "云浮": "广东",
    # 广西
    "南宁": "广西", "柳州": "广西", "桂林": "广西", "梧州": "广西", "北海": "广西",
    "防城港": "广西", "钦州": "广西", "贵港": "广西", "玉林": "广西", "百色": "广西",
    "贺州": "广西", "河池": "广西", "来宾": "广西", "崇左": "广西",
    # 海南
    "海口": "海南", "三亚": "海南", "三沙": "海南", "儋州": "海南",
    # 四川
    "成都": "四川", "自贡": "四川", "攀枝花": "四川", "泸州": "四川", "德阳": "四川",
    "绵阳": "四川", "广元": "四川", "遂宁": "四川", "内江": "四川", "乐山": "四川",
    "南充": "四川", "眉山": "四川", "宜宾": "四川", "广安": "四川", "达州": "四川",
    "雅安": "四川", "巴中": "四川", "资阳": "四川",
    # 贵州
    "贵阳": "贵州", "六盘水": "贵州", "遵义": "贵州", "安顺": "贵州",
    "毕节": "贵州", "铜仁": "贵州",
    # 云南
    "昆明": "云南", "曲靖": "云南", "玉溪": "云南", "保山": "云南", "昭通": "云南",
    "丽江": "云南", "普洱": "云南", "临沧": "云南", "大理": "云南",
    # 陕西
    "西安": "陕西", "铜川": "陕西", "宝鸡": "陕西", "咸阳": "陕西", "渭南": "陕西",
    "延安": "陕西", "汉中": "陕西", "榆林": "陕西", "安康": "陕西", "商洛": "陕西",
    # 甘肃
    "兰州": "甘肃", "嘉峪关": "甘肃", "金昌": "甘肃", "白银": "甘肃", "天水": "甘肃",
    "武威": "甘肃", "张掖": "甘肃", "平凉": "甘肃", "酒泉": "甘肃", "庆阳": "甘肃",
    "定西": "甘肃", "陇南": "甘肃",
    # 青海 / 宁夏 / 新疆
    "西宁": "青海", "海东": "青海",
    "银川": "宁夏", "石嘴山": "宁夏", "吴忠": "宁夏", "固原": "宁夏", "中卫": "宁夏",
    "乌鲁木齐": "新疆", "克拉玛依": "新疆", "吐鲁番": "新疆", "哈密": "新疆", "喀什": "新疆",
    # 港澳台（省级单列，geojson 中为 台湾省 / 香港特别行政区 / 澳门特别行政区）
    "台北": "台湾", "新北": "台湾", "桃园": "台湾", "台中": "台湾", "台南": "台湾",
    "高雄": "台湾", "基隆": "台湾", "新竹": "台湾", "嘉义": "台湾", "花莲": "台湾",
    "宜兰": "台湾", "苗栗": "台湾", "彰化": "台湾", "南投": "台湾", "云林": "台湾",
    "屏东": "台湾", "台东": "台湾", "澎湖": "台湾", "金门": "台湾", "马祖": "台湾",
    "香港": "香港", "澳门": "澳门",
}


def http_get(url, binary=False, retries=3, extra_headers=None):
    last_err = None
    headers = {"User-Agent": UA, "Accept": "*/*"}
    if extra_headers:
        headers.update(extra_headers)
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            try:
                ctx = ssl.create_default_context()
                return _read(urllib.request.urlopen(req, timeout=30, context=ctx), binary)
            except ssl.SSLError:
                ctx = ssl._create_unverified_context()
                return _read(urllib.request.urlopen(req, timeout=30, context=ctx), binary)
            except urllib.error.URLError as e:
                # 证书链问题兜底
                ctx = ssl._create_unverified_context()
                return _read(urllib.request.urlopen(req, timeout=30, context=ctx), binary)
        except Exception as e:  # noqa: BLE001
            last_err = e
            time.sleep(2 * (attempt + 1))
    raise RuntimeError("请求失败 %s: %s" % (url, last_err))


def _read(resp, binary):
    data = resp.read()
    if binary:
        return data
    return data.decode("utf-8", errors="replace")


def extract_next_data(html):
    m = re.search(
        r'<script id="__NEXT_DATA__" type="application/json"[^>]*>(.*?)</script>',
        html, re.S)
    if not m:
        raise RuntimeError("页面里没有 __NEXT_DATA__，FEC 站点结构可能变了")
    return json.loads(m.group(1))


def bj_ymd(iso_str):
    """ISO 时间 -> 北京时区日期 YYYY-MM-DD"""
    dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00")).astimezone(CN_TZ)
    return dt.strftime("%Y-%m-%d")


def duration_days(start_iso, end_iso):
    s = datetime.fromisoformat(start_iso.replace("Z", "+00:00")).astimezone(CN_TZ).date()
    e = datetime.fromisoformat(end_iso.replace("Z", "+00:00")).astimezone(CN_TZ).date()
    return max(1, (e - s).days + 1)


def normalize_city(raw):
    name = str(raw or "").strip()
    name = re.sub(r"(特别行政区|市|地区|盟)$", "", name) or name
    return name


def province_of(city):
    return CITY_TO_PROVINCE.get(city)


def fetch_event_detail(url_key):
    """抓活动详情页，返回 {qq_group, org_name, org_logo, detail}"""
    html = http_get(EVENT_URL + url_key)
    d = extract_next_data(html)
    ev = (d.get("props", {}).get("pageProps", {}) or {}).get("event") or {}
    qq, org_name, org_logo, website = None, None, None, None
    for org in ev.get("organizers") or []:
        o = org.get("organization") or {}
        org_name = org_name or o.get("name")
        org_logo = org_logo or o.get("logoUrl")
        for link in o.get("links") or []:
            t = str(link.get("type") or "").lower()
            if t == "qq_group" and not qq:
                qq = str(link.get("value") or "").strip()
            elif t == "website" and not website:
                website = str(link.get("value") or "").strip()
    return {
        "qq_group": qq,
        "org_name": org_name,
        "org_logo": org_logo,
        "website": website,
        "fetched_at": datetime.now(CN_TZ).strftime("%Y-%m-%d"),
    }


IMG_BASE = "https://images.furrycons.cn/"


def normalize_logo_url(raw):
    """FEC 的封面有两种写法：完整 URL，或 organizations/... 相对路径。
    相对路径的图床根是 https://images.furrycons.cn/（不带 /media/）。"""
    url = str(raw or "").strip()
    if not url:
        return ""
    if url.startswith(("http://", "https://", "./")):
        return url
    return IMG_BASE + url.lstrip("/")


IMG_MAGICS = (b"\x89PNG", b"\xff\xd8\xff", b"RIFF", b"GIF8", b"<svg", b"<?xml")


def solve_edgeone_challenge(html_bytes):
    """解 FEC 图床的 EdgeOne Bot 挑战，返回可用于重试的 Cookie 串。

    挑战页是一段固定结构的 JS：设置 __tst_status = A+B+C 与 EO_Bot_Ssid = D，
    四个常数每次请求都变，用正则提取即可，无需执行 JS。
    """
    js = html_bytes.decode("utf-8", "replace")
    m = re.search(r"WTKkN:(\d+),bOYDu:(\d+).*?wyeCN:(\d+)", js)
    d = re.search(r"\(t,(\d+)\)", js)
    if not (m and d):
        return None
    a, b, c = map(int, m.groups())
    return "EO_Bot_Ssid=%d; __tst_status=%d" % (int(d.group(1)), a + b + c)


def is_real_image(data):
    return len(data) > 5000 and data[:8].startswith(IMG_MAGICS)


def compress_to_webp(src_bytes, out_path):
    """用 Pillow 把海报统一压成宽 ≤1000 的 WebP（原图动辄 9449px / 8MB）。
    Pillow 不可用时返回 False，调用方会退回原格式。"""
    try:
        import io
        from PIL import Image
        im = Image.open(io.BytesIO(src_bytes)).convert("RGB")
        if im.width > 1000:
            im = im.resize((1000, round(im.height * 1000 / im.width)), Image.LANCZOS)
        im.save(out_path, "WEBP", quality=82, method=6)
        return True
    except Exception:  # noqa: BLE001  (含 ImportError)
        return False


def download_logo(url, url_key):
    """封面存为 data/meetup_logos/{urlKey}.webp（Pillow 可用时自动压缩）。

    FEC 图床 (images.furrycons.cn) 有 EdgeOne Bot 挑战，非浏览器请求会先返回
    一段 text/html 的 JS 而不是图片；<img> 标签也无法执行那段 JS，所以外链不可靠。
    流程：复用本地旧格式文件就地转换（不联网）-> 否则下载（挑战页解 cookie 重试）
    -> 校验图片魔数 -> 压成 WebP。已存在的 WebP 直接复用，保证定时任务幂等。
    """
    webp_path = os.path.join(LOGO_DIR, url_key + ".webp")
    local_ref = "./data/meetup_logos/%s.webp" % url_key
    if os.path.exists(webp_path) and os.path.getsize(webp_path) > 1000:
        return local_ref

    # 1) 优先复用已下载但尚未压缩的旧格式文件，避免重复联网
    data, old_path = None, None
    import glob
    for old in glob.glob(os.path.join(LOGO_DIR, url_key + ".*")):
        if old == webp_path:
            continue
        try:
            with open(old, "rb") as f:
                head = f.read(8)
            if os.path.getsize(old) > 5000 and head.startswith(IMG_MAGICS):
                with open(old, "rb") as f:
                    data = f.read()
                old_path = old
                break
            os.remove(old)  # 早期遗留的挑战页 / 损坏文件
        except OSError:
            pass

    # 2) 本地没有就联网下载（含 EdgeOne 挑战处理）
    if data is None:
        for attempt in range(2):
            try:
                data = http_get(url, binary=True)
                if not is_real_image(data):
                    cookie = solve_edgeone_challenge(data)
                    if cookie:
                        data = http_get(url, binary=True,
                                        extra_headers={"Cookie": cookie})
                if is_real_image(data):
                    break
                data = None
                time.sleep(1.0 * (attempt + 1))
            except Exception:  # noqa: BLE001
                data = None
                time.sleep(1.0 * (attempt + 1))
    if not is_real_image(data):
        print("  ! 封面不可用(跳过): %s" % url)
        return None

    # 3) 压缩落盘；无 Pillow 时按原扩展名原样保存
    if compress_to_webp(data, webp_path):
        if old_path:
            os.remove(old_path)
        return local_ref
    ext = ".jpg"
    m = re.search(r"\.(jpe?g|png|webp|gif)(?:\?|$)", url)
    if m:
        ext = "." + m.group(1).replace("jpeg", "jpg")
    fallback = os.path.join(LOGO_DIR, url_key + ext)
    with open(fallback, "wb") as f:
        f.write(data)
    if old_path and old_path != fallback:
        os.remove(old_path)
    return "./data/meetup_logos/%s%s" % (url_key, ext)


def main():
    args = set(sys.argv[1:])
    dry_run = "--dry-run" in args
    enrich = "--enrich" in args                  # 逐个抓详情页补 QQ 群（默认关）
    skip_logos = "--skip-logos" in args         # 跳过封面下载（默认下载缺失的）
    os.makedirs(LOGO_DIR, exist_ok=True)

    print("拉取 FEC 首页:", HOME_URL)
    doc = extract_next_data(http_get(HOME_URL))
    events = doc.get("props", {}).get("pageProps", {}).get("events") or []
    print("首页活动数:", len(events))

    cache = {}
    if os.path.exists(CACHE_PATH):
        cache = json.load(open(CACHE_PATH, encoding="utf-8"))

    today = datetime.now(CN_TZ).date()
    fetched, converted = [], []
    for ev in events:
        url_key = ev.get("urlKey")
        start, end = ev.get("startAt"), ev.get("endAt")
        if not (url_key and start and end):
            continue
        end_date = bj_ymd(end)
        # 跳过已结束 30 天以上的活动，避免列表被历史活动塞满
        if datetime.strptime(end_date, "%Y-%m-%d").date() < today - timedelta(days=30):
            continue
        fetched.append((url_key, ev, start, end))

    for url_key, ev, start, end in fetched:
        orgs = ev.get("organizations") or []
        org_name = orgs[0].get("name") if orgs else None
        theme = str(ev.get("name") or "").strip()
        region = (ev.get("region") or {})
        city = normalize_city(region.get("localName") or region.get("name"))
        province = province_of(city) or city
        place = str(ev.get("placeName") or "").strip() or None

        detail = cache.get(url_key) or {}
        if enrich and not detail:
            print("  抓详情:", url_key, org_name or theme)
            try:
                detail = fetch_event_detail(url_key)
                cache[url_key] = detail
                time.sleep(0.8)  # 对 FEC 友好一点
            except Exception as e:  # noqa: BLE001
                print("  ! 详情抓取失败 %s: %s" % (url_key, e))
                detail = {}
        # 组织名优先（详情页 > 首页 > 主题名兜底），主题名单列 theme 字段
        name = (detail.get("org_name") or org_name or theme or "未命名兽聚").strip()

        logo = None
        thumb = normalize_logo_url(ev.get("thumbnail"))
        if thumb and not skip_logos and not dry_run:
            logo = download_logo(thumb, url_key)

        converted.append({
            "id": url_key,
            "name": name,
            "theme": theme if theme and theme != name else None,
            "date": bj_ymd(start),
            "duration_days": duration_days(start, end),
            "city": city or None,
            "province": province,
            "qq_group": detail.get("qq_group"),
            "logo": logo,
            "country": "China",
            "district": None,
            "website": EVENT_URL + url_key,
            "place": place,
            "source": "fec",
        })

    # ---- 与现有手工数据合并（按 名字+日期 去重，FEC 数据优先）----
    old = json.load(open(DATA_PATH, encoding="utf-8"))
    existing = old.get("meetups", [])

    def key_of(m):
        return (re.sub(r"\s+", "", str(m.get("name") or "")), str(m.get("date") or ""))

    fec_keys = {key_of(m) for m in converted}
    fec_ids = {str(m["id"]) for m in converted}
    kept = [m for m in existing
            if key_of(m) not in fec_keys and str(m.get("id")) not in fec_ids]
    merged = kept + converted
    merged.sort(key=lambda m: str(m.get("date") or "9999"))

    result = {
        "meta": {
            "lastUpdated": datetime.now(CN_TZ).strftime("%Y-%m-%d"),
            "source": "FEC·兽展日历 (furrycons.cn) 自动同步",
        },
        "meetups": merged,
    }

    print("原 %d 场 -> 合并后 %d 场（保留旧 %d + FEC 新 %d）"
          % (len(existing), len(merged), len(kept), len(converted)))

    out = json.dumps(result, ensure_ascii=False, indent=2).replace("\n", "\r\n")
    if dry_run:
        print("[dry-run] 未写盘")
        return

    with open(DATA_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(out)
    print("已写入:", DATA_PATH)
    if cache:
        with open(CACHE_PATH, "w", encoding="utf-8", newline="") as f:
            f.write(json.dumps(cache, ensure_ascii=False, indent=2))
            f.write("\n")
        print("已写入:", CACHE_PATH, "(%d 条详情缓存)" % len(cache))


if __name__ == "__main__":
    sys.exit(main())
