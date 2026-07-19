export function displayModelCode(
  code: string
): string {


  if (!code) {
    return "";
  }



  // Crown 特殊顯示
  if (code.startsWith("CROWN")) {


    const number =
      code.replace(
        "CROWN",
        ""
      );


    return `👑 CY${number}`;


  }



  return code;

}