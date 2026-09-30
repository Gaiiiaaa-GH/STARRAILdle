"""Builds src/data/characters.json.

Combines three sources:
- Mar-7th/StarRailRes: names, element, path, rarity, abilities, weekly boss material.
- scripts/fiches.json: everything entered by hand (version, gender, world,
  factions, lore paths, name overrides, weekly boss names). Edited through a
  local update tool, or by hand.
- scripts/wiki_research/merged_quotes.json: researched voice lines.

It never downloads images and never invents data: a character without a fiche,
or whose images haven't been accepted into public/assets yet, is skipped and
listed at the end.
"""
import json
import os
import urllib.request

BASE_URL = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/"
HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(HERE, "..", "public")
DATA_DIR = os.path.join(HERE, "..", "src", "data")

# Female Trailblazer ids duplicate the male ones (one entry per Path form).
EXCLUDE_IDS = {"8002", "8004", "8006", "8008", "8010"}
KNOWN_SKILL_TYPES = {"Basic ATK", "Skill", "Ultimate", "Talent", "Technique"}


def load_json(*parts):
    with open(os.path.join(HERE, *parts), encoding="utf-8") as f:
        return json.load(f)


def fetch_json(endpoint):
    req = urllib.request.Request(BASE_URL + endpoint, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def asset_exists(rel_path):
    return os.path.isfile(os.path.join(PUBLIC_DIR, rel_path))


FICHES = load_json("fiches.json")
BOSSES, PERSOS = FICHES["bosses"], FICHES["persos"]
QUOTES_RESEARCH = load_json("wiki_research", "merged_quotes.json")

print("Fetching data from StarRailRes...")
chars_en = fetch_json("index_new/en/characters.json")
chars_fr = fetch_json("index_new/fr/characters.json")
paths_en = fetch_json("index_new/en/paths.json")
paths_fr = fetch_json("index_new/fr/paths.json")
elements_en = fetch_json("index_new/en/elements.json")
elements_fr = fetch_json("index_new/fr/elements.json")
items_en = fetch_json("index_new/en/items.json")
items_fr = fetch_json("index_new/fr/items.json")
skill_trees = fetch_json("index_new/en/character_skill_trees.json")
skills_en = fetch_json("index_new/en/character_skills.json")
skills_fr = fetch_json("index_new/fr/character_skills.json")

# Weekly boss material per character, read from its trace upgrade costs.
char_weekly_map = {}
for st_id, st_data in skill_trees.items():
    for lvl in st_data.get("levels", []):
        for mat in lvl.get("materials", []):
            mid = mat.get("id")
            if mid and mid.startswith("1105"):
                char_weekly_map[st_id[:4]] = mid

processed_characters = []
skipped = []

for cid in sorted(chars_en.keys(), key=int):
    if cid in EXCLUDE_IDS:
        continue
    c_en = chars_en[cid]
    c_fr = chars_fr.get(cid, {})
    fiche = PERSOS.get(cid)
    label = f"{c_fr.get('name') or c_en.get('name')} ({cid})"
    if fiche is None:
        skipped.append(f"{label}: pas de fiche")
        continue

    name_en = fiche.get("name_en") or c_en.get("name")
    name_fr = fiche.get("name_fr") or c_fr.get("name", name_en)
    elem_id = c_en.get("element")
    path_id = c_en.get("path")

    wb_id = char_weekly_map.get(cid)
    if wb_id not in BOSSES:
        skipped.append(f"{label}: boss hebdo inconnu ({wb_id}), à ajouter dans fiches.json > bosses")
        continue
    wb_info = BOSSES[wb_id]

    quotes = QUOTES_RESEARCH.get(cid) or ([fiche["quote_fallback"]] if fiche.get("quote_fallback") else None)
    if not quotes:
        skipped.append(f"{label}: aucune citation")
        continue

    # StarRailRes names these fields backwards: its "preview" is the tight
    # bust crop (-> our Portrait mode), its "portrait" is the big splash scene.
    avatar_path = f"assets/icons/{cid}.png"
    portrait_path = f"assets/portraits/{cid}.webp" if c_en.get("preview") else None
    splash_art_path = f"assets/splash_art/{cid}.webp" if c_en.get("portrait") else None
    element_icon = f"assets/type_icons/elements/{elem_id.lower()}.png" if elem_id else ""
    path_icon = f"assets/type_icons/paths/{path_id.lower()}.png" if path_id else ""
    boss_icon = f"assets/type_icons/bosses/{wb_id}.png"

    # One ability per real type, deduped (see SkillMode.tsx).
    skill_hints = []
    seen_types = set()
    for sk_id in c_en.get("skills", []):
        sk_en = skills_en.get(sk_id, {})
        sk_type = sk_en.get("type_text", "")
        if sk_type not in KNOWN_SKILL_TYPES or sk_type in seen_types or not sk_en.get("icon"):
            continue
        seen_types.add(sk_type)
        skill_hints.append({
            "icon": f"assets/skills/{cid}_{sk_id}.png",
            "name_en": sk_en.get("name"),
            "name_fr": skills_fr.get(sk_id, {}).get("name", sk_en.get("name")),
            "type": sk_type,
        })

    needed = [avatar_path, portrait_path, splash_art_path, element_icon, path_icon, boss_icon] + [s["icon"] for s in skill_hints]
    missing = [p for p in needed if p and not asset_exists(p)]
    if missing:
        skipped.append(f"{label}: images pas encore acceptées ({', '.join(m.split('assets/')[1] for m in missing)})")
        continue

    processed_characters.append({
        "id": cid,
        "name_en": name_en,
        "name_fr": name_fr,
        "tag": c_en.get("tag", ""),
        "rarity": c_en.get("rarity"),
        "gender": fiche["gender"],
        "element": {
            "id": elem_id.lower() if elem_id else "unknown",
            "name_en": elements_en.get(elem_id, {}).get("name", elem_id),
            "name_fr": elements_fr.get(elem_id, {}).get("name", elements_en.get(elem_id, {}).get("name", elem_id)),
            "icon": element_icon,
        },
        "path": {
            "id": path_id.lower() if path_id else "unknown",
            "name_en": paths_en.get(path_id, {}).get("name", path_id),
            "name_fr": paths_fr.get(path_id, {}).get("name", paths_en.get(path_id, {}).get("name", path_id)),
            "icon": path_icon,
        },
        "lore_paths": fiche["lore_paths"],
        "release_version": fiche["version"],
        "world_en": fiche["world"],
        "world_fr": fiche["world"],
        "factions_en": fiche["factions_en"],
        "factions_fr": fiche["factions_fr"],
        "weekly_boss": {
            "material_id": wb_id,
            "material_name_en": items_en.get(wb_id, {}).get("name", "Weekly Boss Material"),
            "material_name_fr": items_fr.get(wb_id, {}).get("name", items_en.get(wb_id, {}).get("name", "Weekly Boss Material")),
            "boss_name_en": wb_info["boss_name_en"],
            "boss_name_fr": wb_info["boss_name_fr"],
            "world_en": wb_info["world_en"],
            "world_fr": wb_info["world_fr"],
            "icon": boss_icon,
        },
        "avatar": avatar_path,
        "portrait": portrait_path,
        "splash_art": splash_art_path,
        "quotes": quotes,
        "skill_hints": skill_hints or [{
            "icon": avatar_path,
            "name_en": f"{name_en}'s Power",
            "name_fr": f"Pouvoir de {name_fr}",
            "type": "Skill",
        }],
    })

unknown = sorted(set(PERSOS) - set(chars_en), key=int)
if unknown:
    skipped.append(f"fiches sans perso dans StarRailRes : {', '.join(unknown)}")

out_path = os.path.join(DATA_DIR, "characters.json")
with open(out_path, "w", encoding="utf-8", newline="\n") as f:
    json.dump(processed_characters, f, indent=2, ensure_ascii=False)

print(f"{len(processed_characters)} personnages écrits dans {os.path.normpath(out_path)}")
if skipped:
    print(f"{len(skipped)} ignoré(s) :")
    for s in skipped:
        print(f"  - {s}")
