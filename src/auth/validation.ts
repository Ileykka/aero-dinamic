import { PHONE_MAX_DIGITS } from "../lib/phoneMask";

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateName(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите имя";
  if (t.length < 2) return "Имя не короче 2 символов";
  if (t.length > 80) return "Имя слишком длинное";
  return null;
}

export function validateEmail(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите email";
  if (!EMAIL_RE.test(t)) return "Некорректный email";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Введите пароль";
  if (value.length < 6) return "Пароль не короче 6 символов";
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (password !== confirm) return "Пароли не совпадают";
  return null;
}

const LOGIN_RE = /^[a-zA-Zа-яА-ЯёЁ0-9._@+-]+$/u;

export function validateLogin(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите логин";
  if (t.length < 3) return "Логин не короче 3 символов";
  if (t.length > 64) return "Логин слишком длинный";
  if (!LOGIN_RE.test(t)) return "Недопустимые символы в логине";
  return null;
}

export function validateSurname(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите фамилию";
  if (t.length < 2) return "Фамилия не короче 2 символов";
  if (t.length > 80) return "Фамилия слишком длинная";
  return null;
}

export function validatePersonalDataConsent(accepted: boolean): string | null {
  if (!accepted) return "Необходимо согласие на обработку персональных данных";
  return null;
}

export function validateFullName(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите ФИО";
  if (t.length < 2) return "ФИО не короче 2 символов";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "Укажите фамилию и имя";
  if (t.length > 120) return "ФИО слишком длинное";
  return null;
}

export function validatePhone(digits: string): string | null {
  if (!digits) return "Введите телефон";
  if (digits.length < PHONE_MAX_DIGITS) return "Введите номер телефона полностью";
  return null;
}

export function validateMessage(value: string): string | null {
  const t = value.trim();
  if (!t) return "Введите сообщение";
  if (t.length < 5) return "Сообщение не короче 5 символов";
  if (t.length > 2000) return "Сообщение слишком длинное";
  return null;
}
