"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const en = {
  banner: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    badge: "Open source",
  },
  nav: { explorer: "Stations", showcase: "Showcase", developers: "Developers", data: "Data", back: "All projects" },
  hero: {
    kicker: "Nshipyard Canada · Project 10",
    title: "What got built near the stations.",
    sub: "Twenty-nine published studies measured what new rail stations do to nearby housing prices. Almost nobody measured what got built next to them. This project joins 125 Toronto rail stations to 2,314 development projects: every station gets an 800-metre zone, and every zone gets its housing supply, before and after opening.",
    cta1: "Explore the stations",
    cta2: "Read the methodology",
  },
  stats: [
    { value: "125", label: "rail stations inventoried: 78 open (TTC subway, GO Transit) and 47 under construction" },
    { value: "41.1%", label: "of all pipeline homes (365,770 of 890,247) sit within 800 metres of an open station" },
    { value: "0 to 4", label: "projects near Finch West station before vs after its December 2017 opening: 0 units became 3,593" },
    { value: "441,649", label: "pipeline homes already clustered near stations that have not opened yet: the anticipation is measurable" },
  ],
  explorer: {
    kicker: "Stations",
    title: "Pick a station. See its supply.",
    search: "Search stations…",
    filterAll: "All", filterOpen: "Open", filterFuture: "Under construction",
    showing: "Showing", of: "of", noResult: "No stations match.",
    empty: "Search above or browse the list. Each station shows every development project within 800 metres, split by status and by whether the application arrived before or after the station opened.",
    projects: "projects within 800 m",
    units: "pipeline homes within 800 m",
    opened: "Opened", openingUnknown: "Opening date not published",
    underConstruction: "Under construction",
    beforeOpening: "Before opening", afterOpening: "After opening",
    built: "Built", active: "Active", proposed: "Proposed",
    earliestApp: "Earliest application", latestApp: "Latest application",
    back: "Back to results",
    stationId: "Station ID",
    coordSource: "Location source",
  },
  showcase: {
    kicker: "Showcase",
    title: "Supply follows the tracks, unevenly.",
    body: "Two in five pipeline homes sit within 800 metres of an open station, but the response is lumpy: downtown stations absorbed tens of thousands of homes each while suburban stations opened to silence. And the future is already priced in: 441,649 pipeline homes cluster around stations that have not opened yet.",
    topTitle: "Top 12 stations by pipeline homes within 800 m",
    topSub: "Development pipeline units, 800-metre zones. Downtown dominates; the Eglinton Crosstown corridor is next.",
    units: "homes",
    baTitle: "Before vs after opening: the 2017 subway extension",
    baBody: "Six stations opened December 17, 2017 on the Toronto-York Spadina extension. Finch West went from zero nearby projects to 4 (3,593 homes); York University from zero to 5 (1,009 homes). Supply responded where the extension landed, years before trains ran the full corridor.",
    before: "Before opening", after: "After opening",
    futureTitle: "The anticipation zone",
    futureBody: "Stations under construction already anchor 441,649 pipeline homes. Front-Spadina (Ontario Line) leads with 36,313; Corktown follows with 34,038. The literature finds price gains arrive at announcement; this dataset shows the supply pipeline does too.",
    futureSub: "Pipeline homes within 800 m of unopened stations, top 8.",
    statusTitle: "Where the pipeline sits",
    statusBody: "Of the 365,770 pipeline homes within 800 metres of an open station, the split between built, active, and proposed shows how much of the transit-adjacent supply is real versus planned.",
    built: "Built", active: "Active", proposed: "Proposed",
    litTitle: "What the literature says about prices",
    litBody: "Twenty-nine published studies find new rail stations add roughly 2-10% to nearby home values, with most of the gain arriving at announcement rather than opening. This project measures the other half of the story: whether housing supply responded. Price data at this geography is not open in Canada; the supply side is.",
  },
  methodology: {
    kicker: "Methodology",
    title: "How the station file was built, and where it is weak.",
    items: [
      "Station inventory: 73 TTC subway stations located exactly from the TTC GTFS feed (Toronto Open Data, retrieved 2026-10-08), plus GO Transit stations and 47 under-construction stations (Eglinton Crosstown, Ontario Line, Scarborough extension) located from the City's Major Transit Station Areas shapefile, converted from MTM Zone 10 (NAD27) and calibrated against 58 GTFS stations with a median residual of 27 metres.",
      "Opening dates for TTC stations are exact, compiled from TTC public records (1954-03-30 for the original Yonge segment through 2017-12-17 for the Toronto-York Spadina extension). GO station dates are approximate years from GO Transit public records. Future stations carry no opening date.",
      "Housing supply comes from the City of Toronto Development Pipeline analytical file (retrieved 2026-10-08): 2,391 projects, of which 2,314 geocoded, with status (proposed, active, built), proposed units, and application receipt date. The 800-metre join is haversine distance from the station point.",
      "Station zones overlap downtown (stations sit closer than 800 metres apart), so citywide totals are deduplicated: 365,770 homes (41.1%) sit within 800 metres of at least one open station. Per-station figures double-count shared projects and are correct only per station.",
      "date_received is the development application receipt date, not a completion date. Before/after comparisons measure application timing around station openings, which captures anticipation as well as response.",
      "What is missing: parcel-level sale prices over time are not open data in Ontario (Teranet is proprietary), so this dataset measures the supply response, not the price response. The 2-10% price uplift figure comes from 29 published studies, not from this file.",
    ],
  },
  developers: {
    kicker: "For developers",
    title: "Query it from code, or from an agent.",
    body: "Three consumption paths, same canonical data. REST for applications, OpenAPI for integration, MCP tools over streamable HTTP for AI agents.",
    endpoints: "Endpoints",
    tryIt: "Try it",
    openapi: "OpenAPI spec",
    mcpTitle: "MCP server",
    mcpBody: "One streamable-HTTP endpoint. Tools: station_lookup, station_search, supply_summary.",
  },
  mcp: {
    kicker: "Connect your agent",
    title: "Put this data to work inside your AI tools.",
    body: "Pick your harness, copy the prompt, send it to your agent. Your agent runs the setup itself.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Other" },
    cardTitle: "Copy and send this to {tab}",
    copy: "Copy",
    copied: "Copied",
    chatgptNote: "ChatGPT connects through the documented REST API rather than MCP directly.",
    pChatgpt:
      "I want to use the {displayName} through its API.\n- OpenAPI spec: {origin}/api/openapi.json\n- REST base: {origin}/api/v1\nFirst tell me in two sentences what this API offers, then {exampleLower}, and show me the result.",
    pClaude:
      "In Claude (claude.ai), open Settings, then Connectors, and add a custom connector:\n- Name: {displayName}\n- URL: {origin}/mcp\nThen list the available tools, {exampleLower}, and show me the result.",
    pClaudeCode:
      "Set up the {displayName} MCP server so I can query it from here.\n1. Run: claude mcp add --transport http {slug} {origin}/mcp\n2. Run `claude mcp list` to confirm it connected.\n3. {example}, and show me the result.",
    pCli:
      "# MCP endpoint (streamable HTTP)\n{origin}/mcp\n\n# List the available tools\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Everything else",
    otherBody: "Any harness that speaks MCP over streamable HTTP, or plain REST.",
    mcpEndpoint: "MCP endpoint",
    openapiSpec: "OpenAPI spec",
    restBase: "REST base",
  },
  downloads: {
    kicker: "Data",
    title: "Take the files.",
    body: "The station inventory, the per-station supply join, and the aggregate summary, MIT licensed, as JSON.",
    files: [
      { name: "stations.json", desc: "125 stations: location, agency, lines, opening date, status" },
      { name: "supply_by_station.json", desc: "Per-station 800m join: projects, homes, status split, before/after opening" },
      { name: "summary.json", desc: "Citywide aggregates and top-station rankings" },
    ],
    download: "Download",
  },
  footer: {
    line: "An open-source civic project. Not affiliated with the Government of Canada or the City of Toronto.",
    sources: "Station locations: TTC GTFS via Toronto Open Data; station areas: City of Toronto Major Transit Station Areas. Opening dates: TTC and Metrolinx public records. Supply: City of Toronto Development Pipeline via toronto-development-pipeline.",
  },
};

export type Dict = typeof en;

const fr: Dict = {
  banner: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    badge: "Code source ouvert",
  },
  nav: { explorer: "Stations", showcase: "Vitrine", developers: "Développeurs", data: "Données", back: "Tous les projets" },
  hero: {
    kicker: "Nshipyard Canada · Projet 10",
    title: "Ce qui s'est construit près des stations.",
    sub: "Vingt-neuf études publiées ont mesuré ce que les nouvelles stations de train font aux prix des logements à proximité. Presque personne n'a mesuré ce qui s'y est construit. Ce projet relie 125 stations de train de Toronto à 2 314 projets de développement : chaque station obtient une zone de 800 mètres, et chaque zone obtient son offre de logements, avant et après l'ouverture.",
    cta1: "Explorer les stations",
    cta2: "Lire la méthodologie",
  },
  stats: [
    { value: "125", label: "stations de train inventoriées : 78 ouvertes (métro TTC, GO Transit) et 47 en construction" },
    { value: "41,1 %", label: "de tous les logements en projet (365 770 sur 890 247) se trouvent à moins de 800 mètres d'une station ouverte" },
    { value: "0 à 4", label: "projets près de la station Finch West avant contre après son ouverture de décembre 2017 : 0 logement est devenu 3 593" },
    { value: "441 649", label: "logements en projet déjà regroupés près de stations pas encore ouvertes : l'anticipation est mesurable" },
  ],
  explorer: {
    kicker: "Stations",
    title: "Choisissez une station. Voyez son offre.",
    search: "Rechercher des stations…",
    filterAll: "Toutes", filterOpen: "Ouvertes", filterFuture: "En construction",
    showing: "Affichage de", of: "sur", noResult: "Aucune station ne correspond.",
    empty: "Recherchez ci-dessus ou parcourez la liste. Chaque station montre tous les projets de développement dans un rayon de 800 mètres, répartis par statut et selon que la demande est arrivée avant ou après l'ouverture de la station.",
    projects: "projets dans un rayon de 800 m",
    units: "logements en projet dans un rayon de 800 m",
    opened: "Ouverte le", openingUnknown: "Date d'ouverture non publiée",
    underConstruction: "En construction",
    beforeOpening: "Avant l'ouverture", afterOpening: "Après l'ouverture",
    built: "Construits", active: "Actifs", proposed: "Proposés",
    earliestApp: "Première demande", latestApp: "Dernière demande",
    back: "Retour aux résultats",
    stationId: "ID de la station",
    coordSource: "Source de la localisation",
  },
  showcase: {
    kicker: "Vitrine",
    title: "L'offre suit les rails, inégalement.",
    body: "Deux logements en projet sur cinq se trouvent à moins de 800 mètres d'une station ouverte, mais la réponse est inégale : les stations du centre-ville ont absorbé des dizaines de milliers de logements chacune, tandis que des stations de banlieue ont ouvert dans le silence. Et l'avenir est déjà intégré aux prix : 441 649 logements en projet se regroupent autour de stations pas encore ouvertes.",
    topTitle: "Les 12 premières stations par logements en projet dans un rayon de 800 m",
    topSub: "Logements en projet du pipeline de développement, zones de 800 mètres. Le centre-ville domine; le corridor d'Eglinton Crosstown suit.",
    units: "logements",
    baTitle: "Avant contre après l'ouverture : le prolongement de 2017",
    baBody: "Six stations ont ouvert le 17 décembre 2017 sur le prolongement Toronto-York Spadina. Finch West est passée de zéro projet à proximité à 4 (3 593 logements); York University de zéro à 5 (1 009 logements). L'offre a répondu là où le prolongement est arrivé, des années avant que les trains parcourent tout le corridor.",
    before: "Avant l'ouverture", after: "Après l'ouverture",
    futureTitle: "La zone d'anticipation",
    futureBody: "Les stations en construction ancrent déjà 441 649 logements en projet. Front-Spadina (Ontario Line) mène avec 36 313; Corktown suit avec 34 038. La littérature constate que les gains de prix arrivent dès l'annonce; ce jeu de données montre que le pipeline d'offre aussi.",
    futureSub: "Logements en projet dans un rayon de 800 m des stations non ouvertes, 8 premières.",
    statusTitle: "Où se trouve le pipeline",
    statusBody: "Sur les 365 770 logements en projet à moins de 800 mètres d'une station ouverte, la répartition entre construits, actifs et proposés montre quelle part de l'offre adjacente au transport en commun est réelle et quelle part est planifiée.",
    built: "Construits", active: "Actifs", proposed: "Proposés",
    litTitle: "Ce que la littérature dit des prix",
    litBody: "Vingt-neuf études publiées constatent que les nouvelles stations de train ajoutent environ 2 à 10 % aux valeurs des logements à proximité, l'essentiel du gain arrivant dès l'annonce plutôt qu'à l'ouverture. Ce projet mesure l'autre moitié de l'histoire : si l'offre de logements a répondu. Les données de prix à cette échelle ne sont pas ouvertes au Canada; le côté offre l'est.",
  },
  methodology: {
    kicker: "Méthodologie",
    title: "Comment le fichier des stations a été construit, et où il est faible.",
    items: [
      "Inventaire des stations : 73 stations de métro TTC localisées exactement depuis le flux GTFS de la TTC (Données ouvertes de Toronto, récupéré le 2026-10-08), plus les stations GO Transit et 47 stations en construction (Eglinton Crosstown, Ontario Line, prolongement de Scarborough) localisées depuis le fichier des zones de stations de transport en commun majeures de la Ville, converti depuis MTM zone 10 (NAD27) et calibré sur 58 stations GTFS avec un résidu médian de 27 mètres.",
      "Les dates d'ouverture des stations TTC sont exactes, compilées depuis les dossiers publics de la TTC (1954-03-30 pour le tronçon Yonge original jusqu'à 2017-12-17 pour le prolongement Toronto-York Spadina). Les dates des stations GO sont des années approximatives d'après les dossiers publics de GO Transit. Les futures stations n'ont pas de date d'ouverture.",
      "L'offre de logements provient du fichier analytique du pipeline de développement de la Ville de Toronto (récupéré le 2026-10-08) : 2 391 projets, dont 2 314 géocodés, avec statut (proposé, actif, construit), logements proposés et date de réception de la demande. La jointure de 800 mètres utilise la distance haversine depuis le point de la station.",
      "Les zones de stations se chevauchent au centre-ville (les stations sont à moins de 800 mètres les unes des autres); les totaux à l'échelle de la ville sont donc dédupliqués : 365 770 logements (41,1 %) se trouvent à moins de 800 mètres d'au moins une station ouverte. Les chiffres par station comptent deux fois les projets partagés et ne sont valables que par station.",
      "La date de réception est la date de réception de la demande d'aménagement, pas une date d'achèvement. Les comparaisons avant/après mesurent le calendrier des demandes autour des ouvertures de stations, ce qui capte l'anticipation autant que la réponse.",
      "Ce qui manque : les prix de vente par parcelle dans le temps ne sont pas des données ouvertes en Ontario (Teranet est propriétaire); ce jeu de données mesure donc la réponse de l'offre, pas celle des prix. Le chiffre de 2 à 10 % de hausse des prix vient de 29 études publiées, pas de ce fichier.",
    ],
  },
  developers: {
    kicker: "Pour les développeurs",
    title: "Interrogez-la depuis du code, ou depuis un agent.",
    body: "Trois façons de consommer les mêmes données canoniques. REST pour les applications, OpenAPI pour l'intégration, outils MCP en HTTP continu pour les agents IA.",
    endpoints: "Points de terminaison",
    tryIt: "Essayer",
    openapi: "Spécification OpenAPI",
    mcpTitle: "Serveur MCP",
    mcpBody: "Un point de terminaison HTTP continu. Outils : station_lookup, station_search, supply_summary.",
  },
  mcp: {
    kicker: "Connectez votre agent",
    title: "Exploitez ces données dans vos outils d'IA.",
    body: "Choisissez votre plateforme, copiez l'invite, envoyez-la à votre agent. Votre agent exécute la configuration lui-même.",
    tabs: { chatgpt: "ChatGPT", claude: "Claude", claudecode: "Claude Code", cli: "CLI", other: "Autre" },
    cardTitle: "Copiez et envoyez ceci à {tab}",
    copy: "Copier",
    copied: "Copié",
    chatgptNote: "ChatGPT se connecte via l'API REST documentée plutôt que directement en MCP.",
    pChatgpt:
      "Je veux utiliser {displayName} via son API.\n- Spécification OpenAPI : {origin}/api/openapi.json\n- Base REST : {origin}/api/v1\nD'abord, dis-moi en deux phrases ce que cette API offre, puis {exampleLower}, et montre-moi le résultat.",
    pClaude:
      "Dans Claude (claude.ai), ouvre les paramètres, puis Connecteurs, et ajoute un connecteur personnalisé :\n- Nom : {displayName}\n- URL : {origin}/mcp\nEnsuite, liste les outils disponibles, {exampleLower}, et montre-moi le résultat.",
    pClaudeCode:
      "Configure le serveur MCP {displayName} pour que je puisse l'interroger d'ici.\n1. Exécute : claude mcp add --transport http {slug} {origin}/mcp\n2. Exécute `claude mcp list` pour confirmer la connexion.\n3. {example}, et montre-moi le résultat.",
    pCli:
      "# Point de terminaison MCP (HTTP continu)\n{origin}/mcp\n\n# Lister les outils disponibles\ncurl -s -X POST {origin}/mcp -H 'Content-Type: application/json' \\\n  -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}'",
    otherTitle: "Tout le reste",
    otherBody: "Toute plateforme qui parle MCP en HTTP continu, ou REST tout court.",
    mcpEndpoint: "Point de terminaison MCP",
    openapiSpec: "Spécification OpenAPI",
    restBase: "Base REST",
  },
  downloads: {
    kicker: "Données",
    title: "Prenez les fichiers.",
    body: "L'inventaire des stations, la jointure d'offre par station et le résumé des agrégats, sous licence MIT, en JSON.",
    files: [
      { name: "stations.json", desc: "125 stations : localisation, agence, lignes, date d'ouverture, statut" },
      { name: "supply_by_station.json", desc: "Jointure d'offre à 800 m par station : projets, logements, répartition par statut, avant/après l'ouverture" },
      { name: "summary.json", desc: "Agrégats à l'échelle de la ville et classements des stations" },
    ],
    download: "Télécharger",
  },
  footer: {
    line: "Un projet civique à code source ouvert. Sans affiliation avec le gouvernement du Canada ni la Ville de Toronto.",
    sources: "Localisation des stations : GTFS de la TTC via Données ouvertes de Toronto; zones de stations : zones de stations de transport en commun majeures de la Ville de Toronto. Dates d'ouverture : dossiers publics de la TTC et de Metrolinx. Offre : pipeline de développement de la Ville de Toronto via toronto-development-pipeline.",
  },
};

const dicts: Record<Lang, Dict> = { en, fr };

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: en,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang, t: dicts[lang] }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}
