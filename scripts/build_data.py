import os
import json
import urllib.request
import urllib.error
import time

BASE_URL = "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/"

# Factions + narrative "lore path" per character, researched from the community
# wiki (honkai-star-rail.fandom.com infobox `faction`/`pathlore` fields) and
# merged/normalized by scripts/merge_wiki_research.js. Overrides the generic
# CHARACTER_METADATA factions below with real, specific sub-affiliations.
WIKI_RESEARCH_PATH = os.path.join(os.path.dirname(__file__), "wiki_research", "merged.json")
with open(WIKI_RESEARCH_PATH, "r", encoding="utf-8") as f:
    WIKI_RESEARCH = json.load(f)

# Real, verified voice lines per character (4-5 each), researched from the
# wiki's Voice-Over pages and merged/normalized by scripts/merge_quotes.js.
# Replaces the single hand-invented quote_en/quote_fr below.
QUOTES_RESEARCH_PATH = os.path.join(os.path.dirname(__file__), "wiki_research", "merged_quotes.json")
with open(QUOTES_RESEARCH_PATH, "r", encoding="utf-8") as f:
    QUOTES_RESEARCH = json.load(f)

# Trailblazer's canonical lore path across every combat form: the Nameless /
# Astral Express Crew embody Akivili's Path of Trailblaze regardless of which
# playable Path form is active (Destruction/Preservation/Harmony/Remembrance/Elation).
TRAILBLAZE_LORE_PATH = [{"id": "trailblaze", "name_en": "Trailblaze", "name_fr": "Le Pionnier"}]

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "assets")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "src", "data")

os.makedirs(os.path.join(PUBLIC_DIR, "characters"), exist_ok=True)
os.makedirs(os.path.join(PUBLIC_DIR, "paths"), exist_ok=True)
os.makedirs(os.path.join(PUBLIC_DIR, "elements"), exist_ok=True)
os.makedirs(os.path.join(PUBLIC_DIR, "bosses"), exist_ok=True)
os.makedirs(os.path.join(PUBLIC_DIR, "skills"), exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

def fetch_json(endpoint):
    url = BASE_URL + endpoint
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def download_file(rel_path, dest_path):
    if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
        return
    url = BASE_URL + rel_path
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(dest_path, 'wb') as f:
            f.write(resp.read())
    except Exception as e:
        print(f"Failed to download {url}: {e}")

print("Fetching raw data from StarRailRes...")
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

# Boss info mapping
BOSS_INFO = {
    "110501": {
        "boss_name_en": "Doomsday Beast",
        "boss_name_fr": "Bête de l'apocalypse",
        "world_en": "Herta Space Station",
        "world_fr": "Station spatiale Herta",
        "echo_of_war_en": "Destruction's Beginning",
        "echo_of_war_fr": "Début de la destruction"
    },
    "110502": {
        "boss_name_en": "Cocolia, Mother of Deception",
        "boss_name_fr": "Cocolia, Mère de la tromperie",
        "world_en": "Jarilo-VI",
        "world_fr": "Jarilo-VI",
        "echo_of_war_en": "End of the Eternal Freeze",
        "echo_of_war_fr": "Fin du gel éternel"
    },
    "110503": {
        "boss_name_en": "Phantylia the Undying",
        "boss_name_fr": "Phantylia l'Immortelle",
        "world_en": "Xianzhou Luofu",
        "world_fr": "Xianzhou Luofu",
        "echo_of_war_en": "Divine Seed",
        "echo_of_war_fr": "Graine divine"
    },
    "110504": {
        "boss_name_en": "Starcrusher Swarm King: Skaracabaz",
        "boss_name_fr": "Skaracabaz, roi de l'Essaim",
        "world_en": "Herta Space Station",
        "world_fr": "Station spatiale Herta",
        "echo_of_war_en": "Borehole Planet Disaster",
        "echo_of_war_fr": "Désastre de la planète forage"
    },
    "110505": {
        "boss_name_en": "\"Harmonious Choir\" The Great Septimus",
        "boss_name_fr": "« Chœur harmonieux » Le Grand Septimus",
        "world_en": "Penacony",
        "world_fr": "Penacony",
        "echo_of_war_en": "Salutations of Ashen Dreams",
        "echo_of_war_fr": "Salutations des rêves de cendre"
    },
    "110506": {
        "boss_name_en": "Shadow of \"Feixiao\"",
        "boss_name_fr": "Ombre de « Feixiao »",
        "world_en": "Xianzhou Luofu",
        "world_fr": "Xianzhou Luofu",
        "echo_of_war_en": "Inner Beast's Battlefield",
        "echo_of_war_fr": "Champ de bataille de la bête intérieure"
    },
    "110507": {
        "boss_name_en": "Iron Tomb",
        "boss_name_fr": "Tombeau de Fer",
        "world_en": "Amphoreus",
        "world_fr": "Amphoreus",
        "echo_of_war_en": "Daythunder Tempest",
        "echo_of_war_fr": "Tempête d'orage diurne"
    },
    "110508": {
        "boss_name_en": "Tide of Strife",
        "boss_name_fr": "Marée des conflits",
        "world_en": "Amphoreus",
        "world_fr": "Amphoreus",
        "echo_of_war_en": "Vanquished Flow",
        "echo_of_war_fr": "Courant vaincu"
    },
    "110509": {
        "boss_name_en": "Ode of False Light",
        "boss_name_fr": "Ode de la Fausse Lumière",
        "world_en": "Amphoreus",
        "world_fr": "Amphoreus",
        "echo_of_war_en": "Falsely Enlightened",
        "echo_of_war_fr": "Faux Éveillé"
    }
}

# Map characters to weekly boss material from skill trees
char_weekly_map = {}
for st_id, st_data in skill_trees.items():
    cid = st_id[:4]
    for lvl in st_data.get('levels', []):
        for mat in lvl.get('materials', []):
            mid = mat.get('id')
            if mid and mid.startswith('1105'):
                char_weekly_map[cid] = mid

# Known character metadata enrichment: Release version, Gender, Factions, World, Archetypes, Quotes
CHARACTER_METADATA = {
    # 1.0
    "1001": {"version": "1.0", "gender": "Female", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Six-Phased Ice"], "archetypes": ["Shield", "Follow-up", "Freeze"], "quote_fr": "Regardez-moi ça ! Souriez !", "quote_en": "Check out this awesome move!"},
    "1002": {"version": "1.0", "gender": "Male", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "High-Cloud Quintet"], "archetypes": ["Crit Hypercarry", "Slow / Debuff"], "quote_fr": "Cette fois-ci, c'est différent.", "quote_en": "This sanctuary is but a vision... Break!"},
    "1003": {"version": "1.0", "gender": "Female", "world": "Astral Express", "factions": ["Astral Express", "Nameless"], "archetypes": ["Follow-up", "AoE / Erudition", "Burn"], "quote_fr": "L'humanité ne cache jamais son désir de contrôler les cieux.", "quote_en": "Humanity never conceals its desire to control the heavens."},
    "1004": {"version": "1.0", "gender": "Male", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Anti-Entropy"], "archetypes": ["Slow / Debuff", "Imprisonment", "Vulnerability"], "quote_fr": "Survivez ou soyez détruits, le choix n'appartient qu'à vous.", "quote_en": "Survive or be destroyed, there is no other choice."},
    "1008": {"version": "1.0", "gender": "Male", "world": "Herta Space Station", "factions": ["Herta Space Station", "Security Department"], "archetypes": ["HP Consume", "Crit Hypercarry"], "quote_fr": "Je protégerai tout le monde !", "quote_en": "I will protect everyone!"},
    "1009": {"version": "1.0", "gender": "Female", "world": "Herta Space Station", "factions": ["Herta Space Station", "Lead Researcher"], "archetypes": ["Speed Buff", "ATK Buff", "Fire Boost"], "quote_fr": "Que les étoiles vous bénissent !", "quote_en": "Let the stars bless you!"},
    "1013": {"version": "1.0", "gender": "Female", "world": "Herta Space Station", "factions": ["Genius Society", "Herta Space Station", "The Erudition"], "archetypes": ["Follow-up", "Kuru Kuru", "AoE / Erudition", "Freeze"], "quote_fr": "Il est temps de faire tourner la chance ! Kuru Kuru !", "quote_en": "Time to twirl! Kuru kuru~"},
    "1101": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Silvermane Guards", "Supreme Guardian"], "archetypes": ["Action Advance", "ATK Buff", "Crit DMG Buff", "Cleanse"], "quote_fr": "Que le vent de l'hiver balaye nos ennemis !", "quote_en": "To guard and defend, crush them!"},
    "1102": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Wildfire", "Underworld"], "archetypes": ["Resurgence", "Crit Hypercarry", "Speed"], "quote_fr": "Disparais dans une mer de papillons !", "quote_en": "Disappear among the sea of butterflies, illusions of the past!"},
    "1103": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Silvermane Guards", "Landau Family"], "archetypes": ["DoT / Shock", "Erudition AoE"], "quote_fr": "Faisons vibrer cette scène !", "quote_en": "Let's turn up the volume!"},
    "1104": {"version": "1.0", "gender": "Male", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Silvermane Guards", "Landau Family"], "archetypes": ["Team Shield", "Freeze / Crowd Control", "Taunt"], "quote_fr": "En l'honneur des Gardes de la crinière d'argent, je tiendrai !", "quote_en": "In the name of Landau, a shield that never yields!"},
    "1105": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Wildfire", "Underworld"], "archetypes": ["Heal / Sustain", "Cleanse", "Emergency Heal"], "quote_fr": "Prenez ce médicament, vous irez mieux.", "quote_en": "Listen to your doctor, take your medicine!"},
    "1106": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Silvermane Guards", "Intelligence Officer"], "archetypes": ["DEF Shred", "AoE Debuff", "Dispel"], "quote_fr": "Données analysées, point faible localisé !", "quote_en": "Target analyzed, executing strike!"},
    "1107": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Svarog", "Underworld"], "archetypes": ["Counter / Follow-up", "Damage Reduction", "Taunt"], "quote_fr": "Monsieur Svarog, protégez-moi !", "quote_en": "Mr. Svarog, please help me!"},
    "1108": {"version": "1.0", "gender": "Male", "world": "Jarilo-VI", "factions": ["Masked Fools", "Jarilo-VI", "Underworld"], "archetypes": ["DoT / Wind Shear", "Vulnerability", "Blind"], "quote_fr": "Faites confiance à Sampo Koski, votre ami loyal !", "quote_en": "Trust Sampo, customer always comes first!"},
    "1109": {"version": "1.0", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "The Moles", "Underworld"], "archetypes": ["DoT / Burn", "Single Target Burst"], "quote_fr": "La Grande Hook Sombre ne perd jamais !", "quote_en": "Pitch-Dark Hook the Great will teach you a lesson!"},
    "1201": {"version": "1.0", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Divination Commission"], "archetypes": ["Tile Draw / Gambling", "AoE / Erudition", "Crit Burst"], "quote_fr": "Victoire par Mahjong ! Un tirage parfait !", "quote_en": "Mahjong victory! A hidden hand strikes!"},
    "1202": {"version": "1.0", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Sky-Faring Commission", "Whistling Flames"], "archetypes": ["Energy Recharge", "ATK Buff", "DMG Buff"], "quote_fr": "Bienfaiteurs, recevez ma modeste bénédiction.", "quote_en": "Benefactor, allow me to lend you strength."},
    "1204": {"version": "1.0", "gender": "Male", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Cloud Knights", "High-Cloud Quintet", "Seven Arbiter-Generals"], "archetypes": ["Follow-up", "Lightning Lord", "AoE / Erudition"], "quote_fr": "Que le Seigneur foudroyant s'abatte sur les hérétiques !", "quote_en": "Time for the master stroke! Lightning Lord, strike!"},
    "1206": {"version": "1.0", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Cloud Knights"], "archetypes": ["Physical Break", "Sword Stance Burst", "Action Advance"], "quote_fr": "Prenez garde au coup de mon épée céleste !", "quote_en": "Rise, Phoenix! My sword strikes true!"},
    "1209": {"version": "1.0", "gender": "Male", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Cloud Knights"], "archetypes": ["Freeze", "Crit Hypercarry", "Soulsteel Jolt"], "quote_fr": "Lames volantes, formez le cercle !", "quote_en": "Swords, dance at my command!"},
    "1211": {"version": "1.0", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Alchemy Commission", "Vidyadhara High Elder"], "archetypes": ["Heal / Sustain", "Revive", "Invigoration"], "quote_fr": "Buvez cette tisane et faites de beaux rêves !", "quote_en": "Good medicine tastes bitter, but this will cure you!"},
    
    # 1.1
    "1005": {"version": "1.1", "gender": "Female", "world": "Punklorde", "factions": ["Stellaron Hunters", "Punklorde"], "archetypes": ["Weakness Implant", "DEF Shred", "All-Type RES Shred", "Debuff"], "quote_fr": "C'est juste un jeu, et je gagne toujours.", "quote_en": "Can this game get any more interesting?"},
    "1203": {"version": "1.1", "gender": "Male", "world": "Xianzhou Luofu", "factions": ["Intergalactic Merchant", "Abundance Followers"], "archetypes": ["Auto-Heal / Field", "Dispel", "Cleanse", "Heal / Sustain"], "quote_fr": "Les morts reposent en paix, et les vivants persévèrent.", "quote_en": "The dead shall rest, the living shall proceed."},
    "1207": {"version": "1.1", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Sky-Faring Commission", "Helm Master"], "archetypes": ["Crit Rate Buff", "Crit DMG Buff", "ATK Buff", "Imaginary Break"], "quote_fr": "Volez au cœur du cyclone céleste !", "quote_en": "Ascend to the endless skies!"},
    
    # 1.2
    "1006": {"version": "1.2", "gender": "Female", "world": "Pteruges-V", "factions": ["Stellaron Hunters", "Destiny's Slave Followers"], "archetypes": ["DoT / Shock", "DoT Detonation", "Follow-up"], "quote_fr": "Boom. Ferme les yeux et écoute le violon.", "quote_en": "Boom. Listen to my tune..."},
    "1205": {"version": "1.2", "gender": "Male", "world": "Xianzhou Luofu", "factions": ["Stellaron Hunters", "High-Cloud Quintet", "Cloud Knights"], "archetypes": ["HP Consume", "Follow-up", "Crit Hypercarry", "Self-Heal"], "quote_fr": "Ce corps ne connaît pas la mort... seulement le tourment.", "quote_en": "That paradise may be unreachable for me... Savor it for me!"},
    "1111": {"version": "1.2", "gender": "Male", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Wildfire", "Underworld Fight Club"], "archetypes": ["DoT / Bleed", "Single Target Burst", "Vulnerability"], "quote_fr": "Mon poing d'acier va vous remettre les idées en place !", "quote_en": "Direct hit! Here comes the champion's right hook!"},
    
    # 1.3
    "1208": {"version": "1.3", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Divination Commission", "Master Diviner"], "archetypes": ["Damage Redirection / Mitigation", "Crit Rate Buff", "Crowd Control Immunity", "Heal / Sustain"], "quote_fr": "Les étoiles ont déjà scellé votre destin.", "quote_en": "The matrix predicts your every breath. Subside!"},
    "1213": {"version": "1.3", "gender": "Male", "world": "Xianzhou Luofu", "factions": ["Astral Express", "Xianzhou Luofu", "High-Cloud Quintet", "Vidyadhara High Elder"], "archetypes": ["3-SP Enhanced Basic", "Crit Hypercarry", "Imaginary Break"], "quote_fr": "Dragon azur, purifie les ténèbres !", "quote_en": "Roar, Azure Dragon! Cleanse the defiled realm!"},
    "1110": {"version": "1.3", "gender": "Female", "world": "Jarilo-VI", "factions": ["Jarilo-VI", "Landau Family", "Snow Plains Explorer"], "archetypes": ["Heal / Sustain", "Team Cleanse", "Max HP Buff", "Aggro Manipulation"], "quote_fr": "Je connais chaque coin de ces plaines enneigées !", "quote_en": "Ready for an expedition? Eat well, survive well!"},
    
    # 1.4
    "1212": {"version": "1.4", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "High-Cloud Quintet", "Cloud Knights Sword Champion"], "archetypes": ["Transcendence / Spectral State", "Action Advance", "Crit Hypercarry", "Freeze"], "quote_fr": "Que la lune de givre brise ce monde éphémère !", "quote_en": "Moonlight, illuminate my blade! Transcendent flash!"},
    "1112": {"version": "1.4", "gender": "Female", "world": "Pier Point", "factions": ["IPC", "Ten Stonehearts", "Strategic Investment Department"], "archetypes": ["Follow-up", "Follow-up Vulnerability", "Numby Action Advance", "Debt Collector"], "quote_fr": "Numby, déniche-moi ces mauvais payeurs !", "quote_en": "Numby, invest! Pay up what you owe!"},
    "1210": {"version": "1.4", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Street Performer", "Camelia Family"], "archetypes": ["DoT / Burn", "Firekiss / Vulnerability", "AoE Detonation"], "quote_fr": "Regardez bien, le spectacle d'artifice commence !", "quote_en": "Let's put on an unforgettable street show!"},
    
    # 1.5
    "1217": {"version": "1.5", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Ten-Lords Commission", "Foxian Judge Trainee"], "archetypes": ["Team Energy Recharge", "ATK Buff", "Turn-Start Cleanse", "Heal / Sustain"], "quote_fr": "Monsieur Tail, au secours ! Ne me laissez pas seule !", "quote_en": "Tail, lend me a hand! Don't let the ghosts get me!"},
    "1302": {"version": "1.5", "gender": "Male", "world": "A Nameless, War-Torn Homeworld", "factions": ["Knights of Beauty", "Idrila Followers"], "archetypes": ["Double Ultimate / Energy Burst", "AoE / Erudition", "Crit Burst"], "quote_fr": "Au nom de la Beauté suprême d'Idrila !", "quote_en": "For Idrila! May pure beauty illuminate this world!"},
    "1215": {"version": "1.5", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Ten-Lords Commission", "Netherworld Judge"], "archetypes": ["Skill Point Recovery", "Speed Buff", "ATK Buff", "Physical Vulnerability"], "quote_fr": "Le karma est gravé sur le parchemin des morts.", "quote_en": "Inscribe your sins upon the karmic tablet."},
    
    # 1.6
    "1303": {"version": "1.6", "gender": "Female", "world": "Herta Space Station", "factions": ["Genius Society", "Herta Space Station", "Simulated Universe Creator"], "archetypes": ["Weakness Break Efficiency", "All-Type RES PEN", "Speed Buff", "Break Re-trigger / Delay"], "quote_fr": "Chaque forme de vie possède une note harmonique parfaite.", "quote_en": "All things blossom and wither in the grand tapestry of life."},
    "1305": {"version": "1.6", "gender": "Male", "world": "Pier Point", "factions": ["Intelligentsia Guild", "IPC Partner", "Genius Candidate"], "archetypes": ["Follow-up", "Debuff Synergy", "Chalk Throw", "Crit Hypercarry"], "quote_fr": "Zéro pointé ! L'ignorance est la pire des maladies !", "quote_en": "Zero points! Ignorance is an incurable ailment!"},
    "1214": {"version": "1.6", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Ten-Lords Commission", "Judge Puppet"], "archetypes": ["Toughness Shred / All-Type", "Follow-up", "Quantum Break", "Karma Stacks"], "quote_fr": "Exécution de la sentence karmatique. Neutralisation !", "quote_en": "Execute punishment. Karmic retribution delivered!"},
    
    # 2.0
    "1307": {"version": "2.0", "gender": "Female", "world": "Penacony", "factions": ["Garden of Recollection", "Memokeeper", "Penacony Guest"], "archetypes": ["DoT / Arcana", "DEF Shred", "DoT Stacking / Epiphany"], "quote_fr": "Laissez vos souvenirs les plus doux vous consumer.", "quote_en": "Dance in the kaleidoscope of memories. Revel in Arcana!"},
    "1306": {"version": "2.0", "gender": "Female", "world": "Penacony", "factions": ["Masked Fools", "Aha Followers", "Penacony Guest"], "archetypes": ["Skill Point Expansion / Recovery", "Action Advance 50%", "Crit DMG Buff", "ATK Buff"], "quote_fr": "La vie est une comédie grandeur nature ! Riez !", "quote_en": "All the cosmos is a stage! Let's put on a real spectacle!"},
    "1312": {"version": "2.0", "gender": "Male", "world": "Penacony", "factions": ["Penacony", "The Reverie Hotel", "Nameless Bloodline"], "archetypes": ["Freeze", "Bounce Hits", "Action Delay"], "quote_fr": "Je vais nettoyer cet endroit jusqu'à ce qu'il brille !", "quote_en": "Luggage secured, room service delivered!"},
    
    # 2.1
    "1308": {"version": "2.1", "gender": "Female", "world": "Izumo", "factions": ["Self-Annihilator", "Galaxy Rangers", "IX Emissary"], "archetypes": ["Slashed Dream / Non-Energy Ultimate", "All-Type RES PEN", "Debuff Synergy", "Crit Hypercarry"], "quote_fr": "Je pleure la mort des défunts... Que la pluie s'abatte.", "quote_en": "I weep for the departed... Let the crimson rain fall!"},
    "1304": {"version": "2.1", "gender": "Male", "world": "Sigonia", "factions": ["IPC", "Ten Stonehearts", "Strategic Investment Department", "Avgin Tribe"], "archetypes": ["Stackable Team Shield", "Follow-up / Blind Bet", "Crit DMG Debuff", "Effect RES Buff"], "quote_fr": "Je mise tout sur cette main ! Rien ne va plus !", "quote_en": "All or nothing! The house always pays!"},
    "1301": {"version": "2.1", "gender": "Male", "world": "Penacony", "factions": ["Penacony", "Bloodhound Family", "History Fictionologists", "Enigmata Followers"], "archetypes": ["Break Effect Scaling", "Besotted / Break DMG Vulnerability", "Action Advance on Ult", "Heal / Sustain"], "quote_fr": "Une gorgée de vérité dans un verre de mensonges.", "quote_en": "Time to mix something special. Bottoms up!"},
    
    # 2.2
    "1309": {"version": "2.2", "gender": "Female", "world": "Penacony", "factions": ["Penacony", "The Family", "Oak Family", "Cosmic Pop Star"], "archetypes": ["Concerto / Team Action Advance 100%", "ATK Buff", "Additional Physical DMG", "Follow-up Synergy"], "quote_fr": "Écoutez ma voix ! Que l'harmonie résonne dans vos cœurs !", "quote_en": "Welcome to my world! Let every soul unite in song!"},
    "1315": {"version": "2.2", "gender": "Male", "world": "Aeragan-Epharshel", "factions": ["Galaxy Rangers", "Hunt Followers", "Cyborg Cowboy"], "archetypes": ["Physical Break / Pocket Trickshot", "Weakness Implant (Physical)", "Standoff Duel", "Break / Super Break"], "quote_fr": "Fils de flûte ! Rangez vos pétoires et préparez-vous au duel !", "quote_en": "Time to settle accounts, fudgehead! Quick draw!"},
    
    # 2.3
    "1310": {"version": "2.3", "gender": "Female", "world": "Glamoth", "factions": ["Stellaron Hunters", "Iron Cavalry of Glamoth", "SAM"], "archetypes": ["Super Break", "Complete Combustion / Speed 60", "Weakness Implant (Fire)", "Self-HP Consume / Heal"], "quote_fr": "J'embraserai les mers et détruirai tout sur mon passage !", "quote_en": "I will set the seas ablaze! Protocol SAM active!"},
    "1314": {"version": "2.3", "gender": "Female", "world": "Pier Point", "factions": ["IPC", "Ten Stonehearts", "Strategic Investment Department", "Bonajade Exchange"], "archetypes": ["Follow-up", "Debt Collector Contract", "Speed Buff", "Quantum AoE / Erudition"], "quote_fr": "Chaque désir a un prix. Quel est le vôtre ?", "quote_en": "Sign here. Greed is a virtue worth indulging in."},
    
    # 2.4
    "1221": {"version": "2.4", "gender": "Female", "world": "Xianzhou Zhuming", "factions": ["Xianzhou Zhuming", "Cloud Knights", "Flamewheel Octet", "Huaiyan Apprentice"], "archetypes": ["Parry / Counter / Follow-up", "Crit Hypercarry", "Taunt / Cull Slash"], "quote_fr": "L'épée parle pour moi ! Viens tester mon tranchant !", "quote_en": "Parry and strike! My blade knows no mercy!"},
    "1218": {"version": "2.4", "gender": "Male", "world": "Xianzhou Yaoqing", "factions": ["Xianzhou Yaoqing", "Cloud Knights", "Alchemy Healer / Strategist"], "archetypes": ["Ashen Roast / Vulnerability", "Ultimate DMG Debuff", "DoT / Burn", "AoE Field"], "quote_fr": "Un plat épicé pour embraser vos sens et vos faiblesses.", "quote_en": "A taste of spicy hotpot to boil away your defense!"},
    "1224": {"version": "2.4", "gender": "Female", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Xianzhou Swordmaster Trainee"], "archetypes": ["Master Bonding / Follow-up", "Crit DMG Buff", "Speed Buff", "Break Charge"], "quote_fr": "Maître, admirez mes nouvelles techniques de sabre !", "quote_en": "Master, observe! Double sword style, strike!"},
    
    # 2.5
    "1220": {"version": "2.5", "gender": "Female", "world": "Xianzhou Yaoqing", "factions": ["Xianzhou Yaoqing", "Cloud Knights", "Seven Arbiter-Generals", "Merlin's Claw"], "archetypes": ["Flying Aureus / Ultimate Stacking", "Follow-up", "Speed / Crit Hypercarry", "Weakness Bypass"], "quote_fr": "Je suis le vent de la victoire ! Nulle cible n'échappe à mes flèches !", "quote_en": "Victory is predetermined! Fly, arrows of the Yaoqing!"},
    "1222": {"version": "2.5", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Alchemy Commission", "Cauldron Master", "Foxian Healer"], "archetypes": ["Fuxia Summon / Follow-up Cleanse", "Break Vulnerability", "Super Break Synergy", "Heal / Sustain"], "quote_fr": "Que l'encens spirituel purifie votre corps et votre esprit.", "quote_en": "Smoky mists arise, cleanse every lingering affliction!"},
    "1223": {"version": "2.5", "gender": "Male", "world": "Xianzhou Yaoqing", "factions": ["Xianzhou Yaoqing", "Shadow Guard", "Feixiao Retainer"], "archetypes": ["Prey Mark / Departure State", "Follow-up", "Crit DMG Buff", "Single Target Burst"], "quote_fr": "Dans l'ombre, la cible est déjà abattue.", "quote_en": "Strike from the shadows. Target marked for termination."},
    
    # 2.6
    "1317": {"version": "2.6", "gender": "Female", "world": "Penacony", "factions": ["Galaxy Rangers", "Dazzling Ninja", "Hunt / Erudition Hybrid"], "archetypes": ["Super Break", "Color Seal Ninjutsu", "Break / AoE Bounce", "Weakness Bypass"], "quote_fr": "Ninjutsu cosmique ! Rappa déchaîne le graffiti shinobi !", "quote_en": "Cosmic Ninjutsu! Dazzling graffiti strikes the wicked!"},
    
    # 2.7
    "1313": {"version": "2.7", "gender": "Male", "world": "Penacony", "factions": ["Penacony", "The Family", "Oak Family", "Order Followers", "Astral Express Ally"], "archetypes": ["Action Advance 100%", "Energy Recharge", "Crit DMG Buff", "Summon Support"], "quote_fr": "Que l'ordre divin veille sur le repos de l'univers.", "quote_en": "May order bring eternal peace to the dreaming cosmos."},
    "1225": {"version": "2.7", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Luofu", "Sky-Faring Commission", "Whistling Flames", "Foxian Resurrected"], "archetypes": ["Cloudflame / Super Break", "DEF Shred", "Weakness Break Extension", "DoT / Fire"], "quote_fr": "La flamme qui s'éteint renaît avec un éclat plus ardent.", "quote_en": "From the ashes, a new brilliance awakens!"},
    
    # 3.0
    "1401": {"version": "3.0", "gender": "Female", "world": "Herta Space Station", "factions": ["Genius Society", "Herta Space Station", "The Erudition", "Emanator of Erudition"], "archetypes": ["AoE / Erudition", "Freeze / Ice Burst", "Follow-up", "Crit Hypercarry"], "quote_fr": "La véritable Herta se montre enfin. Admirez la perfection !", "quote_en": "Behold the true genius! The universe bends to knowledge!"},
    "1402": {"version": "3.0", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Castrum Kremnos", "Okhema Garment Guild"], "archetypes": ["Memosprite Garment Weaver", "Speed Scaling", "Lightning Remembrance", "Crit Hypercarry"], "quote_fr": "Tissez le fil d'or du destin céleste !", "quote_en": "Weave the golden threads of our immortal triumph!"},
    
    # 3.1
    "1403": {"version": "3.1", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Harmony"], "archetypes": ["Team DMG Amplification", "Action Advance", "Quantum Buff"], "quote_fr": "Que la fête commence sous les étoiles d'Amphoreus !", "quote_en": "Let joy echo across the amphitheater of stars!"},
    "1404": {"version": "3.1", "gender": "Male", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Destruction Warrior"], "archetypes": ["HP Consume", "Crit Hypercarry", "Imaginary Blast"], "quote_fr": "Ma lance brisera les chaînes imposées par le ciel.", "quote_en": "Break the chains! My spear shall carve the path!"},
    
    # 3.2
    "1407": {"version": "3.2", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Remembrance Memosprite"], "archetypes": ["Summon / Memosprite", "Quantum Remembrance", "Crit Hypercarry"], "quote_fr": "Les reflets de nos mémoires ne s'effaceront jamais.", "quote_en": "Gaze into the mirror of eternity. Remember our vow!"},
    "1405": {"version": "3.2", "gender": "Male", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Wind Erudition"], "archetypes": ["AoE / Erudition", "Wind Shear", "Energy Stacking"], "quote_fr": "Le vent propage la sentence des anciens rois.", "quote_en": "The gales of Amphoreus will sweep away all opposition!"},

    # 3.3+
    "1406": {"version": "3.3", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Nihility"], "archetypes": ["Debuff", "Quantum Penetration", "Vulnerability"], "quote_fr": "L'énigme est résolue au moment de votre chute.", "quote_en": "The cipher unravels. Your fate is sealed."},
    "1408": {"version": "3.3", "gender": "Male", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Destruction"], "archetypes": ["Physical Burst", "Crit Hypercarry", "Shield Break"], "quote_fr": "La lumière solaire purifie l'obscurité.", "quote_en": "The celestial dawn shatters all shadows."},
    "1409": {"version": "3.4", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Remembrance"], "archetypes": ["Summon / Memosprite", "Wind Remembrance"], "quote_fr": "Le murmure des fleurs célestes.", "quote_en": "Listen to the sacred whisper of blossoms."},
    "1014": {"version": "3.4", "gender": "Female", "world": "Camelot", "factions": ["Fate Collaboration", "Knights of the Round Table"], "archetypes": ["Physical/Wind Burst", "Crit Hypercarry", "Excalibur Nuke"], "quote_fr": "Excalibur ne connaît qu'une seule volonté : la victoire.", "quote_en": "Excalibur knows but one will: victory."},
    "1015": {"version": "3.4", "gender": "Male", "world": "Fuyuki City", "factions": ["Fate Collaboration", "Counter Guardian"], "archetypes": ["Single Target Burst", "Crit Hypercarry", "Quantum Hunt"], "quote_fr": "Je suis l'os de mon épée, et jamais je ne faiblirai.", "quote_en": "I am the bone of my sword, and I will never yield."},
    "1410": {"version": "3.4", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Nihility"], "archetypes": ["Physical DoT / Bleed", "Debuff"], "quote_fr": "Dans le silence, la vérité se dévoile.", "quote_en": "In silence, absolute reality is revealed."},
    "1412": {"version": "3.5", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Harmony"], "archetypes": ["Wind Buff", "Action Advance"], "quote_fr": "La symphonie céleste retentit.", "quote_en": "The heavenly overture resounds."},
    "1413": {"version": "3.5", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Remembrance"], "archetypes": ["Ice Remembrance", "Freeze / Crit"], "quote_fr": "La nuit éternelle garde ses secrets.", "quote_en": "The boundless night conceals our memories."},
    "1414": {"version": "3.6", "gender": "Male", "world": "Amphoreus", "factions": ["Astral Express", "Amphoreus", "Chrysos Heirs"], "archetypes": ["Physical Preservation", "Shield", "Counter"], "quote_fr": "La terre inébranlable protège nos pas.", "quote_en": "Steadfast as stone, our foundation stands firm."},
    "1415": {"version": "3.6", "gender": "Female", "world": "Amphoreus", "factions": ["Amphoreus", "Chrysos Heirs", "Remembrance"], "archetypes": ["Ice Remembrance", "Memosprite", "Summon"], "quote_fr": "La mélodie sacrée de Cyrène.", "quote_en": "Hear the sacred serenade of the tides."},

    # 4.0
    "1501": {"version": "4.0", "gender": "Female", "world": "Planarcadia", "factions": ["Masked Fools", "Sparkle's Persona", "Livestream Creator"], "archetypes": ["Elation Buff", "Follow-up", "ATK Buff"], "quote_fr": "Vous n'avez encore rien vu ! Place au spectacle !", "quote_en": "You haven't seen anything yet -- let the show begin!"},
    "1502": {"version": "4.0", "gender": "Female", "world": "Xianzhou Luofu", "factions": ["Xianzhou Yuque", "Xianzhou Luofu"], "archetypes": ["Elation Support", "Team Buff", "Physical Boost"], "quote_fr": "Madame Yao veille sur vous, ne l'oubliez jamais.", "quote_en": "Madam Yao watches over all -- never forget that."},

    # 4.1
    "1504": {"version": "4.1", "gender": "Male", "world": "Planarcadia", "factions": ["Ashen Detective Agency", "The Hunt"], "archetypes": ["Single Target Burst", "Detective / Investigation", "Lightning Hypercarry"], "quote_fr": "Chaque indice mène à la vérité, et je ne la laisse jamais filer.", "quote_en": "Every clue leads to the truth, and I never let it slip away."},

    # 4.2
    "1505": {"version": "4.2", "gender": "Female", "world": "Planarcadia", "factions": ["Phantasmoon Games", "Aha Followers", "Elation Observer"], "archetypes": ["Elation Buff", "Crit DMG Buff", "Physical Hypercarry"], "quote_fr": "La grâce est un jeu, et je n'ai jamais perdu une partie.", "quote_en": "Grace is a game, and I have never lost a round."},
    "1506": {"version": "4.2", "gender": "Female", "world": "Punklorde", "factions": ["Stellaron Hunters", "Emanator of Elation"], "archetypes": ["Weakness Implant", "DEF Shred", "Elation Debuff"], "quote_fr": "Atteindre le sommet de l'Allégresse ? Ennuyeux... J'ai la cartouche, alors c'est moi qui fixe les règles.", "quote_en": "Reach the peak of Elation? Boring. I've got the cartridge, so I make the rules."},
    "8009": {"version": "4.2", "gender": "Other", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Emanator of Elation"], "archetypes": ["Elation Support", "Team Buff", "Lightning Damage"], "quote_fr": "Le rire est une arme, et je compte bien m'en servir !", "quote_en": "Laughter is a weapon, and I intend to use it well!"},

    # 4.3
    "1507": {"version": "4.3", "gender": "Male", "world": "Xianzhou Luofu", "factions": ["Stellaron Hunters", "High-Cloud Quintet"], "archetypes": ["DoT / Debuff", "Nihility Support", "Fire Vulnerability"], "quote_fr": "Un corps tel un bois de printemps, un cœur telles des cendres mortes... quelle réponse vais-je forger ?", "quote_en": "A body like spring wood, a heart like dead ashes -- what answer will I forge from the sparks that remain?"},

    # 4.4
    "1508": {"version": "4.4", "gender": "Female", "world": "Fuyuki City", "factions": ["Fate Collaboration", "Tohsaka Family", "Mage Association"], "archetypes": ["AoE / Erudition", "Skill Point Synergy", "Joint Attack"], "quote_fr": "Je ne perds jamais mon temps, et certainement pas contre toi.", "quote_en": "I never waste my time, and certainly not on you."},
    "1509": {"version": "4.4", "gender": "Male", "world": "Uruk", "factions": ["Fate Collaboration", "King of Heroes"], "archetypes": ["Physical Burst", "Crit Hypercarry", "Destruction"], "quote_fr": "Je reprendrai ce qui m'appartient de droit, en roi que je suis.", "quote_en": "I shall reclaim what is rightfully mine, as befits a king."},
    "1510": {"version": "4.4", "gender": "Female", "world": "Planarcadia", "factions": ["Herta Space Station", "Astral Express", "Trailblaze Mission"], "archetypes": ["Mecha Summon", "AoE / Erudition", "Fire Hypercarry"], "quote_fr": "Starblazer est prêt. Voyons jusqu'où cette flamme peut nous mener.", "quote_en": "Starblazer stands ready -- let's see how far this flame can carry us."},

    # Trailblazer forms
    "8001": {"version": "1.0", "gender": "Other", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Stellaron Receptacle"], "archetypes": ["Physical Blast", "Crit Hypercarry"], "quote_fr": "Les règles sont faites pour être brisées !", "quote_en": "Rules are made to be broken!"},
    "8003": {"version": "1.0", "gender": "Other", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Belobog Lance"], "archetypes": ["Team Shield", "Taunt", "Fire Damage Reduction"], "quote_fr": "Que la lance de la Préservation embrase nos ennemis !", "quote_en": "Lance ablaze! Flaming lance, forward!"},
    "8005": {"version": "2.2", "gender": "Other", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Clockie Friend", "Penacony Hat"], "archetypes": ["Super Break Enabler", "Break Effect Team Buff", "Imaginary Break"], "quote_fr": "Dansez avec moi sous le chapeau magique de l'Harmonie !", "quote_en": "Time for a show-stopping performance! Dance along!"},
    "8007": {"version": "3.0", "gender": "Other", "world": "Astral Express", "factions": ["Astral Express", "Nameless", "Chrysos Journey"], "archetypes": ["Summon / Memosprite (Mem)", "Ice Remembrance", "Crit Buff"], "quote_fr": "Mem, voyageons ensemble à travers les mémoires !", "quote_en": "Mem, lend me your strength! Let's explore together!"}
}

# Outfit-variant characters: released as an alternate "SP" splash-art card that reuses the
# base character's full combat identity (element/path/rarity/gender/world/factions/boss).
# StarRailRes lists these under their own numeric ids (1512, 1513) but with bogus/placeholder
# path & element fields (e.g. it lists Aventurine-Waveflair's path as "Elation", not her real
# "Preservation") -- those raw rows are excluded above and rebuilt here from the base character.
OUTFIT_VARIANTS = [
    {
        "variant_id": "1304_waveflair",
        "base_id": "1304",
        "raw_id": "1513",
        "outfit_name_en": "Waveflair",
        "outfit_name_fr": "Croisette",
        "version": "4.5",
        "quote_en": "Even on the hot sand, the house always wins.",
        "quote_fr": "Même sur le sable chaud, la maison gagne toujours.",
    },
    {
        "variant_id": "1309_summeretto",
        "base_id": "1309",
        "raw_id": "1512",
        "outfit_name_en": "Summeretto",
        "outfit_name_fr": "Estivaria",
        "version": "4.5",
        "quote_en": "Let the summer sun compose an entirely new melody.",
        "quote_fr": "Laissez le soleil d'été composer une toute nouvelle mélodie.",
    },
]

# Download Element Icons
print("Downloading Element icons...")
for eid, edata in elements_en.items():
    icon_rel = edata.get('icon')
    if icon_rel:
        fname = f"{eid.lower()}.png"
        download_file(icon_rel, os.path.join(PUBLIC_DIR, "elements", fname))

# Download Path Icons
print("Downloading Path icons...")
for pid, pdata in paths_en.items():
    icon_rel = pdata.get('icon')
    if icon_rel:
        fname = f"{pid.lower()}.png"
        download_file(icon_rel, os.path.join(PUBLIC_DIR, "paths", fname))

# Download Boss Icons
print("Downloading Weekly Boss Material icons...")
for bid, bmeta in BOSS_INFO.items():
    if bid in items_en:
        icon_rel = items_en[bid].get('icon')
        if icon_rel:
            fname = f"{bid}.png"
            download_file(icon_rel, os.path.join(PUBLIC_DIR, "bosses", fname))

# Process Characters
processed_characters = []

# Exclude duplicate male/female Trailblazer IDs (we only keep the "playerboy" id per path form)
# and the raw 1512/1513 outfit-variant rows, which carry bogus path/element data for the
# base character (variant art/version handled separately below, via OUTFIT_VARIANTS).
EXCLUDE_IDS = {"8002", "8004", "8006", "8008", "8010", "1321", "1512", "1513"}

for cid in sorted(chars_en.keys(), key=lambda x: int(x)):
    if cid in EXCLUDE_IDS:
        continue
    
    c_en = chars_en[cid]
    c_fr = chars_fr.get(cid, {})

    name_en = c_en.get('name')
    name_fr = c_fr.get('name', name_en)

    # Clean up Trailblazer names
    if cid == "8001":
        name_en = "Trailblazer (Destruction)"
        name_fr = "Pionnier·ère (Destruction)"
    elif cid == "8003":
        name_en = "Trailblazer (Preservation)"
        name_fr = "Pionnier·ère (Préservation)"
    elif cid == "8005":
        name_en = "Trailblazer (Harmony)"
        name_fr = "Pionnier·ère (Harmonie)"
    elif cid == "8007":
        name_en = "Trailblazer (Remembrance)"
        name_fr = "Pionnier·ère (Souvenir)"
    elif cid == "8009":
        name_en = "Trailblazer (Elation)"
        name_fr = "Pionnier·ère (Allégresse)"
    elif cid == "1224":
        name_en = "March 7th (The Hunt)"
        name_fr = "March 7th (La Chasse)"
    elif cid == "1001":
        name_en = "March 7th (Preservation)"
        name_fr = "March 7th (Préservation)"

    elem_id = c_en.get('element')
    path_id = c_en.get('path')
    rarity = c_en.get('rarity')

    elem_name_en = elements_en.get(elem_id, {}).get('name', elem_id)
    elem_name_fr = elements_fr.get(elem_id, {}).get('name', elem_name_en)

    path_name_en = paths_en.get(path_id, {}).get('name', path_id)
    path_name_fr = paths_fr.get(path_id, {}).get('name', path_name_en)

    # Weekly boss
    wb_id = char_weekly_map.get(cid, "110501")
    wb_info = BOSS_INFO.get(wb_id, BOSS_INFO["110501"])
    wb_mat_en = items_en.get(wb_id, {}).get('name', "Weekly Boss Material")
    wb_mat_fr = items_fr.get(wb_id, {}).get('name', wb_mat_en)

    meta = CHARACTER_METADATA.get(cid, {
        "version": "2.0",
        "gender": "Female" if rarity == 5 else "Male",
        "world": "Cosmos",
        "factions": ["Cosmos"],
        "archetypes": ["Crit Hypercarry"],
        "quote_fr": f"En route pour l'aventure stellaire avec {name_fr} !",
        "quote_en": f"Embarking on the galactic voyage with {name_en}!"
    })

    # Download character avatar
    icon_rel = c_en.get('icon')
    avatar_path = f"assets/characters/{cid}.png"
    if icon_rel:
        download_file(icon_rel, os.path.join(PUBLIC_DIR, "characters", f"{cid}.png"))

    # Download a skill icon for Skill Game Mode
    skill_icon_url = None
    skill_name_en = None
    skill_name_fr = None
    skill_type = None

    if c_en.get('skills'):
        # Pick ultimate or skill
        for sk_id in c_en.get('skills'):
            sk_data_en = skills_en.get(sk_id, {})
            sk_data_fr = skills_fr.get(sk_id, {})
            sk_type = sk_data_en.get('type_text', '')
            if 'Ultimate' in sk_type or 'Skill' in sk_type or 'Talent' in sk_type:
                sk_icon_rel = sk_data_en.get('icon')
                if sk_icon_rel:
                    fname = f"{cid}_{sk_id}.png"
                    download_file(sk_icon_rel, os.path.join(PUBLIC_DIR, "skills", fname))
                    skill_icon_url = f"assets/skills/{fname}"
                    skill_name_en = sk_data_en.get('name')
                    skill_name_fr = sk_data_fr.get('name', skill_name_en)
                    skill_type = sk_type
                    break

    wiki = WIKI_RESEARCH.get(cid)
    if wiki:
        factions_en = wiki["factions_en"]
        factions_fr = wiki["factions_fr"]
        lore_paths = wiki["lore_paths"]
    elif cid in ("8001", "8003", "8005", "8007", "8009"):
        factions_en = meta["factions"]
        factions_fr = meta["factions"]
        lore_paths = [dict(p) for p in TRAILBLAZE_LORE_PATH]
    else:
        # No wiki research available for this id -- fall back to the combat
        # path itself so the field is always populated (never left blank).
        factions_en = meta["factions"]
        factions_fr = meta["factions"]
        lore_paths = [{
            "id": path_id.lower() if path_id else "unknown",
            "name_en": path_name_en,
            "name_fr": path_name_fr,
            "icon": f"assets/paths/{path_id.lower()}.png" if path_id else None,
        }]

    char_obj = {
        "id": cid,
        "name_en": name_en,
        "name_fr": name_fr,
        "tag": c_en.get('tag', ''),
        "rarity": rarity,
        "gender": meta["gender"],
        "element": {
            "id": elem_id.lower() if elem_id else "unknown",
            "name_en": elem_name_en,
            "name_fr": elem_name_fr,
            "icon": f"assets/elements/{elem_id.lower()}.png" if elem_id else ""
        },
        "path": {
            "id": path_id.lower() if path_id else "unknown",
            "name_en": path_name_en,
            "name_fr": path_name_fr,
            "icon": f"assets/paths/{path_id.lower()}.png" if path_id else ""
        },
        "lore_paths": lore_paths,
        "release_version": meta["version"],
        "world_en": meta["world"],
        "world_fr": meta["world"],
        "factions_en": factions_en,
        "factions_fr": factions_fr,
        "archetypes_en": meta["archetypes"],
        "archetypes_fr": meta["archetypes"],
        "weekly_boss": {
            "material_id": wb_id,
            "material_name_en": wb_mat_en,
            "material_name_fr": wb_mat_fr,
            "boss_name_en": wb_info["boss_name_en"],
            "boss_name_fr": wb_info["boss_name_fr"],
            "world_en": wb_info["world_en"],
            "world_fr": wb_info["world_fr"],
            "icon": f"assets/bosses/{wb_id}.png"
        },
        "avatar": avatar_path,
        "quotes": QUOTES_RESEARCH.get(cid, [{"en": meta["quote_en"], "fr": meta["quote_fr"]}]),
        "skill_hint": {
            "icon": skill_icon_url or avatar_path,
            "name_en": skill_name_en or f"{name_en}'s Power",
            "name_fr": skill_name_fr or f"Pouvoir de {name_fr}",
            "type": skill_type or "Ultimate"
        }
    }
    processed_characters.append(char_obj)
    print(f"Processed: {name_en} ({name_fr}) - {meta['version']} - Boss: {wb_info['boss_name_en']}")

# Build outfit-variant entries (alternate splash-art cards that reuse a base character's kit)
print("\nBuilding outfit-variant entries...")
by_id = {c["id"]: c for c in processed_characters}
for variant in OUTFIT_VARIANTS:
    base = by_id.get(variant["base_id"])
    if not base:
        print(f"Skipped variant {variant['variant_id']}: base character {variant['base_id']} not found")
        continue

    raw_id = variant["raw_id"]
    raw_en = chars_en.get(raw_id, {})
    icon_rel = raw_en.get('icon')
    avatar_path = f"assets/characters/{variant['variant_id']}.png"
    if icon_rel:
        download_file(icon_rel, os.path.join(PUBLIC_DIR, "characters", f"{variant['variant_id']}.png"))
        print(f"  {variant['variant_id']}: using distinct outfit art from StarRailRes ({icon_rel})")
    else:
        avatar_path = base["avatar"]
        print(f"  {variant['variant_id']}: NOTE - no distinct outfit art found in StarRailRes, reusing base character's avatar/portrait")

    name_en = f"{base['name_en']} ({variant['outfit_name_en']})"
    name_fr = f"{base['name_fr']} ({variant['outfit_name_fr']})"

    variant_obj = {
        "id": variant["variant_id"],
        "name_en": name_en,
        "name_fr": name_fr,
        "tag": raw_en.get('tag', variant["variant_id"]),
        "rarity": base["rarity"],
        "gender": base["gender"],
        "element": base["element"],
        "path": base["path"],
        "lore_paths": base["lore_paths"],
        "release_version": variant["version"],
        "world_en": base["world_en"],
        "world_fr": base["world_fr"],
        "factions_en": base["factions_en"],
        "factions_fr": base["factions_fr"],
        "archetypes_en": base["archetypes_en"],
        "archetypes_fr": base["archetypes_fr"],
        "weekly_boss": base["weekly_boss"],
        "avatar": avatar_path,
        "quotes": [{"en": variant["quote_en"], "fr": variant["quote_fr"]}],
        "skill_hint": base["skill_hint"],
        "variant_of": base["id"],
        "outfit_name_en": variant["outfit_name_en"],
        "outfit_name_fr": variant["outfit_name_fr"],
    }
    processed_characters.append(variant_obj)
    print(f"Processed variant: {name_en} ({name_fr}) - {variant['version']}")

# Save full JSON
out_path = os.path.join(DATA_DIR, "characters.json")
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(processed_characters, f, indent=2, ensure_ascii=False)

print(f"\nSuccessfully built dataset with {len(processed_characters)} characters!")
print(f"Saved to {out_path}")
