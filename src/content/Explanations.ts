export const StatExplanations = {
  DistanceTotal: {
    text: 'Dieser Wert sagt Dir wie weit du bisher in der momentan gewählten Zeitspanne bereits gelaufen bist.',
    how: 'Erfasst wird die Distanz einer Einheit durch das GPS-Signal deiner Sport-Uhr',
    label: 'Gesamtdistanz'
  },

  DurationTotal: {
    text: 'Dieser Wert sagt Dir wie lange du bisher in der momentan gewählten Zeitspanne bereits trainiert hast.',
    how: 'Erfasst wird die Dauer einer Einheit durch deine Sport-Uhr',
    label: 'Gesamtdauer'
  },

  ActivitiesTotal: {
    text: 'Dieser Wert sagt Dir wie häufig du in der momentan gewählten Zeitspanne bereits trainiert hast.',
    how: 'Wir brechenen diesen Wert wird anhand der Anzahl deiner hochgeladenen Einheiten und dem gewählten Zeitfenster.',
    label: 'Einheiten'
  },

  IntensityTotal: {
    text: 'Dieser Wert gibt die aufsummierte Intensität aller Einheiten im momentan gewählten Zeitfenster an.',
    how: 'Für die Berechnung der Intensität brauchen wir deine maximale Herzfrequenz, deinen Ruhepuls und Trainingseinheiten bei denen die Herzfrequenz aufgezeichnet wurde. Mit Hilfe dieser Werte können wir die Intensität einer einzelnen Einheit mithilfe des TRIMP-Konzept (TRaining IMpulse) von Dr. Eric Bannister brechnen.',
    label: 'Gesamtintensität'
  },

  RestdayTotal: {
    text: 'Dieser Wert sagt Dir wie viele Ruhetage du bereits in der momentan gewählten Zeitspanne hattest.',
    how: ' Wir berechnen dieser Wert indem wir die aktuelle Zeitspanne mit deinen Trainingstagen abgleichen.',
    label: 'Ruhetage'
  },
};

export const DetailExplanations = {
  Distance: {
    text: 'Dieser Wert sagt Dir wie weit Du in dieser Trainingseinheit gelaufen bist.',
    how: 'Erfasst wird die Distanz einer Einheit durch das GPS-Signal deiner Sport-Uhr',
    label: 'Distanz'
  },

  DurationTotal: {
    text: 'Dieser Wert sagt Dir wie lange Du in dieser Trainingseinheit gelaufen bist.',
    how: 'Erfasst wird die Dauer einer Einheit durch deine Sport-Uhr',
    label: 'Dauer'
  },

  AvgPace: {
    text: 'Dieser Wert sagt Dir wie schnell Du in dieser Trainingseinheit durchschnittlich gelaufen bist.',
    how: 'Erfasst wird die Dauer einer Einheit durch deine Sport-Uhr',
    label: 'ø Pace'
  },

  AvgHR: {
    text: 'Dieser Wert sagt Dir wie hoch deine Herzfrequenz Du in dieser Trainingseinheit durchschnittlich war.',
    how: 'Erfasst wird die Dauer einer Einheit durch deine Sport-Uhr bzw. einen Brustgurt, welchen du mit dieser verbinden kannst.',
    label: 'ø Herzfrequenz'
  },

  Intensity: {
    text: 'Dieser Wert sagt Dir wie intensiv diese Trainingseinheit war.',
    how: 'Für die Berechnung der Intensität brauchen wir deine maximale Herzfrequenz, deinen Ruhepuls und Trainingseinheiten bei denen die Herzfrequenz aufgezeichnet wurde. Mit Hilfe dieser Werte können wir die Intensität einer einzelnen Einheit mithilfe des TRIMP-Konzept (TRaining IMpulse) von Dr. Eric Bannister brechnen.',
    label: 'Intensität'
  },

  Feelings: {
    text: 'Dieser Wert gibt an wie anstregend Du die Trainingseinheit empfunden hast .',
    how: 'Du kannst diesen Wert über den Button "Bearbeiten" eintragen. Dabei stellt eine 10 auf der von BORG entwickelten Skala die maximale Anstregung vor, die Du dir vorstellen kannst. Bei diesem Wert gibt es kein richtig oder falsch! Trage ein wie Du dich gefühlt hast!',
    label: 'Anstregung'
  },
};

export const PreparationExplanations = {
  DistanceTotal: {
    text: 'Dieser Wert sagt Dir wie weit Du in der gewählten Vorbereitung insgesamt gelaufen bist.',
    how: 'Wir berechnen diesen Wert, indem wir die Distanzen aller Einheiten im Vorbereitunszeitraum summieren.',
    label: 'Gesamtdistanz'
  },

  DurationTotal: {
    text: 'Dieser Wert gibt an wie lange die gesamte Vorbereitung ging.',
    how: 'Diesen Wert konntest Du festlegen als Du die Vorbereitung erstellt hast.',
    label: 'Dauer'
  },

  ActivitiesTotal: {
    text: 'Dieser Wert sagt Dir wie häufig Du in der gewählten Vorbereitung insgesamt trainiert hast.',
    how: 'Wir brechenen diesen Wert wird anhand der Anzahl deiner hochgeladenen Einheiten und dem gewählten Zeitfenster.',
    label: 'Einheiten'
  },

  CompetitionsTotal: {
    text: 'Dieser Wert gibt wie viele Vorbereitungswettkämpfe Du in der gewählten Vorbereitung gelaufen bist..',
    how: 'Wir ermitteln diesen Wert, in dem wir überprüfen wie viele von Dir als "Wettkampf" gekennzeichnete Einheiten sich im Vorbereitunszeitraum befinden.',
    label: 'Wettkämpfe'
  },

  AvgDistance: {
    text: 'Dieser Wert sagt Dir wie viele Kilometer Du in der Vorbereitung durchschnittlich pro Woche gelaufen bist.',
    how: ' Wir berechnen dieser Wert indem die Gesamtdistanz durch die Dauer der Vorbereitung teilen.',
    label: 'ø Wochenumfang'
  },

  AvgSessions: {
    text: 'Dieser Wert sagt Dir häufig Du in der Vorbereitung durchschnittlich pro Woche gelaufen bist.',
    how: ' Wir berechnen dieser Wert indem die Gesamtzahl an Einheiten durch die Dauer der Vorbereitung teilen.',
    label: 'ø Wocheneinheiten'
  },

  AvgIntensity: {
    text: 'Dieser Wert sagt Dir wie hoch die Wochenintensität in der Vorbereitung durchschnittlich war.',
    how: 'Wir berechnen dieser Wert indem für jede Woche alle Intensitäten der Einheiten zusammenaddieren und dann das Ergebnis durch die Dauer der Vorbereitung teilen. Für die Berechnung der Intensität brauchen wir deine maximale Herzfrequenz, deinen Ruhepuls und Trainingseinheiten bei denen die Herzfrequenz aufgezeichnet wurde. Mit Hilfe dieser Werte können wir die Intensität einer einzelnen Einheit mithilfe des TRIMP-Konzept (TRaining IMpulse) von Dr. Eric Bannister brechnen.',
    label: 'ø Wochenintensität'
  },
};

export const ZoneChartExplanations = {
  Main: {
    text: 'Die Visualisierung stellt dar, inwiefern die\n' +
    'Tempo (blau)- und Herzfrequenzzonen (rot) einer\n' +
    'Einheit übereinstimmen.',
    how: 'Die einzelnen Zonen steigen immer weiter an. So ist Zone 1 eine langsamene Geschwindigkeit/niedrige Herzfrequenz bis zu Zone 5 in welcher beide Werte am Maximum sind.',
    label: 'ZoneChart'
  },
};

export const CompareChartExplanations = {
  Main: {
    text: 'Die Visualisierung stellt dar, inwiefern sich die Anteile der einzelnen Laufkategorien in zwei verschiedenen Vorbereitungsphasen unterscheiden.',
    how: 'Der graue Hintergrund steht für den Maximalwert eines aller Kategorien. Die Größe der Kreise berechnet sich anhand des Flächeninhaltes',
    label: 'CompareChart'
  },
};

export const DetailChartExplanations = {
  Graph: {
    text: 'Die Visualisierung zeigt,\n' +
    'darzustellen, inwiefern sich die\n' +
    'Geschwindigkeit und die Herzfrequenz im\n' +
    'Laufe einer Einheit entwickelt haben',
    how: 'Die gestrichelten Linien stehen dabei für den Durchschnittswert eines Graphen. Die heller eingefärben Teile eines Graphen waren unterhalb des Durchschnitts, die dunkleren oberhalb.',
    label: 'Detailgraph'
  },
  List: {
    text: 'Die Visualisierung zeigt,\n' +
    'darzustellen, inwiefern sich die\n' +
    'Geschwindigkeit und die Herzfrequenz im\n' +
    'Laufe einer Einheit entwickelt haben',
    how: 'Der graue Hintergrund steht für den jeweiligen Maximalwert eines Wertes. Je länger der Balken, desto höher der Wert',
    label: 'DetailList'
  }
};

