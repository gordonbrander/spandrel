export const isVowel = c => {
  let c2 = c.toLowerCase();
  return (c2 === 'a') || (c2 === 'e') || (c2 === 'i') || (c2 === 'o') || (c2 === 'u');
};

export const isAlphaNum = c => {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9');
};

export const capitalizeAll = s => {
  let s2 = "";
  let capNext = true;
  for (let i = 0; i < s.length; i++) {
    if (!isAlphaNum(s.charAt(i))) {
      capNext = true;
      s2 += s.charAt(i);
    } else {
      if (!capNext) {
        s2 += s.charAt(i);
      } else {
        s2 += s.charAt(i).toUpperCase();
        capNext = false;
      }
    }
  }
  return s2;
}

export const capitalize = s => s.charAt(0).toUpperCase() + s.substring(1)

export const lowercase = s => s.toLowerCase()

export const a = s => {
  if (s.length > 0) {
    if (s.charAt(0).toLowerCase() === 'u') {
      if (s.length > 2) {
        if (s.charAt(2).toLowerCase() === 'i')
          return "a " + s;
      }
    }

    if (isVowel(s.charAt(0))) {
      return "an " + s;
    }
  }

  return "a " + s;
}

export const firstS = s => {
  let s2 = s.split(" ");
  let finished = baseEngModifiers.s(s2[0]) + " " + s2.slice(1).join(" ");
  return finished;
}

export const s = s => {
  switch (s.charAt(s.length -1)) {
  case 's':
    return s + "es";
    break;
  case 'h':
    return s + "es";
    break;
  case 'x':
    return s + "es";
    break;
  case 'y':
    if (!isVowel(s.charAt(s.length - 2)))
      return s.substring(0, s.length - 1) + "ies";
    else
      return s + "s";
    break;
  default:
    return s + "s";
  }
}

export const ed = s => {
  switch (s.charAt(s.length -1)) {
  case 's':
    return s + "ed";
  case 'e':
    return s + "d";
  case 'h':
    return s + "ed";
  case 'x':
    return s + "ed";
  case 'y':
    if (!isVowel(s.charAt(s.length - 2))) {
      return s.substring(0, s.length - 1) + "ied";
    } else {
      return s + "d";
    }
  default:
    return s + "ed";
  }
}

const modifiers = {
  capitalizeAll,
  capitalize,
  lowercase,
  a,
  firstS,
  s,
  ed
}

export default modifiers
