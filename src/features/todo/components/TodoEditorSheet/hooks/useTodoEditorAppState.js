import { useEffect, useRef } from "react";
import { AppState } from "react-native";

export default function useTodoEditorAppState({ blurAllInputs }) {
  const isReturningFromBackgroundRef = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "inactive" || nextState === "background") {
        isReturningFromBackgroundRef.current = true;
        blurAllInputs();
        return;
      }

      if (nextState === "active") {
        requestAnimationFrame(() => {
          isReturningFromBackgroundRef.current = false;
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [blurAllInputs]);

  return {
    isReturningFromBackgroundRef,
  };
}
