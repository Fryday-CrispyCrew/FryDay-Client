export const nicknameKeys = {
    all: ["nickname"],
    check: (nickname) => [...nicknameKeys.all, "check", nickname],
};
