// src/webparts/registroVehicular/components/ActionTile.tsx
import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import { classes, tileButtonStyles } from "../../ui/styles";

export const ActionTile: React.FC<{
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, selected, onClick, disabled }) => (
  <div className={classes.actionWrap}>
    <DefaultButton
      text={label}
      iconProps={{ iconName: icon }}
      styles={tileButtonStyles}
      checked={selected}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
    />
    {selected && <span className={classes.actionDot} />}
  </div>
);
