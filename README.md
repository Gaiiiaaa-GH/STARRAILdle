# STARRAILdle

![banner](.github/assets/banner.webp)

Jeu quotidien de devinette de personnages pour Honkai: Star Rail — inspiré de Loldle/Wordle, en français et anglais.

## Modes

- **Classique** — devinez via 9 attributs comparés (élément, voie, voie narrative, rareté, version, boss hebdomadaire, monde, factions)
- **Splash Art** — silhouette qui dézoome et se recentre à chaque tentative
- **Citation** — devinez le personnage à partir d'une réplique réelle
- **Compétence** — devinez à partir de l'icône d'une compétence

Chaque mode a un défi quotidien (identique pour tout le monde, un par jour) et un mode infini (pratique, cibles aléatoires).

## Fonctionnalités

- Mode daltonien (badges de statut en plus de la couleur)
- Installable en PWA, jouable hors-ligne
- Fond d'écran tournant : bannières officielles aléatoires parmi les personnages du jeu

## Installation

```
git clone https://github.com/Gaiiiaaa-GH/STARRAILdle.git
cd STARRAILdle
npm install
npm run dev
```

## Données

Le roster (`src/data/characters.json`) est généré par `scripts/build_data.py`, qui combine :
- les données de base (éléments, voies, icônes, rareté) depuis [Mar-7th/StarRailRes](https://github.com/Mar-7th/StarRailRes)
- les factions et voies narratives, recherchées sur le wiki Fandom et fusionnées via `scripts/merge_wiki_research.cjs`
- les citations réelles, recherchées sur le wiki Fandom et fusionnées via `scripts/merge_quotes.cjs`

Pour régénérer le dataset après une mise à jour du jeu, relancer `python scripts/build_data.py` (nécessite que `scripts/wiki_research/merged.json` et `merged_quotes.json` soient à jour).

## Crédits

Bannière : art d'introduction officiel de Cipher, Honkai: Star Rail.

Toutes les icônes, portraits et bannières de personnages appartiennent à HoYoverse — utilisés ici à des fins non commerciales, sourcés via [Mar-7th/StarRailRes](https://github.com/Mar-7th/StarRailRes) et le [wiki Fandom](https://honkai-star-rail.fandom.com).

## Disclaimer

Ce projet n'est pas affilié à ni approuvé par HoYoverse. « Honkai: Star Rail » et tous les noms, personnages et illustrations associés sont la propriété de HoYoverse.

## License

Voir [LICENSE](LICENSE).
