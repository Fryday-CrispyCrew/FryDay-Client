import { useCallback, useRef } from "react";
import { InteractionManager, Keyboard } from "react-native";

export default function useTodoEditorFocus({
  setIsTitleFocused,
  setIsMemoFocused,
}) {
  const inputRef = useRef(null);
  const memoInputRef = useRef(null);

  const focusTitleInput = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, []);

  const blurMemoOnly = useCallback(() => {
    memoInputRef.current?.blur?.();
    setIsMemoFocused(false);
  }, [setIsMemoFocused]);

  const blurAllInputs = useCallback(() => {
    inputRef.current?.blur?.();
    memoInputRef.current?.blur?.();
    setIsTitleFocused(false);
    setIsMemoFocused(false);
    Keyboard.dismiss();
  }, [setIsTitleFocused, setIsMemoFocused]);

  return {
    inputRef,
    memoInputRef,
    focusTitleInput,
    blurMemoOnly,
    blurAllInputs,
  };
}
