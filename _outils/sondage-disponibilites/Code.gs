/**
 * Sondage de disponibilités (Google Form + Google Sheet).
 *
 * Usage :
 *   1. Ouvrir https://script.google.com > Nouveau projet, coller ce fichier.
 *   2. Adapter CONFIG ci-dessous (jours, créneaux).
 *   3. Exécuter creerSondage() et autoriser l'accès.
 *   4. Les liens (formulaire à partager + Google Sheet) s'affichent dans le journal d'exécution.
 */
const CONFIG = {
  titre: 'Disponibilités – réunion équipe',
  description: 'Coche tous les créneaux où tu es disponible. Tu peux modifier ta réponse après envoi.',
  jours: ['Lundi 9 nov.', 'Mardi 10 nov.', 'Mercredi 11 nov.', 'Jeudi 12 nov.', 'Vendredi 13 nov.'],
  creneaux: ['9h-10h30', '10h30-12h', '14h-15h30', '15h30-17h'],
  questionGrille: 'Tes disponibilités',
};

function creerSondage() {
  verifierConfig_();

  const form = FormApp.create(CONFIG.titre)
    .setDescription(CONFIG.description)
    .setAllowResponseEdits(true)
    .setProgressBar(false);

  form.addTextItem().setTitle('Prénom et nom').setRequired(true);
  form.addCheckboxGridItem()
    .setTitle(CONFIG.questionGrille)
    .setHelpText('Laisse une ligne vide si tu n\'es disponible à aucun créneau ce jour-là.')
    .setRows(CONFIG.jours)
    .setColumns(CONFIG.creneaux);
  form.addParagraphTextItem().setTitle('Commentaire (contraintes, préférences)');

  const ss = SpreadsheetApp.create(CONFIG.titre + ' (réponses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  const reponses = trouverFeuilleReponses_(ss, form);
  reponses.setName('Réponses');
  construireSynthese_(ss);

  // La feuille vide créée par défaut ne sert plus.
  ss.getSheets()
    .filter(s => s.getName() !== 'Réponses' && s.getName() !== 'Synthèse')
    .forEach(s => ss.deleteSheet(s));

  Logger.log('Lien à envoyer aux collègues : ' + form.getPublishedUrl());
  Logger.log('Édition du formulaire : ' + form.getEditUrl());
  Logger.log('Google Sheet (réponses + synthèse) : ' + ss.getUrl());
}

function verifierConfig_() {
  const doublons = arr => arr.length !== new Set(arr).size;
  if (!CONFIG.jours.length || !CONFIG.creneaux.length) throw new Error('jours et creneaux ne doivent pas être vides.');
  if (doublons(CONFIG.jours) || doublons(CONFIG.creneaux)) throw new Error('Libellés en double dans jours ou creneaux.');
  // Google Sheets concatène les cases cochées avec ", " : une virgule ou un joker COUNTIF dans un libellé fausserait le comptage.
  if (CONFIG.creneaux.some(c => /[,*?~"]/.test(c))) throw new Error('Les créneaux ne doivent contenir ni virgule, ni guillemet, ni * ? ~.');
  if (CONFIG.jours.some(j => /["\[\]]/.test(j))) throw new Error('Les jours ne doivent contenir ni guillemet ni crochet.');
}

// La feuille liée au formulaire est créée de façon asynchrone : on attend qu'elle apparaisse.
function trouverFeuilleReponses_(ss, form) {
  const formId = form.getId();
  for (let i = 0; i < 20; i++) {
    SpreadsheetApp.flush();
    const feuille = SpreadsheetApp.openById(ss.getId()).getSheets()
      .find(s => (s.getFormUrl() || '').indexOf(formId) !== -1);
    if (feuille) return feuille;
    Utilities.sleep(500);
  }
  throw new Error('Feuille de réponses introuvable. Relancer le script.');
}

function construireSynthese_(ss) {
  const synth = ss.insertSheet('Synthèse', 0);
  const nbCreneaux = CONFIG.creneaux.length;

  synth.getRange('A1').setValue('Répondants');
  synth.getRange('B1').setFormula('=COUNTA(Réponses!B2:B)');
  synth.getRange(3, 1, 1, nbCreneaux + 1).setValues([['Jour \\ Créneau'].concat(CONFIG.creneaux)]);

  CONFIG.jours.forEach((jour, i) => {
    const ligne = 4 + i;
    synth.getRange(ligne, 1).setValue(jour);
    CONFIG.creneaux.forEach((creneau, j) => {
      // Colonne « Question [Jour] » retrouvée par son en-tête, puis comptage exact du créneau dans la liste "a, b, c".
      const col = `INDEX(Réponses!A:ZZ,0,MATCH("${CONFIG.questionGrille} [${jour}]",Réponses!1:1,0))`;
      const c = `"${creneau}"`;
      synth.getRange(ligne, 2 + j).setFormula(
        `=COUNTIF(${col},${c})+COUNTIF(${col},${c}&", *")+COUNTIF(${col},"*, "&${c})+COUNTIF(${col},"*, "&${c}&", *")`
      );
    });
  });

  const plage = synth.getRange(4, 2, CONFIG.jours.length, nbCreneaux);
  synth.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule()
      .setGradientMinpointWithValue('#ffffff', SpreadsheetApp.InterpolationType.NUMBER, '0')
      .setGradientMaxpoint('#57bb8a')
      .setRanges([plage])
      .build(),
  ]);

  const ligneMeilleur = 5 + CONFIG.jours.length;
  synth.getRange(ligneMeilleur, 1).setValue('Max de dispos sur un créneau');
  synth.getRange(ligneMeilleur, 2).setFormula(`=MAX(${plage.getA1Notation()})`);

  synth.getRange(3, 1, 1, nbCreneaux + 1).setFontWeight('bold');
  synth.getRange(4, 1, CONFIG.jours.length, 1).setFontWeight('bold');
  synth.setFrozenRows(3);
  synth.autoResizeColumns(1, nbCreneaux + 1);
}
