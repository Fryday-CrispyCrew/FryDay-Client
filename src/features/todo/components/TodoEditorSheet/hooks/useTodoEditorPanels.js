import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractionManager, Keyboard } from "react-native";

export default function useTodoEditorPanels({
  mode,
  blurMemoOnly,
  focusTitleInput,
  inputRef,
  memoInputRef,
  setIsTitleFocused,
  setIsMemoFocused,
  setIsIosInlineAlarmPickerOpen,
}) {
  const [selectedToolKey, setSelectedToolKey] = useState(null);
  const [openRepeatDropdownKey, setOpenRepeatDropdownKey] = useState(null);

  const selectedToolKeyRef = useRef(null);
  const isToolTransitioningRef = useRef(false);

  useEffect(() => {
    selectedToolKeyRef.current = selectedToolKey;
  }, [selectedToolKey]);

  const isMemoOpen = mode === "edit" && selectedToolKey === "memo";
  const isAlarmOpen = mode === "edit" && selectedToolKey === "alarm";
  const isRepeatOpen = mode === "edit" && selectedToolKey === "repeat";
  const isSelectDateOpen = mode === "edit" && selectedToolKey === "select";

  useEffect(() => {
    if (!isRepeatOpen) {
      setOpenRepeatDropdownKey(null);
    }
  }, [isRepeatOpen]);

  const toggleRepeatDropdown = useCallback((key) => {
    setOpenRepeatDropdownKey((prev) => (prev === key ? null : key));
  }, []);

  const closePanelAndFocusTitle = useCallback(
    (closingKey) => {
      setSelectedToolKey(null);
      blurMemoOnly();

      if (closingKey === "alarm") {
        setIsIosInlineAlarmPickerOpen(false);
      }

      setIsTitleFocused(true);
      focusTitleInput();
    },
    [
      blurMemoOnly,
      focusTitleInput,
      setIsIosInlineAlarmPickerOpen,
      setIsTitleFocused,
    ],
  );

  const openToolAfterKeyboardDismiss = useCallback(
    (key) => {
      inputRef.current?.blur?.();
      memoInputRef.current?.blur?.();
      setIsTitleFocused(false);
      setIsMemoFocused(false);
      Keyboard.dismiss();

      isToolTransitioningRef.current = true;

      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setSelectedToolKey(key);
          setTimeout(() => {
            isToolTransitioningRef.current = false;
          }, 400);
        });
      });
    },
    [inputRef, memoInputRef, setIsMemoFocused, setIsTitleFocused],
  );

  const onSelectTool = useCallback(
    (key) => {
      const current = selectedToolKeyRef.current;

      if (current === key) {
        if (key === "alarm") {
          setIsIosInlineAlarmPickerOpen(false);
        }
        setSelectedToolKey(null);
        setIsTitleFocused(true);
        focusTitleInput();
        return;
      }

      if (key === "memo") {
        setSelectedToolKey("memo");
        return;
      }

      if (key === "alarm") {
        setIsIosInlineAlarmPickerOpen(false);
      }

      openToolAfterKeyboardDismiss(key);
    },
    [
      focusTitleInput,
      openToolAfterKeyboardDismiss,
      setIsIosInlineAlarmPickerOpen,
      setIsTitleFocused,
    ],
  );

  return {
    selectedToolKey,
    setSelectedToolKey,
    selectedToolKeyRef,
    isToolTransitioningRef,
    openRepeatDropdownKey,
    setOpenRepeatDropdownKey,
    toggleRepeatDropdown,
    isMemoOpen,
    isAlarmOpen,
    isRepeatOpen,
    isSelectDateOpen,
    closePanelAndFocusTitle,
    openToolAfterKeyboardDismiss,
    onSelectTool,
  };
}
