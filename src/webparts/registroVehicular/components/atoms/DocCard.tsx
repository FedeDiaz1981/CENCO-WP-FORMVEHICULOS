// src/webparts/registroVehicular/components/DocCard.tsx
import * as React from "react";
import {
  DatePicker,
  DefaultButton,
  Label,
  Stack,
  StackItem,
  TextField,
  Dropdown,
  IDropdownOption,
  IDatePickerStyles,
  ITextFieldStyles,
} from "@fluentui/react";
import { theme } from "../../ui/styles";

export interface DocCardProps {
  title?: string;
  dateLabel?: string;
  dateValue?: Date | null;
  onDateChange?: (date: Date | null) => void;
  /** NUEVO: permitir pasar dateOnly desde fuera (opcional) */
  dateOnly?: boolean;
  textLabel?: string;
  textValue?: string;
  onTextChange?: (value: string) => void;
  textAsDropdown?: boolean;               // 👈 NUEVO
  textOptions?: IDropdownOption[];        // 👈 NUEVO
  fileLabel?: string;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
}

const wrapLabelStyle = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  lineHeight: 1.25,
};
const tfStyles: Partial<ITextFieldStyles> = {
  root: { width: "100%" },
  fieldGroup: { width: "100%" },
  field: { whiteSpace: "normal", wordBreak: "break-word" },
};
const dpStyles: Partial<IDatePickerStyles> = {
  root: { width: "100%" },
  textField: tfStyles,
};

export const DocCard: React.FC<DocCardProps> = ({
  title = "",
  dateLabel,
  dateValue = null,
  onDateChange,
  dateOnly = true,
  textLabel,
  textValue = "",
  onTextChange,
  textAsDropdown = false,                // 👈 NUEVO
  textOptions = [],                      // 👈 NUEVO
  fileLabel = "Archivo adjunto",
  file = null,
  onFileChange,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        border: `1px solid ${theme.palette.neutralLight}`,
        borderRadius: 12,
        padding: 12,
        boxShadow: theme.effects.elevation8,
        background: theme.palette.white,
        marginBottom: 12,
      }}
    >
      <Stack horizontal wrap verticalAlign="start" tokens={{ childrenGap: 12 }}>
        {title && (
          <StackItem styles={{ root: { minWidth: 160 } }}>
            <Label styles={{ root: { fontWeight: 600, ...wrapLabelStyle } }}>
              {title}
            </Label>
          </StackItem>
        )}

        {dateLabel && (
          <StackItem grow styles={{ root: { minWidth: 220, maxWidth: 320 } }}>
            <DatePicker
              label={dateLabel}
              value={dateValue ?? undefined}
              onSelectDate={(d) => onDateChange?.(d ?? null)}
              firstDayOfWeek={1}
              placeholder="Seleccionar fecha"
              ariaLabel={dateLabel}
              allowTextInput={false}
              formatDate={(d) => (d ? d.toLocaleDateString() : "")}
              styles={dpStyles}
            />
          </StackItem>
        )}

        {textLabel && !textAsDropdown && (
          <StackItem grow styles={{ root: { minWidth: 220, maxWidth: 340 } }}>
            <TextField
              label={textLabel}
              value={textValue ?? ""}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              onChange={(ev, v) =>
                onTextChange?.(
                  v ?? (ev?.currentTarget as HTMLInputElement)?.value ?? ""
                )
              }
              styles={tfStyles}
            />
          </StackItem>
        )}

        {textLabel && textAsDropdown && (
          <StackItem grow styles={{ root: { minWidth: 220, maxWidth: 340 } }}>
            <Dropdown
              label={textLabel}
              placeholder="Seleccionar año"
              options={textOptions}
              selectedKey={textValue ?? undefined}
              onChange={(_, option) =>
                onTextChange?.(String(option?.key ?? ""))
              }
              required
            />
          </StackItem>
        )}

        <StackItem grow styles={{ root: { minWidth: 220, maxWidth: 420 } }}>
          <Label styles={{ root: wrapLabelStyle }}>{fileLabel}</Label>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) =>
              onFileChange?.(e.target.files?.length ? e.target.files[0] : null)
            }
          />
          <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
            <DefaultButton
              iconProps={{ iconName: "Upload" }}
              text={file ? "Cambiar archivo" : "Adjuntar"}
              onClick={() => fileInputRef.current?.click()}
            />
            {file && (
              <span
                style={{
                  wordBreak: "break-word",
                  whiteSpace: "normal",
                  lineHeight: 1.25,
                }}
              >
                {file.name}
              </span>
            )}
            {file && (
              <DefaultButton text="Quitar" onClick={() => onFileChange?.(null)} />
            )}
          </Stack>
        </StackItem>
      </Stack>
    </div>
  );
};
