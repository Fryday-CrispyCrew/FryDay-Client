import React from "react";
import TitleInputSection from "./components/TitleInputSection";
import MemoSection from "./components/MemoSection";
import EditToolsRow from "./components/EditToolsRow";

export default function EditTodoSection({
                                          mode = "edit",
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
                                          selectedCategoryColor,
                                        }) {
  React.useEffect(() => {
    if (isMemoOpen) {
      requestAnimationFrame(() => {
        memoInputRef.current?.focus();
      });
    }
  }, [isMemoOpen, memoInputRef]);

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
        onChangeText={setMemoText}
        isFocused={isMemoFocused}
        setIsFocused={setIsMemoFocused}
      />

      <EditToolsRow
        selectedToolKey={selectedToolKey}
        onSelectTool={onSelectTool}
        onSubmit={handleSubmitInternal}
        disabled={!isSubmitEnabled || (mode === "edit" && !hasEditChanges)}
        selectedColor={selectedCategoryColor}
      />
    </>
  );
}