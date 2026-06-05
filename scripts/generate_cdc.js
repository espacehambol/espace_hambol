const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, LevelFormat, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak,
  TabStopType, TabStopPosition, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── COULEURS CHARTE HAMBOL ───────────────────────────────────────────────
const BRUN      = "8B3A1A";
const BRUN_DK   = "5C2410";
const VERT      = "2E7D1E";
const SABLE     = "F5EDE0";
const GRIS      = "6B5C4E";
const BLANC     = "FFFFFF";
const GRIS_LT   = "F0EBE3";
const BRUN_LT   = "C4733A";
const NOIR      = "1A1208";

// ─── HELPERS ─────────────────────────────────────────────────────────────
const border  = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function hRule(color = BRUN) {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color, space: 1 } },
    spacing: { before: 0, after: 160 }
  });
}

function spacer(pt = 120) {
  return new Paragraph({ spacing: { before: 0, after: pt } });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial", size: 36, bold: true, color: BRUN_DK })],
    spacing: { before: 480, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRUN, space: 4 } }
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: BRUN })],
    spacing: { before: 320, after: 120 }
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: VERT })],
    spacing: { before: 200, after: 80 }
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({
      text, font: "Arial", size: 22,
      color: opts.color || NOIR,
      bold: opts.bold || false,
      italics: opts.italic || false
    })],
    spacing: { before: 60, after: 60 },
    alignment: opts.align || AlignmentType.JUSTIFIED
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, font: "Arial", size: 22, color: NOIR })],
    spacing: { before: 40, after: 40 }
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    children: [new TextRun({ text, font: "Arial", size: 22, color: NOIR })],
    spacing: { before: 40, after: 40 }
  });
}

function infoBox(label, value) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2500, 6860],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            width: { size: 2500, type: WidthType.DXA },
            shading: { fill: BRUN_DK, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: label, font: "Arial", size: 20, bold: true, color: SABLE })] })]
          }),
          new TableCell({
            borders,
            width: { size: 6860, type: WidthType.DXA },
            shading: { fill: GRIS_LT, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: value, font: "Arial", size: 22, color: NOIR })] })]
          })
        ]
      })
    ],
    spacing: { before: 40, after: 40 }
  });
}

function sectionTable(headers, rows, colWidths) {
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  const hdrRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: BRUN, type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, font: "Arial", size: 20, bold: true, color: BLANC })] })]
    }))
  });
  const bodyRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? BLANC : GRIS_LT, type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 20, color: NOIR })] })]
    }))
  }));
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [hdrRow, ...bodyRows]
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function coverTitle(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: "Arial", size: 64, bold: true, color: BRUN_DK })],
    spacing: { before: 200, after: 100 }
  });
}
function coverSub(text, sz = 28, color = BRUN) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, font: "Arial", size: sz, color })],
    spacing: { before: 60, after: 60 }
  });
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
      ]},
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 480, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRUN, space: 4 } },
            children: [
              new TextRun({ text: "ESPACE HAMBOL", font: "Arial", size: 18, bold: true, color: BRUN }),
              new TextRun({ text: "   |   Cahier des Charges — Application Web & Système de Gestion Hôtelière", font: "Arial", size: 18, color: GRIS }),
            ],
            spacing: { before: 0, after: 120 }
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRUN_LT, space: 4 } },
            tabStops: [
              { type: TabStopType.CENTER, position: 4680 },
              { type: TabStopType.RIGHT, position: 9360 }
            ],
            children: [
              new TextRun({ text: "Confidentiel — Usage interne", font: "Arial", size: 16, color: GRIS, italics: true }),
              new TextRun({ text: "\t© 2025 Espace Hambol — Azaguié & Yopougon\t", font: "Arial", size: 16, color: GRIS }),
              new TextRun({ text: "Page ", font: "Arial", size: 16, color: BRUN }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: BRUN })
            ],
            spacing: { before: 100, after: 0 }
          })
        ]
      })
    },
    children: [
      // ════════════════════════════════════════════
      // PAGE DE COUVERTURE
      // ════════════════════════════════════════════
      spacer(1200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 20, color: BRUN, space: 8 } },
        children: [new TextRun({ text: "ESPACE HAMBOL", font: "Arial", size: 80, bold: true, color: BRUN_DK })],
        spacing: { before: 0, after: 160 }
      }),
      spacer(80),
      coverSub("AZAGUIÉ  ✦  YOPOUGON", 32, VERT),
      spacer(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        shading: { fill: BRUN_DK, type: ShadingType.CLEAR },
        children: [new TextRun({ text: "  CAHIER DES CHARGES  ", font: "Arial", size: 40, bold: true, color: SABLE })],
        spacing: { before: 60, after: 60 }
      }),
      spacer(60),
      coverSub("Application Web & Système Professionnel de Gestion Hôtelière", 30, BRUN),
      coverSub("(PMS — Property Management System)", 24, GRIS),
      spacer(400),
      coverSub("Restaurant · Hébergement · Loisirs", 26, BRUN_LT),
      spacer(600),

      // Fiche projet
      new Table({
        width: { size: 7000, type: WidthType.DXA },
        columnWidths: [2500, 4500],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: BRUN, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Projet", font:"Arial", size:20, bold:true, color:BLANC })] })] }),
            new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, shading: { fill: GRIS_LT, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Application Web Espace Hambol", font:"Arial", size:20, color:NOIR })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: BRUN, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Client", font:"Arial", size:20, bold:true, color:BLANC })] })] }),
            new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, shading: { fill: BLANC, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Espace Hambol", font:"Arial", size:20, color:NOIR })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: BRUN, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Sites", font:"Arial", size:20, bold:true, color:BLANC })] })] }),
            new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, shading: { fill: GRIS_LT, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Azaguié (principal) & Yopougon", font:"Arial", size:20, color:NOIR })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: BRUN, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Version", font:"Arial", size:20, bold:true, color:BLANC })] })] }),
            new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, shading: { fill: BLANC, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "v1.0 — Mai 2025", font:"Arial", size:20, color:NOIR })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: BRUN, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "Contact", font:"Arial", size:20, bold:true, color:BLANC })] })] }),
            new TableCell({ borders, width: { size: 4500, type: WidthType.DXA }, shading: { fill: GRIS_LT, type: ShadingType.CLEAR }, margins: { top:80,bottom:80,left:120,right:120 }, children: [new Paragraph({ children: [new TextRun({ text: "27 23 40 72 29 / 01 40 26 75 34", font:"Arial", size:20, color:NOIR })] })] }),
          ]}),
        ]
      }),

      pageBreak(),

      // ════════════════════════════════════════════
      // SOMMAIRE
      // ════════════════════════════════════════════
      h1("SOMMAIRE"),
      ...[
        ["1.", "PRÉSENTATION DU PROJET", "3"],
        ["2.", "OBJECTIFS & ENJEUX", "4"],
        ["3.", "PÉRIMÈTRE FONCTIONNEL — SITE WEB PUBLIC", "5"],
        ["4.", "PÉRIMÈTRE FONCTIONNEL — BACKEND / PMS", "6"],
        ["   4.1", "Gestion des Réservations (Front Desk)", "6"],
        ["   4.2", "Gestion des Chambres & Hébergements", "7"],
        ["   4.3", "Gestion du Restaurant & F&B", "7"],
        ["   4.4", "Gestion des Loisirs & Activités", "8"],
        ["   4.5", "Gestion de la Clientèle (CRM)", "8"],
        ["   4.6", "Gestion du Personnel (RH)", "9"],
        ["   4.7", "Gestion Financière & Comptabilité", "9"],
        ["   4.8", "Gestion des Stocks & Approvisionnement", "10"],
        ["   4.9", "Gestion des Événements & Séminaires", "10"],
        ["   4.10","Tableau de Bord & Reporting", "11"],
        ["5.", "ARCHITECTURE TECHNIQUE", "12"],
        ["6.", "SÉCURITÉ & CONFORMITÉ", "13"],
        ["7.", "GESTION MULTI-SITES", "13"],
        ["8.", "INTERFACES & INTÉGRATIONS", "14"],
        ["9.", "PLANNING & PHASES", "14"],
        ["10.","BUDGET ESTIMATIF", "15"],
        ["11.","CRITÈRES DE RÉCEPTION", "15"],
        ["12.","ANNEXES", "16"],
      ].map(([num, title, page]) =>
        new Paragraph({
          tabStops: [{ type: TabStopType.RIGHT, position: 9026, leader: TabStopType.DOT }],
          children: [
            new TextRun({ text: `${num}  ${title}`, font: "Arial", size: 22, bold: num.trim().length <= 2 && !num.includes('.'), color: num.includes('.') && num.trim().split('.').length > 1 ? GRIS : BRUN_DK }),
            new TextRun({ text: `\t${page}`, font: "Arial", size: 22, color: BRUN }),
          ],
          spacing: { before: 60, after: 60 }
        })
      ),

      pageBreak(),

      // ════════════════════════════════════════════
      // 1. PRÉSENTATION
      // ════════════════════════════════════════════
      h1("1. PRÉSENTATION DU PROJET"),
      h2("1.1 Contexte"),
      body("L'Espace Hambol est un établissement hôtelier ivoirien offrant des services de restauration, d'hébergement et de loisirs, implanté sur deux sites stratégiques :"),
      bullet("Site Azaguié — établissement principal, site d'accueil par défaut de l'application"),
      bullet("Site Yopougon — second établissement, accessible via sélection dans l'interface"),
      spacer(),
      body("Face à la digitalisation croissante du secteur hôtelier en Afrique de l'Ouest et à la nécessité de centraliser la gestion opérationnelle des deux sites, l'Espace Hambol souhaite se doter d'une solution web moderne, complète et évolutive."),

      h2("1.2 Nature du projet"),
      body("Le projet comprend deux composantes majeures et indissociables :"),
      bullet("Un site web public — vitrine digitale de l'établissement, permettant la présentation des services, la réservation en ligne et la communication client."),
      bullet("Un système de gestion hôtelière (PMS) — backend professionnel centralisé couvrant l'ensemble des opérations internes des deux sites."),

      h2("1.3 Identité visuelle"),
      body("La charte graphique est définie et fixée :"),
      bullet("Couleur principale : Terre Hambol #8B3A1A (brun terre cuite)"),
      bullet("Couleur secondaire : Vert Hambol #2E7D1E"),
      bullet("Fond : Sable chaud #F5EDE0"),
      bullet("Typographies : Playfair Display (titres) + Nunito Sans (corps)"),
      bullet("Inspiration : poterie africaine, authenticité culturelle ivoirienne"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 2. OBJECTIFS
      // ════════════════════════════════════════════
      h1("2. OBJECTIFS & ENJEUX"),
      h2("2.1 Objectifs stratégiques"),
      bullet("Accroître la visibilité digitale de l'Espace Hambol à l'échelle nationale et internationale"),
      bullet("Permettre la réservation en ligne 24h/24, 7j/7 depuis le site web"),
      bullet("Centraliser la gestion opérationnelle des deux sites depuis une seule plateforme"),
      bullet("Améliorer l'expérience client de la réservation au check-out"),
      bullet("Optimiser la rentabilité par une meilleure gestion des ressources et des revenus"),
      bullet("Doter la direction d'outils de pilotage et d'aide à la décision en temps réel"),

      h2("2.2 Objectifs opérationnels"),
      bullet("Éliminer les processus manuels et les doubles saisies entre services"),
      bullet("Synchroniser en temps réel les données des deux sites (Azaguié / Yopougon)"),
      bullet("Gérer les disponibilités chambres, tables et activités depuis un tableau de bord unique"),
      bullet("Automatiser la facturation, les relances et les rapports financiers"),
      bullet("Tracer l'historique complet de chaque client (CRM intégré)"),

      h2("2.3 Indicateurs de succès"),
      sectionTable(
        ["Indicateur", "Cible", "Délai"],
        [
          ["Taux de réservations en ligne", "> 40% du total", "6 mois après lancement"],
          ["Réduction saisie manuelle", "> 80%", "Dès la mise en production"],
          ["Disponibilité de la plateforme", "> 99,5% uptime", "En continu"],
          ["Temps de formation du personnel", "< 5 jours", "Phase déploiement"],
          ["Satisfaction client (NPS)", "> 70", "Après 3 mois"],
          ["Délai de génération de rapport", "< 30 secondes", "Dès la mise en production"],
        ],
        [3500, 2800, 3060]
      ),

      pageBreak(),

      // ════════════════════════════════════════════
      // 3. SITE WEB PUBLIC
      // ════════════════════════════════════════════
      h1("3. PÉRIMÈTRE FONCTIONNEL — SITE WEB PUBLIC"),

      h2("3.1 Architecture de navigation"),
      body("Le site affiche par défaut le site d'Azaguié. Un sélecteur de site est intégré dans la barre de navigation sous forme de liste déroulante permettant de basculer vers Yopougon. Chaque site dispose de son propre contenu (photos, prix, disponibilités) mais partage la même interface."),

      h2("3.2 Pages & fonctionnalités"),
      h3("Page d'Accueil"),
      bullet("Hero section plein écran avec slider d'images et appel à l'action réservation"),
      bullet("Sélecteur de site prominent (Azaguié / Yopougon) avec liste déroulante"),
      bullet("Présentation synthétique des 3 activités : Restaurant, Hébergement, Loisirs"),
      bullet("Section témoignages clients et notation"),
      bullet("Section galerie photo dynamique"),
      bullet("Informations de contact et carte interactive"),

      h3("Hébergement"),
      bullet("Catalogue des chambres et suites avec photos HD, équipements, capacité, tarifs"),
      bullet("Moteur de recherche de disponibilités avec calendrier interactif"),
      bullet("Comparateur de chambres"),
      bullet("Réservation en ligne avec choix de dates, type de chambre, options"),
      bullet("Politique d'annulation et conditions de séjour"),

      h3("Restaurant"),
      bullet("Présentation de l'offre culinaire (menus, carte, spécialités ivoiriennes)"),
      bullet("Réservation de table en ligne avec choix date, heure, nombre de couverts"),
      bullet("Galerie des plats"),
      bullet("Horaires et menus du jour"),

      h3("Loisirs & Services"),
      bullet("Présentation des activités disponibles par site"),
      bullet("Réservation d'activités en ligne (piscine, événements, séminaires)"),
      bullet("Location d'espaces (salles de réunion, terrasse)"),

      h3("Espace Client"),
      bullet("Création de compte et connexion sécurisée"),
      bullet("Tableau de bord client : historique des séjours, réservations en cours"),
      bullet("Modification et annulation de réservations"),
      bullet("Programme de fidélité et points accumulés"),
      bullet("Messagerie avec la réception"),

      h3("Autres pages"),
      bullet("À propos — histoire, valeurs, équipe de direction"),
      bullet("Actualités & Événements — blog, promotions, événements à venir"),
      bullet("Contact — formulaire, plan d'accès, téléphones"),
      bullet("FAQ dynamique"),
      bullet("Mentions légales, CGV, Politique de confidentialité (RGPD)"),

      h2("3.3 Moteur de réservation en ligne"),
      bullet("Disponibilités en temps réel synchronisées avec le PMS"),
      bullet("Paiement sécurisé en ligne (carte bancaire, mobile money : Orange Money, MTN MoMo, Wave)"),
      bullet("Confirmation automatique par email et SMS"),
      bullet("Génération de bon de réservation PDF"),
      bullet("Gestion des codes promo et tarifs spéciaux"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 4. BACKEND / PMS
      // ════════════════════════════════════════════
      h1("4. PÉRIMÈTRE FONCTIONNEL — BACKEND / PMS"),
      body("Le système de gestion hôtelière (PMS — Property Management System) constitue le cœur opérationnel de la plateforme. Il regroupe l'ensemble des modules nécessaires à la gestion professionnelle d'un établissement hôtelier multi-sites. L'accès est sécurisé et les droits sont configurables par rôle et par site."),

      // 4.1
      h2("4.1 Gestion des Réservations & Front Desk"),
      h3("Réservations"),
      bullet("Création, modification, annulation de réservations (canaux : web, téléphone, agences, walk-in)"),
      bullet("Gestion des réservations de groupe et contingents"),
      bullet("Gestion des listes d'attente"),
      bullet("Réservations récurrentes et tarifs négociés (entreprises, voyagistes)"),
      bullet("Confirmation automatique multicanal (email, SMS, WhatsApp)"),
      h3("Check-in / Check-out"),
      bullet("Check-in anticipé et check-out tardif avec tarification automatique"),
      bullet("Check-in en ligne (pre-check-in depuis le site web)"),
      bullet("Attribution automatique et manuelle des chambres"),
      bullet("Gestion des extensions de séjour"),
      bullet("Édition de la fiche d'arrivée réglementaire"),
      h3("Plan d'occupation"),
      bullet("Vue planning Gantt des chambres par jour/semaine/mois"),
      bullet("Indicateurs : taux d'occupation, RevPAR, ADR en temps réel"),
      bullet("Gestion des blocages (maintenance, VIP, nettoyage)"),

      // 4.2
      h2("4.2 Gestion des Chambres & Hébergements"),
      bullet("Paramétrage des types de chambres, équipements, capacités et tarifs par site"),
      bullet("Grille tarifaire dynamique : saison, week-end, événements, early bird, last minute"),
      bullet("Gestion du ménage et de la maintenance : planning housekeeping, statuts chambre (propre/sale/hors service)"),
      bullet("Feuille de service quotidienne du personnel d'entretien"),
      bullet("Suivi des incidents et demandes de maintenance par chambre"),
      bullet("Gestion des équipements supplémentaires (lit bébé, coffre-fort, minibar)"),
      bullet("Inventaire des chambres et suivi de l'état du mobilier"),

      // 4.3
      h2("4.3 Gestion du Restaurant & Food & Beverage (F&B)"),
      h3("Salle & Service"),
      bullet("Plan de salle interactif par restaurant / espace (Azaguié et Yopougon)"),
      bullet("Gestion des réservations de table et files d'attente"),
      bullet("Prise de commande sur tablette / smartphone (serveur en salle)"),
      bullet("Gestion des modifications, annulations et envois en cuisine"),
      bullet("Écran cuisine (KDS — Kitchen Display System)"),
      h3("Menus & Gestion"),
      bullet("Gestion des menus, cartes et recettes avec fiches techniques"),
      bullet("Tarification par service (petit-déjeuner, déjeuner, dîner, brunch)"),
      bullet("Offres spéciales, menus du jour et promotions"),
      bullet("Suivi des allergènes et régimes alimentaires"),
      h3("Facturation & Caisse"),
      bullet("Caisse enregistreuse intégrée (POS) avec impression ticket et facture"),
      bullet("Facturation chambre depuis le restaurant (room charge)"),
      bullet("Gestion des modes de paiement : espèces, carte, mobile money, compte"),
      bullet("Clôture de caisse quotidienne et rapports de vente"),

      // 4.4
      h2("4.4 Gestion des Loisirs & Activités"),
      bullet("Catalogue d'activités par site : piscine, sport, spa, excursions, animations"),
      bullet("Réservation et planning des activités avec gestion des capacités"),
      bullet("Tarification individuelle et forfaits séjour"),
      bullet("Suivi de la consommation par client et facturation intégrée au séjour"),
      bullet("Planning des espaces (salle de sport, salle polyvalente, terrasse)"),
      bullet("Gestion des équipements sportifs et de loisirs"),

      // 4.5
      h2("4.5 Gestion de la Clientèle — CRM"),
      bullet("Fiche client complète : coordonnées, préférences, historique de séjours, litiges"),
      bullet("Segmentation clients : individuel, corporate, VIP, groupe, agence"),
      bullet("Programme de fidélité : points, niveaux (Standard, Silver, Gold, Platinium)"),
      bullet("Historique complet des transactions, réservations et interactions"),
      bullet("Gestion des commentaires et réclamations clients"),
      bullet("Campagnes d'emailing et SMS ciblées (anniversaires, promotions)"),
      bullet("Dossier client partagé entre les deux sites (vue 360°)"),
      bullet("Import/export de contacts et intégration agences de voyage"),

      pageBreak(),

      // 4.6
      h2("4.6 Gestion du Personnel — Ressources Humaines"),
      bullet("Registre du personnel : fiche employé, poste, site d'affectation, contrat"),
      bullet("Planning des équipes et gestion des roulements (réception, restauration, ménage, sécurité)"),
      bullet("Gestion des congés, absences, heures supplémentaires et jours fériés"),
      bullet("Pointage et contrôle des présences (badge ou application mobile)"),
      bullet("Calcul automatique des salaires, primes et déductions"),
      bullet("Génération des bulletins de paie"),
      bullet("Tableau de bord RH : effectifs par site, taux d'absentéisme, coût masse salariale"),
      bullet("Formation et suivi des compétences du personnel"),
      bullet("Gestion des évaluations et entretiens annuels"),

      // 4.7
      h2("4.7 Gestion Financière & Comptabilité"),
      h3("Facturation & Encaissement"),
      bullet("Génération automatique des factures séjour, restaurant, activités"),
      bullet("Facturation groupée et décomptes d'agence"),
      bullet("Gestion des avances, arrhes et cautions"),
      bullet("Remboursements et gestion des avoirs"),
      bullet("Multi-devises : XOF (CFA), EUR, USD"),
      h3("Comptabilité"),
      bullet("Journal de caisse quotidien et rapprochement bancaire"),
      bullet("Suivi des créances et dettes fournisseurs"),
      bullet("Plan comptable paramétrable adapté aux normes ivoiriennes (OHADA)"),
      bullet("Centralisation des comptes des deux sites avec consolidation possible"),
      bullet("Tableau de bord financier : CA, charges, marge, résultat par site et global"),
      h3("Rapports financiers"),
      bullet("Rapport journalier de direction (Night Audit automatisé)"),
      bullet("États financiers mensuels et annuels"),
      bullet("Budget prévisionnel vs réel"),
      bullet("Export comptable vers logiciels tiers (Sage, etc.)"),

      // 4.8
      h2("4.8 Gestion des Stocks & Approvisionnement"),
      bullet("Inventaire centralisé : alimentation, boissons, produits d'entretien, linge, fournitures"),
      bullet("Gestion des entrées (réception fournisseurs) et sorties (consommation)"),
      bullet("Seuils d'alerte et déclenchement automatique des commandes"),
      bullet("Gestion des fournisseurs : catalogue, contacts, conditions tarifaires"),
      bullet("Suivi des bons de commande et de livraison"),
      bullet("Valorisation des stocks (FIFO / coût moyen)"),
      bullet("Rapports de consommation par département et par site"),
      bullet("Gestion des pertes, casses et écarts d'inventaire"),

      // 4.9
      h2("4.9 Gestion des Événements & Séminaires"),
      bullet("Catalogue des espaces événementiels : capacité, équipements, tarifs (par site)"),
      bullet("Réservation d'espaces pour séminaires, mariages, conférences, baptêmes"),
      bullet("Devis automatisé et contrat de prestation"),
      bullet("Gestion du planning des salles avec vue calendrier"),
      bullet("Coordination des services associés : restauration, hébergement, sono, décoration"),
      bullet("Facturation globale événement (all-in-one)"),
      bullet("Feuille de route événement pour le personnel"),
      bullet("Suivi de la rentabilité par événement"),

      // 4.10
      h2("4.10 Tableau de Bord & Reporting"),
      h3("Dashboard Direction"),
      bullet("Vue temps réel : taux d'occupation, CA journalier, réservations du jour (par site et consolidé)"),
      bullet("Graphiques de performance : évolution CA, comparaisons N-1, saisonnalité"),
      bullet("Top clients, top chambres, top activités"),
      bullet("Alertes et notifications (maintenance, litiges, niveaux de stock critiques)"),
      h3("Rapports opérationnels"),
      bullet("Rapport d'occupation et de production (quotidien, mensuel, annuel)"),
      bullet("Rapport de restauration (couverts, ticket moyen, CA F&B)"),
      bullet("Rapport RH (présences, heures, masse salariale)"),
      bullet("Rapport stocks et approvisionnements"),
      bullet("Rapport commercial (réservations par canal, par segment)"),
      h3("Exports"),
      bullet("Export Excel, PDF, CSV de tous les rapports"),
      bullet("Planification d'envoi automatique par email"),
      bullet("API de données pour connexion à des outils BI externes"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 5. ARCHITECTURE TECHNIQUE
      // ════════════════════════════════════════════
      h1("5. ARCHITECTURE TECHNIQUE"),
      h2("5.1 Stack technologique recommandé"),
      sectionTable(
        ["Composant", "Technologie", "Justification"],
        [
          ["Frontend Web", "Next.js 14+ (React)", "SSR, SEO, performance"],
          ["Backend API", "Node.js / NestJS", "Scalabilité, typage fort"],
          ["Base de données", "PostgreSQL", "Robustesse, requêtes complexes"],
          ["Cache", "Redis", "Sessions, performances temps réel"],
          ["Stockage médias", "AWS S3 / Cloudinary", "Images HD, CDN intégré"],
          ["Authentification", "JWT + OAuth 2.0", "Sécurité, SSO possible"],
          ["Paiement en ligne", "Stripe + CinetPay", "International + Mobile Money"],
          ["Notifications", "Twilio (SMS) + SendGrid", "Email & SMS automatisés"],
          ["Hébergement", "VPS OVH / AWS", "Disponibilité 99,9%"],
          ["CI/CD", "GitHub Actions", "Déploiement automatisé"],
        ],
        [2800, 2800, 3760]
      ),

      h2("5.2 Architecture multi-sites"),
      bullet("Base de données unique avec isolation logique par site (tenant_id)"),
      bullet("Synchronisation temps réel entre sites via WebSocket"),
      bullet("Tableau de bord consolidé pour la direction générale"),
      bullet("Paramétrage indépendant par site : tarifs, équipes, menus, activités"),
      bullet("Basculement de site depuis le frontend en 1 clic (liste déroulante header)"),

      h2("5.3 Compatibilité & accessibilité"),
      bullet("Responsive design : ordinateur, tablette, smartphone"),
      bullet("Compatible avec les navigateurs modernes (Chrome, Firefox, Safari, Edge)"),
      bullet("Application mobile PWA (Progressive Web App) pour le personnel"),
      bullet("Application tablet pour le service en salle (commandes restaurant)"),
      bullet("Mode hors-ligne avec synchronisation différée (zones à faible connexion)"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 6. SÉCURITÉ
      // ════════════════════════════════════════════
      h1("6. SÉCURITÉ & CONFORMITÉ"),
      bullet("Chiffrement SSL/TLS sur toutes les communications (HTTPS obligatoire)"),
      bullet("Chiffrement des données sensibles en base (AES-256)"),
      bullet("Authentification à deux facteurs (2FA) pour les comptes administrateurs"),
      bullet("Gestion fine des rôles et permissions (RBAC) : Super Admin, Directeur de site, Réceptionniste, Comptable, Responsable Restaurant, Housekeeping, RH"),
      bullet("Journalisation complète des actions utilisateurs (audit log)"),
      bullet("Sauvegarde automatique quotidienne des données avec rétention 30 jours"),
      bullet("Protection anti-DDoS et pare-feu applicatif (WAF)"),
      bullet("Conformité RGPD : consentement, droit à l'oubli, portabilité des données"),
      bullet("PCI-DSS pour le traitement des paiements par carte bancaire"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 7. GESTION MULTI-SITES
      // ════════════════════════════════════════════
      h1("7. GESTION MULTI-SITES (AZAGUIÉ / YOPOUGON)"),
      body("La gestion multi-sites est un prérequis fondamental du projet. Voici les spécificités détaillées :"),
      h2("7.1 Site web public"),
      bullet("Affichage par défaut du site d'Azaguié à l'ouverture du site"),
      bullet("Liste déroulante dans le header permettant de sélectionner : Azaguié | Yopougon"),
      bullet("Chaque site affiche ses propres photos, tarifs, disponibilités et coordonnées"),
      bullet("URL dédiée possible par site (ex: hambol.ci/azaguie et hambol.ci/yopougon)"),
      bullet("SEO optimisé pour chaque localisation"),
      h2("7.2 Backend PMS"),
      bullet("Connexion unique pour le personnel avec affectation à un ou plusieurs sites"),
      bullet("Tableau de bord consolidé pour la direction avec vue globale ou par site"),
      bullet("Transfert de clients entre sites (ex : client qui prolonge à Yopougon)"),
      bullet("Partage des fiches clients entre les deux sites (CRM unifié)"),
      bullet("Rapports disponibles par site, comparatifs ou consolidés"),
      bullet("Gestion budgétaire et comptable par site avec consolidation groupe"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 8. INTERFACES & INTÉGRATIONS
      // ════════════════════════════════════════════
      h1("8. INTERFACES & INTÉGRATIONS"),
      sectionTable(
        ["Système externe", "Type d'intégration", "Priorité"],
        [
          ["Booking.com / Expedia", "Channel Manager — synchronisation des disponibilités", "Haute"],
          ["Orange Money / MTN MoMo / Wave", "Paiement mobile money en ligne", "Haute"],
          ["Stripe / Visa / Mastercard", "Paiement carte bancaire internationale", "Haute"],
          ["WhatsApp Business API", "Notifications et confirmations clients", "Moyenne"],
          ["Google Maps", "Localisation des deux sites sur le site web", "Haute"],
          ["Google Analytics / Meta Pixel", "Suivi marketing et publicité digitale", "Moyenne"],
          ["Logiciel comptable (Sage/Cegid)", "Export des écritures comptables", "Moyenne"],
          ["Système de contrôle d'accès", "Serrures électroniques chambres (optionnel)", "Basse"],
          ["Imprimantes fiscales", "Édition de reçus conformes", "Haute"],
        ],
        [3000, 4000, 2360]
      ),

      pageBreak(),

      // ════════════════════════════════════════════
      // 9. PLANNING
      // ════════════════════════════════════════════
      h1("9. PLANNING & PHASES DE DÉVELOPPEMENT"),
      sectionTable(
        ["Phase", "Contenu", "Durée estimée"],
        [
          ["Phase 0 — Cadrage", "Validation CDC, maquettes UI/UX, architecture technique, base de données", "2 semaines"],
          ["Phase 1 — Site web", "Développement frontend public (accueil, chambres, réservation, restaurant, loisirs)", "6 semaines"],
          ["Phase 2 — PMS Core", "Réservations, Front Desk, Housekeeping, Facturation de base", "8 semaines"],
          ["Phase 3 — PMS Avancé", "Restaurant POS, Stocks, RH, Comptabilité, CRM, Événements", "8 semaines"],
          ["Phase 4 — Intégrations", "Paiement en ligne, Channel Manager, SMS/Email, Reporting", "4 semaines"],
          ["Phase 5 — Tests & Formation", "Tests complets, corrections, formation du personnel des 2 sites", "3 semaines"],
          ["Phase 6 — Lancement", "Déploiement en production, monitoring, support post-lancement", "2 semaines"],
          ["TOTAL", "", "33 semaines (~8 mois)"],
        ],
        [2200, 4600, 2560]
      ),

      pageBreak(),

      // ════════════════════════════════════════════
      // 10. BUDGET
      // ════════════════════════════════════════════
      h1("10. BUDGET ESTIMATIF"),
      body("Les estimations suivantes sont données à titre indicatif et devront être affinées lors de la phase de cadrage avec les prestataires sélectionnés."),
      spacer(),
      sectionTable(
        ["Poste", "Description", "Fourchette estimée (XOF)"],
        [
          ["Conception UI/UX", "Maquettes, prototypes, charte, design system", "1 500 000 – 3 000 000"],
          ["Développement Frontend", "Site web public, responsive, multi-sites", "4 000 000 – 8 000 000"],
          ["Développement Backend/PMS", "Tous les modules PMS, API, base de données", "12 000 000 – 25 000 000"],
          ["Intégrations", "Paiement, Channel Manager, SMS/Email, APIs", "2 000 000 – 5 000 000"],
          ["Infrastructure & Hébergement", "Serveurs, domaine, SSL, CDN (coût annuel)", "500 000 – 1 500 000 /an"],
          ["Formation du personnel", "Formation sur les 2 sites, documentation", "500 000 – 1 000 000"],
          ["Support & Maintenance", "Maintenance corrective et évolutive (annuel)", "1 500 000 – 3 000 000 /an"],
          ["TOTAL DÉVELOPPEMENT", "(hors maintenance annuelle)", "20 000 000 – 42 000 000"],
        ],
        [2500, 3500, 3360]
      ),

      pageBreak(),

      // ════════════════════════════════════════════
      // 11. CRITÈRES DE RÉCEPTION
      // ════════════════════════════════════════════
      h1("11. CRITÈRES DE RÉCEPTION"),
      h2("11.1 Recette fonctionnelle"),
      bullet("Toutes les fonctionnalités listées dans le présent cahier des charges sont opérationnelles"),
      bullet("Les deux sites (Azaguié et Yopougon) sont correctement configurés et distincts"),
      bullet("Le basculement de site depuis la liste déroulante fonctionne sans rechargement de page"),
      bullet("Les réservations en ligne aboutissent à une confirmation et un paiement effectif"),
      bullet("Le PMS enregistre, modifie et facture correctement une réservation de bout en bout"),
      bullet("Les rapports de direction sont générés correctement et en temps réel"),

      h2("11.2 Recette technique"),
      bullet("Score PageSpeed Insights ≥ 85 (mobile et desktop)"),
      bullet("Disponibilité testée ≥ 99,5% sur 30 jours"),
      bullet("Aucune faille de sécurité critique détectée lors de l'audit de sécurité"),
      bullet("Temps de chargement des pages < 3 secondes en conditions réseau normales"),
      bullet("Sauvegarde automatique fonctionnelle et testée (restauration vérifiée)"),

      h2("11.3 Livrables attendus"),
      bullet("Code source documenté et versionné (dépôt Git privé remis au client)"),
      bullet("Documentation technique complète (architecture, API, base de données)"),
      bullet("Manuel utilisateur par profil (réceptionniste, caissier, directeur, RH...)"),
      bullet("Vidéos de formation par module"),
      bullet("Rapport de tests et procès-verbal de recette signé"),

      pageBreak(),

      // ════════════════════════════════════════════
      // 12. ANNEXES
      // ════════════════════════════════════════════
      h1("12. ANNEXES"),
      h2("Annexe A — Rôles utilisateurs & droits d'accès"),
      sectionTable(
        ["Rôle", "Accès PMS", "Accès site admin", "Sites"],
        [
          ["Super Administrateur", "Complet (tous modules)", "Complet", "Azaguié + Yopougon"],
          ["Directeur Général", "Lecture + validation", "Rapports & dashboard", "Les 2 sites"],
          ["Directeur de site", "Complet sur son site", "Son site uniquement", "1 site affecté"],
          ["Réceptionniste", "Réservations, Front Desk, Facturation", "Non", "1 site affecté"],
          ["Responsable Restaurant", "F&B, POS, Stocks cuisine", "Non", "1 site affecté"],
          ["Serveur", "POS commandes uniquement", "Non", "1 site affecté"],
          ["Housekeeping", "Statut chambres, maintenance", "Non", "1 site affecté"],
          ["Responsable RH", "Module RH, paie, planning", "Non", "Les 2 sites"],
          ["Comptable", "Finance, facturation, rapports", "Non", "Les 2 sites"],
          ["Responsable Stocks", "Inventaire, commandes", "Non", "1 site affecté"],
        ],
        [2400, 2800, 2000, 2160]
      ),

      spacer(200),
      h2("Annexe B — Glossaire"),
      bullet("PMS (Property Management System) : système de gestion hôtelière centralisé"),
      bullet("POS (Point of Sale) : caisse enregistreuse / terminal de vente"),
      bullet("RevPAR : Revenue Per Available Room — revenu par chambre disponible"),
      bullet("ADR : Average Daily Rate — tarif journalier moyen"),
      bullet("KDS : Kitchen Display System — écran de cuisine pour les commandes"),
      bullet("CRM : Customer Relationship Management — gestion de la relation client"),
      bullet("F&B : Food & Beverage — département restauration et boissons"),
      bullet("Channel Manager : outil de synchronisation des disponibilités sur les OTAs"),
      bullet("OTA : Online Travel Agency — Booking.com, Expedia, etc."),
      bullet("OHADA : Organisation pour l'Harmonisation en Afrique du Droit des Affaires"),
      bullet("RBAC : Role-Based Access Control — gestion des droits par rôle"),
      bullet("PWA : Progressive Web App — application web installable sur mobile"),

      spacer(200),
      h2("Annexe C — Contacts"),
      sectionTable(
        ["Contact", "Coordonnées"],
        [
          ["Espace Hambol — Standard", "27 23 40 72 29"],
          ["Espace Hambol — Mobile", "01 40 26 75 34"],
          ["Site Azaguié (principal)", "Azaguié, Côte d'Ivoire"],
          ["Site Yopougon", "Yopougon, Abidjan, Côte d'Ivoire"],
        ],
        [3500, 5860]
      ),

      spacer(400),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: BRUN, space: 8 } },
        children: [new TextRun({ text: "Document établi le 29 mai 2025 — Espace Hambol © 2025 — Tous droits réservés", font: "Arial", size: 18, italics: true, color: GRIS })],
        spacing: { before: 160, after: 0 }
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(path.join(__dirname, '../public/CDC_Espace_Hambol.docx'), buffer);
  console.log('OK');
}).catch(e => console.error(e));
