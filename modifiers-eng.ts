export const isVowel = (c: string): boolean => {
  const c2 = c.toLowerCase();
  return c2 === "a" || c2 === "e" || c2 === "i" || c2 === "o" || c2 === "u";
};

export const isAlphaNum = (c: string): boolean => {
  return (
    (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || (c >= "0" && c <= "9")
  );
};

export const capitalizeAll = (text: string): string => {
  let s2 = "";
  let capNext = true;
  for (let i = 0; i < text.length; i++) {
    if (!isAlphaNum(text.charAt(i))) {
      capNext = true;
      s2 += text.charAt(i);
    } else {
      if (!capNext) {
        s2 += text.charAt(i);
      } else {
        s2 += text.charAt(i).toUpperCase();
        capNext = false;
      }
    }
  }
  return s2;
};

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.substring(1);

export const lowercase = (s: string): string => s.toLowerCase();

export const a = (s: string): string => {
  if (s.length > 0) {
    if (s.charAt(0).toLowerCase() === "u") {
      if (s.length > 2) {
        if (s.charAt(2).toLowerCase() === "i") return "a " + s;
      }
    }

    if (isVowel(s.charAt(0))) {
      return "an " + s;
    }
  }

  return "a " + s;
};

export const s = (text: string): string => {
  switch (text.charAt(text.length - 1)) {
    case "":
      return text;
    case "s":
      return text + "es";
    case "h":
      return text + "es";
    case "x":
      return text + "es";
    case "y":
      if (!isVowel(text.charAt(text.length - 2))) {
        return text.substring(0, text.length - 1) + "ies";
      } else {
        return text + "s";
      }
    default:
      return text + "s";
  }
};

export const firstS = (text: string): string => {
  const s2 = text.split(" ");
  s2[0] = s(s2[0]);
  return s2.join(" ");
};

export const ed = (s: string): string => {
  switch (s.charAt(s.length - 1)) {
    case "s":
      return s + "ed";
    case "e":
      return s + "d";
    case "h":
      return s + "ed";
    case "x":
      return s + "ed";
    case "y":
      if (!isVowel(s.charAt(s.length - 2))) {
        return s.substring(0, s.length - 1) + "ied";
      } else {
        return s + "d";
      }
    default:
      return s + "ed";
  }
};
