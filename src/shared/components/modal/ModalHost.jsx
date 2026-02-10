// src/shared/components/modal/ModalHost.jsx
import React, {useState, useEffect} from "react";
import CommonModal from "./CommonModal";
import DoNotAskAgainCheckbox from "./DoNotAskAgainCheckbox";
import {useModalStore} from "../../stores/modal/modalStore";

export default function ModalHost() {
  const {visible, props, close} = useModalStore();
  const [doNotAskAgain, setDoNotAskAgain] = useState(false);

  // 모달이 닫힐 때 체크 상태 리셋
  useEffect(() => {
    if (!visible) setDoNotAskAgain(false);
  }, [visible]);

  if (!props) return null;

  const footerSlot = props.showDoNotAskAgain ? (
    <DoNotAskAgainCheckbox
      checked={doNotAskAgain}
      onToggle={() => setDoNotAskAgain((prev) => !prev)}
    />
  ) : (
    props.footerSlot
  );

  return (
    <CommonModal
      visible={visible}
      title={props.title}
      description={props.description}
      footerSlot={footerSlot}
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
                props.primary.onPress?.(doNotAskAgain);
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
