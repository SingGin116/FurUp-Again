#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FurUp 跨端进度同步（Windows <-> PUBLIC(FAT32) <-> macOS）

用法:
    python3 scripts/sync_public.py check       # 比对本地与 PUBLIC，列差异（0=一致 1=有差异）
    python3 scripts/sync_public.py push       # 本地 -> PUBLIC
    python3 scripts/sync_public.py pull       # PUBLIC -> 本地
    python3 scripts/sync_public.py check -v   # 详细列出每个差异文件

可选:
    --public PATH    手工指定 PUBLIC 盘路径
    --root PATH      手工指定本地 Web 项目根目录
    --delete         push/pull 时同时删除对端多余文件（默认只新增/覆盖，不删）
    --no-mirror      不生成 WORKSPACE-MEMORY 记忆镜像

为什么用 SHA-256 而不是修改时间:
    FAT32 时间戳精度只有 2 秒、且存的是不带时区的本地时间，Windows 与 macOS
    对时区/夏令时的解释不同，同一份文件拷过去 mtime 可能差 8 小时。
    只有内容哈希可靠。

为什么不同步 .git / avatars:
    PUBLIC 分区只有 127 MB，完整仓库约 693 MB 物理上放不下。
    git 历史和 avatars/ 头像都在 GitHub 仓库里，macOS 端 clone 一次即可补齐。
    备份(*.bak*)、拼图/头像图片、大 zip 同样留在 Windows 端。

仅用标准库，Windows / macOS 均可直接运行（用 python3 调用，不要依赖可执行位：
FAT32 不保留 Unix 权限位）。
"""

import argparse
import datetime as dt
import hashlib
import json
import os
import platform
import shutil
import string
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_ROOT = os.path.dirname(HERE)          # .../FurUp-Again-Web
DESKTOP = os.path.dirname(DEFAULT_ROOT)       # .../Desktop
WEB_NAME = "FurUp-Again-Web"
TOOLS_NAME = "FurUp-爬虫工具"
MIRROR_NAME = "WORKSPACE-MEMORY"

# 目录级排除（点开头的隐藏目录默认排除，但 .github/.workbuddy 必须保留）
EXCLUDE_DIRS = {
    ".git", "avatars", "node_modules", "__pycache__", ".venv", "venv",
    "playwright-debug", ".idea", ".vscode", ".pytest_cache",
}
KEEP_DOT_DIRS = {".github", ".workbuddy"}

# 文件级排除
EXCLUDE_SUFFIX = (".pyc", ".pyo", ".log", ".zip", ".7z", ".rar", ".tmp", ".swp")
TOOLS_TEXT_EXT = {".py", ".sh", ".bat", ".cmd", ".md", ".csv", ".txt", ".jsonl", ".json"}

# macOS 在 FAT32 上会拉出这些垃圾，不参与比对也不同步
JUNK_NAMES = {".DS_Store", "Thumbs.db", "desktop.ini", ".localized"}


def is_junk(name):
    low = name.lower()
    return (
        name in JUNK_NAMES
        or name.startswith("._")
        or name.startswith(".tmp-")
        or low.endswith(EXCLUDE_SUFFIX)
        or ".bak-" in low
        or low.endswith(".bak")
    )


def norm(rel):
    return rel.replace("\\", "/")


def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def scan_web(root):
    """扫描 Web 项目工作区：全部文件，排除 .git/avatars/备份/垃圾。"""
    out = {}
    if not os.path.isdir(root):
        return out
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            d for d in dirnames
            if d in KEEP_DOT_DIRS or (d not in EXCLUDE_DIRS and not d.startswith("."))
        ]
        for fn in filenames:
            if is_junk(fn):
                continue
            full = os.path.join(dirpath, fn)
            rel = norm(os.path.relpath(full, root))
            out.setdefault(rel.lower(), {"rel": rel, "path": full,
                                         "size": os.path.getsize(full)})
    return out


def scan_tools(root):
    """扫描爬虫工具：只带 scripts/ 与 artifacts/ 里的清单文本，跳过图片与备份。"""
    out = {}
    for sub in ("scripts", "artifacts"):
        base = os.path.join(root, sub)
        if not os.path.isdir(base):
            continue
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [
                d for d in dirnames
                if d not in EXCLUDE_DIRS and not d.startswith(".")
            ]
            for fn in filenames:
                if is_junk(fn):
                    continue
                ext = os.path.splitext(fn)[1].lower()
                if ext not in TOOLS_TEXT_EXT:
                    continue
                full = os.path.join(dirpath, fn)
                if ext == ".json" and os.path.getsize(full) > 1024 * 1024:
                    continue  # 大 json 是中间产物，留在 Windows 端
                rel = norm(os.path.join(sub, os.path.relpath(full, base)))
                out.setdefault(rel.lower(), {"rel": rel, "path": full,
                                             "size": os.path.getsize(full)})
    return out


def find_public():
    """按卷标找 PUBLIC 盘：macOS 用 /Volumes/PUBLIC，Windows 扫 A-Z。"""
    if sys.platform == "darwin":
        for p in ("/Volumes/PUBLIC", "/Volumes/public"):
            if os.path.isdir(p):
                return p
        return None
    try:
        import ctypes
        from ctypes import wintypes
        k32 = ctypes.WinDLL("kernel32", use_last_error=True)
        label = ctypes.create_unicode_buffer(261)
        fs = ctypes.create_unicode_buffer(261)
        serial, maxlen, flags = wintypes.DWORD(), wintypes.DWORD(), wintypes.DWORD()
        for letter in string.ascii_uppercase:
            root = letter + ":\\"
            if k32.GetDriveTypeW(ctypes.c_wchar_p(root)) == 1:
                continue
            ok = k32.GetVolumeInformationW(
                ctypes.c_wchar_p(root), label, 261,
                ctypes.byref(serial), ctypes.byref(maxlen),
                ctypes.byref(flags), fs, 261,
            )
            if ok and label.value.strip().upper() == "PUBLIC":
                return root
    except Exception:
        pass
    return None


def free_bytes(path):
    try:
        return shutil.disk_usage(path).free
    except Exception:
        return None


def human(n):
    return "%.1f MB" % (n / 1048576.0) if n is not None else "?"


def load_hashes(entries):
    for e in entries.values():
        e["hash"] = sha256_file(e["path"])
    return entries


def diff(local, public):
    lk, pk = set(local), set(public)
    only_local = [local[k]["rel"] for k in sorted(lk - pk)]
    only_public = [public[k]["rel"] for k in sorted(pk - lk)]
    changed = sorted(
        k for k in (lk & pk) if local[k]["hash"] != public[k]["hash"]
    )
    return only_local, only_public, changed


def copy_files(src, dst, keys, label):
    total = 0
    for k in keys:
        e = src[k]
        target = os.path.join(dst, e["rel"])
        os.makedirs(os.path.dirname(target), exist_ok=True)
        shutil.copy2(e["path"], target)
        total += e["size"]
    print("  %s: 复制 %d 个文件 (%s)" % (label, len(keys), human(total)))
    return total


def mirror_memory(web_root, public):
    """把 .workbuddy/memory 镜像成非隐藏目录，解决 macOS Finder 看不到点文件夹。"""
    src = os.path.join(web_root, ".workbuddy", "memory")
    if not os.path.isdir(src):
        print("  (本地没有 .workbuddy/memory，跳过记忆镜像)")
        return
    dst = os.path.join(public, MIRROR_NAME)
    logs = os.path.join(dst, "logs")
    os.makedirs(logs, exist_ok=True)
    n = 0
    for fn in os.listdir(src):
        if not fn.endswith(".md"):
            continue
        s = os.path.join(src, fn)
        d = os.path.join(logs if fn[:2] == "20" else dst, fn)
        shutil.copy2(s, d)
        n += 1
    print("  记忆镜像: %s <- %d 个 md 文件" % (dst, n))


def read_counts(web_root):
    info = {}
    try:
        d = json.load(open(os.path.join(web_root, "data", "users.json"), encoding="utf-8"))
        info["usersCount"] = len(d.get("users", []))
        info["usersMetaTotal"] = d.get("meta", {}).get("totalUsers")
    except Exception:
        pass
    try:
        d = json.load(open(os.path.join(web_root, "data", "meetups.json"), encoding="utf-8"))
        info["meetupsCount"] = len(d.get("meetups", []))
        info["meetupsUpdated"] = d.get("meta", {}).get("lastUpdated")
    except Exception:
        pass
    return info


def git_head(web_root):
    head = os.path.join(web_root, ".git", "HEAD")
    try:
        txt = open(head, encoding="utf-8").read().strip()
        if txt.startswith("ref: "):
            p = os.path.join(web_root, ".git", txt[5:])
            if os.path.exists(p):
                return open(p, encoding="utf-8").read().strip()
        return txt
    except Exception:
        return None


def write_state(public, web_root, pairs, origin):
    state = {
        "schema": 1,
        "lastSync": dt.datetime.now().astimezone().isoformat(timespec="seconds"),
        "syncedFrom": origin,
        "publicVolume": "PUBLIC (FAT32)",
        "gitHead": git_head(web_root),
        "readCounts": read_counts(web_root),
        "projects": {},
        "note": "开工前先跑 check；PUBLIC 只有 127MB，故不含 .git / avatars / *.bak / 图片拼图。",
    }
    for name, local, pub, _ in pairs:
        entries = scan_web(local) if name == WEB_NAME else scan_tools(local)
        state["projects"][name] = {
            "files": len(entries),
            "bytes": sum(e["size"] for e in entries.values()),
        }
    with open(os.path.join(public, "SYNC-STATE.json"), "w", encoding="utf-8", newline="") as f:
        f.write(json.dumps(state, ensure_ascii=False, indent=2).replace("\n", "\r\n"))
        f.write("\n")
    return state


def main():
    ap = argparse.ArgumentParser(description="FurUp 跨端进度同步")
    ap.add_argument("action", choices=["check", "push", "pull"])
    ap.add_argument("--public")
    ap.add_argument("--root", default=DEFAULT_ROOT)
    ap.add_argument("--delete", action="store_true")
    ap.add_argument("--no-mirror", action="store_true")
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()

    web_root = os.path.abspath(a.root)
    tools_root = os.path.join(os.path.dirname(web_root), TOOLS_NAME)
    public = a.public or find_public()
    if not public or not os.path.isdir(public):
        print("找不到 PUBLIC 盘，请用 --public 指定路径。", file=sys.stderr)
        return 2
    public = os.path.abspath(public)

    # 提醒：如果直接在 PUBLIC 副本里运行，就没有「两份」可比
    if os.path.normcase(web_root).startswith(os.path.normcase(public)):
        print("提示：你正在 PUBLIC 盘上的副本里干活，Windows/macOS 另一端跑 check 即可看到差异。")

    pub_web = os.path.join(public, WEB_NAME)
    pub_tools = os.path.join(public, TOOLS_NAME)
    pairs = [
        (WEB_NAME, web_root, pub_web, scan_web),
        (TOOLS_NAME, tools_root, pub_tools, scan_tools),
    ]

    print("PUBLIC 盘 : %s   可用 %s" % (public, human(free_bytes(public))))
    print("本地工作区: %s" % web_root)
    print("比对方式  : SHA-256 内容哈希（不用 mtime，FAT32 时间戳不可靠）")
    print()

    any_diff = False
    tot_l = tot_p = tot_c = 0
    for name, local, pub, scanner in pairs:
        L = load_hashes(scanner(local))
        P = load_hashes(scanner(pub)) if os.path.isdir(pub) else {}
        only_l, only_p, changed = diff(L, P)
        flag = (only_l or only_p or changed)
        any_diff = any_diff or bool(flag)
        tot_l += len(only_l)
        tot_p += len(only_p)
        tot_c += len(changed)
        print("[%s] 本地 %d 个 / %s   |   PUBLIC %d 个 / %s" % (
            name, len(L), human(sum(e['size'] for e in L.values())),
            len(P), human(sum(e['size'] for e in P.values()))))

        if not flag:
            print("  = 一致")
        else:
            print("  仅本地有 %d | 仅 PUBLIC 有 %d | 内容不同 %d" % (
                len(only_l), len(only_p), len(changed)))
            show = (only_l + only_p + [L[k]["rel"] for k in changed])
            for r in (show if a.verbose else show[:8]):
                tag = ("本地多" if r in only_l else "PUBLIC多" if r in only_p else "内容不同")
                print("    - [%s] %s" % (tag, r))
            if not a.verbose and len(show) > 8:
                print("    ... 还有 %d 个，加 -v 看全部" % (len(show) - 8))

        if a.action == "push":
            todo = sorted(set(L) - set(P)) + changed
            if todo:
                need = sum(L[k]["size"] for k in todo)
                free = free_bytes(public)
                if free is not None and need > free - 2 * 1048576:
                    print("  ✗ 空间不足：需要 %s，可用 %s" % (human(need), human(free)))
                    return 3
                copy_files(L, pub, todo, "本地 -> PUBLIC")
            else:
                print("  无需复制")
            if a.delete and only_p:
                for k in sorted(set(P) - set(L)):
                    os.remove(P[k]["path"])
                print("  删除 PUBLIC 多余文件 %d 个" % len(only_p))

        elif a.action == "pull":
            todo = sorted(set(P) - set(L)) + changed
            if todo:
                copy_files(P, local, todo, "PUBLIC -> 本地")
            else:
                print("  无需复制")
            if a.delete and only_l:
                for k in sorted(set(L) - set(P)):
                    os.remove(L[k]["path"])
                print("  删除本地多余文件 %d 个" % len(only_l))
        print()

    if a.action in ("push", "pull"):
        origin = "Windows" if platform.system() == "Windows" else platform.system()
        if not a.no_mirror:
            mirror_memory(web_root if a.action == "push" else pub_web, public)
        st = write_state(public, web_root if a.action == "push" else pub_web,
                         pairs, origin)
        print("状态锚点 SYNC-STATE.json 已更新: %s | git=%s | users=%s | meetups=%s" % (
            st["lastSync"], (st["gitHead"] or "-")[:8],
            st["readCounts"].get("usersCount"), st["readCounts"].get("meetupsCount")))
        return 0

    if any_diff:
        print("⚠️  两边进度不一致，先别闷头改（可用 check -v 看具体文件）：")
        if tot_p or tot_c:
            print("    PUBLIC 上有另一端的改动 (%d 新增 / %d 内容不同) → 先跑 pull 拉回本地"
                  % (tot_p, tot_c))
        if tot_l:
            print("    本地有未同步的改动 (%d 个) → 干完活跑 push 同步到 PUBLIC" % tot_l)
        print("    两边都有改动时：先 pull 再 push，不会互相覆盖。")
        return 1
    print("✅ 两边一致，可以放心继续干活。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
