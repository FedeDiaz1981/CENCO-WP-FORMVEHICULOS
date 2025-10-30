// src/webparts/registroVehicular/ui/styles.ts
import { getTheme, mergeStyleSets, IButtonStyles } from "@fluentui/react";

export const theme = getTheme();

export const classes = mergeStyleSets({
  root: {
    position: "relative",
    background: theme.semanticColors.bodyBackground,
  },
  page: { maxWidth: 1180, margin: "0 auto", padding: "16px 20px 28px" },
  busyMask: { pointerEvents: "none", opacity: 0.6, filter: "grayscale(30%)" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(255,255,255,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  actions: { display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" },
  actionWrap: { position: "relative" },
  actionDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 12,
    height: 12,
    borderRadius: "50%",
    border: `2px solid ${theme.palette.white}`,
    background: theme.palette.themePrimary,
    boxShadow: "0 0 0 1px rgba(0,0,0,.2)",
  },
  card: {
    padding: 16,
    marginBottom: 16,
    background: theme.semanticColors.bodyBackground,
    border: `1px solid ${theme.semanticColors.variantBorder}`,
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: 600 },

  // Más espacio entre columnas/filas
  grid3: {
    display: "grid",
    gap: 16, // antes 12
    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
    selectors: {
      "@media (max-width: 1024px)": {
        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
      },
      "@media (max-width: 600px)": { gridTemplateColumns: "1fr" },
    },
  },

  // Padding por línea + fuentes unificadas
  fieldCell: {
    display: "flex",
    flexDirection: "column",
    padding: "8px 10px", // espacio interno por línea
    selectors: {
      // Etiquetas
      ".ms-Label": {
        fontSize: 14,
        fontWeight: 600,
      },
      // TextField input
      ".ms-TextField-field": {
        fontSize: 14,
        fontWeight: 500,
      },
      // Dropdown seleccionado
      ".ms-Dropdown-title": {
        fontSize: 14,
        fontWeight: 500,
        minHeight: 32,
        lineHeight: 32,
      },
      // DatePicker / Pickers
      ".ms-BasePicker-text, .ms-DatePicker input, .ms-DatePicker-input": {
        fontSize: 14,
        fontWeight: 500,
      },
      // Toggle textos
      ".ms-Toggle-stateText, .ms-Toggle-label": {
        fontSize: 14,
        fontWeight: 600,
      },
    },
  },

  // Label propio de los campos (se usa antes del control)
  fieldLabel: {
    fontSize: 14, // antes 12
    fontWeight: 600,
    marginBottom: 6, // antes 2
    color: theme.semanticColors.bodyText,
  },

  footer: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 12,
    flexWrap: "wrap",
  },

  // Input de archivo con wrap para nombres largos
  fileInput: {
    width: "100%",
    padding: "8px 10px",
    border: `1px solid ${theme.semanticColors.inputBorder}`,
    borderRadius: 4,
    background: theme.semanticColors.bodyBackground,
    whiteSpace: "normal",
    wordBreak: "break-word",
  },

  // ====== Documentación (responsive) ======
  docsGrid: {
    display: "grid",
    gap: 16, // un poco más de aire (antes 12)
    /* Crea tantas columnas como entren; si no hay ancho para 3,
       baja automáticamente a 2 o 1. Evita salirse del contenedor. */
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    width: "100%",
    boxSizing: "border-box",
  },

  docItem: {
    display: "flex",
    alignItems: "stretch",
    minWidth: 0,
    selectors: {
      "> *": { width: "100%", minWidth: 0 },

      /* Fuerza layout en una columna dentro de cada DocCard
       para que no se superpongan cuando la tarjeta es angosta */
      ".ms-Stack": {
        flexWrap: "wrap",
        alignItems: "flex-start",
        rowGap: 8,
      },
      ".ms-StackItem": {
        flexBasis: "100% !important",
        maxWidth: "100%",
        minWidth: 0,
      },

      /* Todos los Labels (título incluido) con salto de línea */
      ".ms-Label": {
        whiteSpace: "normal",
        wordBreak: "break-word",
        overflowWrap: "anywhere",
        lineHeight: 1.25,
        marginBottom: 4,
      },

      /* Inputs al 100% para no chocar con el label */
      ".ms-TextField, .ms-DatePicker": { width: "100%" },
      ".ms-TextField-fieldGroup": { width: "100%" },
      ".ms-TextField-field": { whiteSpace: "normal", wordBreak: "break-word" },
    },
  },

  docLabelScope: {
    selectors: {
      ".ms-Label": {
        display: "block !important",
        whiteSpace: "normal !important",
        wordBreak: "break-word !important",
        overflowWrap: "anywhere !important",
        lineHeight: 17,
        marginBottom: 4,
      },
    },
    certStaged: {
      color: theme.palette.themePrimary,
      fontStyle: "italic",
    },
  },

  // ====== Utilidades de WRAP para evitar superposiciones ======
  // Úsalo en contenedores de tarjetas (DocCard)
  docCardWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  // Aplícalo a labels sueltos o títulos dentro de tarjetas
  wrapLabel: {
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.25,
  },
  // Aplícalo al control (TextField/DatePicker) para que el texto quiebre correctamente
  wrapControl: {
    width: "100%",
    selectors: {
      ".ms-Label": {
        whiteSpace: "normal",
        wordBreak: "break-word",
        lineHeight: 1.25,
      },
      ".ms-TextField-fieldGroup": { alignItems: "center" },
      ".ms-TextField-field": { whiteSpace: "normal", wordBreak: "break-word" },
      ".ms-DatePicker": { width: "100%" },
    },
  },
  certCard: {
    border: `1px solid ${theme.semanticColors.variantBorder}`,
    borderRadius: 8,
    background: theme.semanticColors.bodyBackground,
    boxShadow: "0 2px 10px rgba(0,0,0,.04)",
    padding: 12,
  },
  certToolbar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    margin: "4px 0 10px",
    flexWrap: "wrap",
  },
  certTableWrap: {
    width: "100%",
    overflowX: "auto", // si no entra, hace scroll horizontal (no rompe layout)
    boxSizing: "border-box",
  },
  certWrapCell: {
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.25,
  },
  certFileCell: {
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.25,
    color: theme.palette.neutralPrimary,
  },
  certOk: { color: theme.palette.green, fontWeight: 600 },
  certPending: { opacity: 0.8 },

  certFileInputHidden: { display: "none" },
  certFileInputName: {
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 1.25,
  },

  /* ====== Certificados: fila de 2 líneas ====== */
  certTwoLineRow: {
    padding: "10px 4px",
    borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
  },
  certRowTop: {
    display: "grid",
    gridTemplateColumns: "1fr auto auto",
    gap: 12,
    alignItems: "baseline",
    marginBottom: 6,
    selectors: {
      "@media (max-width: 720px)": {
        gridTemplateColumns: "1fr 1fr",
      },
      "@media (max-width: 480px)": {
        gridTemplateColumns: "1fr",
      },
    },
  },
  certRowBottom: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: 12,
    alignItems: "center",
    selectors: {
      "@media (max-width: 720px)": {
        gridTemplateColumns: "1fr",
        alignItems: "start",
      },
    },
  },
  certCell: { minWidth: 0 },
  certCellGrow: { minWidth: 0, width: "100%" },
  certMeta: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.palette.neutralSecondary,
    lineHeight: 25,
    marginBottom: 2,
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  certValue: {
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: 25,
  },
  certActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
  },
  certFilePicker: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  certStaged: {
      color: theme.palette.themePrimary,
      fontStyle: "italic",
    },
});

export const tileButtonStyles: IButtonStyles = {
  root: {
    position: "relative",
    background: theme.semanticColors.bodyBackground,
    // Forzamos tipografías unificadas para TODOS los controles Fluent dentro del formulario
    selectors: {
      // Labels
      ".ms-Label, .ms-ChoiceFieldLabel, .ms-Toggle-label, .ms-Toggle-stateText": {
        fontSize: 14,
      },
      // Textos de entrada (TextField / ComboBox / DatePicker / Pickers)
      ".ms-TextField-field, .ms-ComboBox input, .ms-DatePicker input, .ms-BasePicker-text": {
        fontSize: 14,
      },
      // Placeholder de TextField
      ".ms-TextField-field::placeholder": {
        fontSize: 14,
      },
      // Dropdown: valor seleccionado y elementos del menú
      ".ms-Dropdown-title, .ms-Callout .ms-Dropdown-item": {
        fontSize: 14,
      },
      // Botones dentro de callouts o pickers (por si aparece)
      ".ms-Callout button, .ms-Callout .ms-Button-label": {
        fontSize: 14,
      },
    },
  },
  rootHovered: {
    background: theme.semanticColors.bodyBackgroundHovered,
    borderColor: theme.semanticColors.variantBorderHovered,
    boxShadow: "0 2px 8px rgba(0,0,0,.06)",
    transform: "translateY(-1px)",
  },
  rootPressed: {
    background: theme.semanticColors.bodyBackgroundChecked,
    borderColor: theme.semanticColors.variantBorder,
  },
  rootChecked: {
    boxShadow: `0 0 0 2px ${theme.palette.themePrimary} inset`,
    borderColor: theme.palette.themePrimary,
  },
  rootCheckedHovered: {
    boxShadow: `0 0 0 2px ${theme.palette.themePrimary} inset`,
    borderColor: theme.palette.themePrimary,
  },
  rootCheckedPressed: {
    boxShadow: `0 0 0 2px ${theme.palette.themePrimary} inset`,
    borderColor: theme.palette.themePrimary,
  },
  icon: { fontSize: 36, height: 48, lineHeight: "48px", margin: 0 },
  textContainer: { width: "100%", display: "flex", justifyContent: "center" },
  label: {
    width: "100%",
    textAlign: "center",
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: "normal",
    margin: 0,
  },
};
