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
        <BaseModal
            visible={!!visible}
            title=""
            showClose={false}
            onRequestClose={onClose}
            onBackdropPress={onClose}
        >
            <View style={styles.wrap}>
                <Image
                    source={require("../assets/png/error-icon.png")}
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
    wrap: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 4,
    },
    image: {
        width: 220,
        height: 220,
        marginBottom: 14,
    },
};
