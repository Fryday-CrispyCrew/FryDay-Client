// src/shared/components/wheels/WheelColumn.jsx
import React, {useCallback, useEffect, useRef} from "react";
import {View, Text, FlatList, StyleSheet} from "react-native";

const ITEM_H = 36;
const VISIBLE = 5; // 홀수
const PADDING = Math.floor(VISIBLE / 2) * ITEM_H;

export default function WheelColumn({
  data,
  selectedIndex,
  onChangeIndex,
  renderLabel = (v) => String(v),
  itemHeight = ITEM_H,
  visibleCount = VISIBLE,
  activeTextStyle,
  textStyle,
  containerStyle,
}) {
  const ref = useRef(null);
  const padding = Math.floor(visibleCount / 2) * itemHeight;

  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollToOffset({
      offset: selectedIndex * itemHeight,
      animated: false,
    });
  }, [selectedIndex, itemHeight]);

  const onMomentumEnd = useCallback(
    (e) => {
      const y = e.nativeEvent.contentOffset.y;
      const idx = Math.round(y / itemHeight);
      onChangeIndex?.(idx);
    },
    [itemHeight, onChangeIndex]
  );

  return (
    <View
      style={[
        styles.col,
        {height: itemHeight * visibleCount, borderRadius: 200},
        containerStyle,
      ]}
    >
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(item, idx) => `${item}-${idx}`}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        bounces={false}
        contentContainerStyle={{paddingVertical: padding}}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
        renderItem={({item, index}) => {
          const isActive = index === selectedIndex;
          return (
            <View style={[styles.item, {height: itemHeight}]}>
              <Text
                style={[
                  styles.text,
                  textStyle,
                  isActive && styles.textActive,
                  isActive && activeTextStyle,
                ]}
              >
                {renderLabel(item)}
              </Text>
            </View>
          );
        }}
      />

      <View
        pointerEvents="none"
        style={[styles.centerHighlight, {top: padding, height: itemHeight}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  col: {
    flex: 1,
    backgroundColor: "#F6F6F6",
    overflow: "hidden",
  },
  item: {alignItems: "center", justifyContent: "center"},
  text: {fontSize: 13, color: "#5D5E60"},
  textActive: {color: "#FF5722", fontWeight: "600"},
  centerHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    // borderTopWidth: 1,
    // borderBottomWidth: 1,
    // borderColor: "rgba(0,0,0,0.08)",
    // backgroundColor: "rgba(255,255,255,0.6)",
    // borderColor: "rgba(0,0,0,0.04)",
    // backgroundColor: "rgba(255,255,255,0.35)",
  },
});
