import * as React from "react";
import { Stack, StackItem, Label, TextField } from "@fluentui/react";
import { Vehiculo } from "../../models/vehiculo";
import { theme } from "../../ui/styles";

type Props = {
  vehiculo: Vehiculo;
  setVehiculo: React.Dispatch<React.SetStateAction<Vehiculo>>;
  disabled?: boolean;
};

export function Notificaciones({ vehiculo, setVehiculo, disabled }: Props) {
  return (
    <Stack
      tokens={{ childrenGap: 12 }}
      styles={{
        root: {
          background: theme.palette.white,
          borderRadius: 12,
          padding: 16,
          boxShadow: (theme.effects as any).elevation8,
          marginTop: 12,
        },
      }}
    >
      <Label styles={{ root: { fontWeight: 600, fontSize: 16 } }}>
        Notificaciones
      </Label>

      <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
        <StackItem grow styles={{ root: { minWidth: 240 } }}>
          <TextField
            label="Correos de notificación"
            placeholder="correo1@dominio.com; correo2@dominio.com"
            value={vehiculo.CorreosNotificacion || ""}
            onChange={(_, v) =>
              setVehiculo((s) => ({ ...s, CorreosNotificacion: v || "" }))
            }
            disabled={disabled}
            multiline
            autoAdjustHeight
          />
        </StackItem>
      </Stack>
    </Stack>
  );
}

export default Notificaciones;
