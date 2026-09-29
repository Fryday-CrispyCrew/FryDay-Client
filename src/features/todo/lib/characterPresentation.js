export function getLottieKeyFromStatus(status) {
  switch (status) {
    case "CASE_A":
      return "caseA";
    case "CASE_B":
      return "caseB";
    case "CASE_C":
      return "caseC";
    case "CASE_D":
      return "caseD";
    case "CASE_E1":
      return "caseE1";
    case "CASE_E2":
      return "caseE2";
    case "CASE_F":
      return "caseF";
    case "CASE_G":
      return "caseG";
    case "CASE_H":
      return "caseH";
    default:
      return null;
  }
}
