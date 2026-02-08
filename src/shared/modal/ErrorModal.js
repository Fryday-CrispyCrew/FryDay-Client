import React from "react";
import { View, Image } from "react-native";
import BaseModal from "../components/modal/BaseModal";
import AppText from "../components/AppText";

export default function ErrorModal({
                                       visible,
                                       onClose,
                                       message = "아차차... 정보를 불러오지 못했어요.\n잠시 후 다시 시도해 주세요!",
                                   }) {
    return (
        <BaseModal hideCard
            visible={!!visible}
            title=""
            showClose={false}
            onRequestClose={onClose}
            onBackdropPress={onClose}
        >
            <View style={styles.overlay}>
                <Image
                    source={require("../assets/png/Error.png")}
                    style={styles.image}
                    resizeMode="contain"
                />
                <AppText variant="M500" className="text-gr500 text-center">
                    {message}
                </AppText>
            </View>
        </BaseModal>
    );
}

const styles = {
    overlay: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: 220,
        height: 220,
    },
};
