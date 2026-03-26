import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export default function useTodoEditorKeyboard() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return {
    isKeyboardVisible,
  };
}
