import * as admin from "firebase-admin";
import { orderCreatedData, orderUpdateData } from "./types";
import { isEmpty } from "./utils";

export const isNumber = (value: string, option: any = {}) => {
  if (!/^-?[0-9]+$/.test(value)) {
    return false;
  }
  if (option.maxDigits) {
    if (value.length > option.maxDigits) {
      return false;
    }
  }
  if (option.minDigits !== undefined) {
    if (option.minDigits > value.length) {
      return false;
    }
  }

  if (option.max !== undefined) {
    if (Number(value) > option.max) {
      return false;
    }
  }

  if (option.min !== undefined) {
    if (option.min > Number(value)) {
      return false;
    }
  }

  return true;
};

export const isString = (value: string, option: any = {}) => {
  if (option.type !== undefined) {
    if (option.type === "number") {
      if (!/^-?[0-9]+$/.test(value)) {
        return false;
      }
    }
    if (option.type === "alpha") {
      if (!/^[a-zA-Z]+$/.test(value)) {
        return false;
      }
    }
    if (option.type === "alphanumeric") {
      if (!/^[0-9a-zA-Z]+$/.test(value)) {
        return false;
      }
    }
  }
  if (option.maxLen !== undefined) {
    if (value.length > option.maxLen) {
      return false;
    }
  }
  if (option.minLen !== undefined) {
    if (option.minLen > value.length) {
      return false;
    }
  }
  return true;
};

export const validateFirebaseId = (id: string) => {
  return /^[a-zA-Z0-9]+$/.test(id);
};
export const validateBase64 = (id: string) => {
  return /^[a-zA-Z0-9+/]+$/.test(id);
};
export const validateBase64Ext = (id: string) => {
  return /^[a-zA-Z0-9+\-_/]+$/.test(id);
};

const validateNumber = (text: number) => {
  return typeof text === 'number';
};
const validateNumberString = (text: string) => {
  console.log("not implemented yet");
  return typeof text === 'string';
};
const validateInteger = (text: string) => {
  console.log("not implemented yet");
  return typeof text === 'number';
};
const validateIntegerString = (text: string) => {
  console.log("not implemented yet");
  return typeof text === 'string';
};

const validateString = (text: string) => {
  console.log("not implemented yet");
  return typeof text === 'string';
};
const validateAlphabet = (text: string) => {
  return /^[a-zA-Z]+$/.test(text);
};
const validateTimestamp = (timestamp: admin.firestore.Timestamp) => {
  return (timestamp.seconds && timestamp.nanoseconds);
};


const validateArray = {
  firebaseId: validateFirebaseId,
  number: validateNumber,
  numberStrong: validateNumberString,
  integer: validateInteger,
  integerString: validateIntegerString,
  string: validateString,
  alphabet: validateAlphabet,
  timestamp: validateTimestamp,
};

const validateData = (data, validator) => {
  const errors = Object.keys(validator).reduce((tmp: Object[], key: string) => {
    const rule = validator[key];
    if (rule.required && isEmpty(data[key])) {
      tmp.push({
        key,
        empty: true,
      });
      return tmp;
    }
    if (!isEmpty(data[key])) {
      if (!validateArray[rule.type](data[key])) {
        tmp.push({
          key,
          error: "invalid",
        });
      }
    }
    if (rule.regex) {
      if (!rule.regex.test(data[key])) {
        tmp.push({
          key,
          error: "regexError",
        });
      }
    }
    return tmp
  }, []);
  return {
    result: errors.length === 0,
    errors
  };
};

export const validateOrderCreated = (data: orderCreatedData) => {
  const validator = {
    restaurantId: {
      type: "firebaseId",
      required: true,
    },
    orderId: {
      type: "firebaseId",
      required: true,
    },
  };
  return validateData(data, validator);
};

export const validateOrderUpadte = (data: orderUpdateData) => {
  const validator = {
    restaurantId: {
      type: "firebaseId",
      required: true,
    },
    orderId: {
      type: "firebaseId",
      required: true,
    },
    status: {
      type: "number",
      required: true,
    },
    timezone: {
      type: "string",
      regex: /^([a-zA-Z]+)\/([a-zA-Z]+)$/,
      required: true,
    },
    lng: {
      type: "alphabet",
      required: false,
    },
    timeEstimated: {
      type: "timestamp",
      required: false,
    },
  }
  return validateData(data, validator);
};
