// src/shared/components/modal/ModalHost.jsx
import React from "react";
import CommonModal from "./CommonModal";
import {useModalStore} from "../../stores/modal/modalStore";

export default function ModalHost() {
  const {visible, props, close} = useModalStore();
  if (!props) return null;

  return (
    <CommonModal
      visible={visible}
      title={props.title}
      description={props.description}
      footerSlot={props.footerSlot}
      closeOnBackdrop={props.closeOnBackdrop}
      showClose={props.showClose}
      onClose={() => {
        props.onClose?.();
        close();
      }}
      primary={
        props.primary
          ? {
              ...props.primary,
              onPress: () => {
                props.primary.onPress?.();
                if (props.primary.closeAfterPress !== false) close();
              },
            }
          : null
      }
      secondary={
        props.secondary
          ? {
              ...props.secondary,
              onPress: () => {
                props.secondary.onPress?.();
                if (props.secondary.closeAfterPress !== false) close();
              },
            }
          : null
      }
    />
  );
}
