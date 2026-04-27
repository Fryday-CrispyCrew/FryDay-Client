import React from "react";
import TitleInputSection from "./components/TitleInputSection";
import MemoSection from "./components/MemoSection";
import EditToolsRow from "./components/EditToolsRow";
import { toast } from "../../../../shared/components/toast/CenterToast";

export default function EditTodoSection({
  inputRef,
  memoInputRef,
  editingText,
  setEditingText,
  memoText,
  setMemoText,
  handleSubmitInternal,
  isSubmitEnabled,
  hasEditChanges,
  isTitleFocused,
  setIsTitleFocused,
  isMemoFocused,
  setIsMemoFocused,
  handleClearText,
  isMemoOpen,
  selectedToolKey,
  onSelectTool,
  EDIT_TOOL_ICONS,
  selectedCategoryColor,
}) {
  React.useEffect(() => {
    if (isMemoOpen) {
      requestAnimationFrame(() => {
        memoInputRef.current?.focus();
      });
    }
  }, [isMemoOpen]);
  return (
    <>
      <TitleInputSection
        mode="edit"
        inputRef={inputRef}
        value={editingText}
        onChangeText={setEditingText}
        onSubmitEditing={handleSubmitInternal}
        isFocused={isTitleFocused}
        setIsFocused={setIsTitleFocused}
        onClear={handleClearText}
        isMemoOpen={isMemoOpen}
        editable={!selectedToolKey}
      />

      <MemoSection
        visible={isMemoOpen}
        memoInputRef={memoInputRef}
        value={memoText}
        onChangeText={(text) => {
          if (text.length > 100) {
            toast.show("메모는 100자까지 입력 가능합니다.");
            return;
          }
          setMemoText(text);
        }}
        isFocused={isMemoFocused}
        setIsFocused={setIsMemoFocused}
      />

      <EditToolsRow
        selectedToolKey={selectedToolKey}
        onSelectTool={onSelectTool}
        onSubmit={handleSubmitInternal}
        disabled={!isSubmitEnabled || !hasEditChanges}
        selectedColor={selectedCategoryColor}
      />
    </>
  );
}
