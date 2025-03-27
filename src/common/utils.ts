import * as bcrypt from "bcrypt";
import { Cache } from "cache-manager";
import * as crypto from "crypto";

export class Utils {
  static async hash(string: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(string, salt);
  }

  static async isSameAsHash(string?: string | null, hash?: string | null) {
    if (!string || !hash) {
      return false;
    }

    return await bcrypt.compare(string, hash);
  }

  static generateRandomHexString() {
    return crypto.randomBytes(32).toString("hex");
  }

  static getDateWithoutTime(date: Date) {
    return new Date(date.toISOString().slice(0, 10));
  }

  static encrypt(unencryptedString: string, key: string) {
    const unencryptedBuffer = Buffer.from(unencryptedString, "utf8");

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
      "aes-256-gcm",
      Buffer.from(key, "hex"),
      iv,
    );

    const encryptedBuffer = Buffer.concat([
      cipher.update(unencryptedBuffer),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    const encryptedString =
      iv.toString("hex") +
      "+" +
      authTag.toString("hex") +
      "+" +
      encryptedBuffer.toString("hex");

    return encryptedString;
  }

  static decrypt(encryptedString: string, key: string) {
    const iv = Buffer.from(encryptedString.split("+")[0], "hex");

    const authTag = Buffer.from(encryptedString.split("+")[1], "hex");

    const encryptedBuffer = Buffer.from(encryptedString.split("+")[2], "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(key, "hex"),
      iv,
    );

    decipher.setAuthTag(authTag);

    const unencryptedBuffer = Buffer.concat([
      decipher.update(encryptedBuffer),
      decipher.final(),
    ]);

    const unencryptedString = unencryptedBuffer.toString("utf8");

    return unencryptedString;
  }

  static normalizeEmail(email: string) {
    const normalizeableProviders: Record<
      string,
      { plus?: boolean; dot?: boolean; aliasOf?: string }
    > = {
      "gmail.com": {
        plus: true,
        dot: true,
      },
      "googlemail.com": {
        plus: true,
        dot: true,
        aliasOf: "gmail.com",
      },
      "hotmail.com": {
        plus: true,
      },
      "live.com": {
        plus: true,
      },
      "outlook.com": {
        plus: true,
      },
    };

    email = email.trim().toLowerCase();

    const emailParts = email.split("@");

    let username = emailParts[0];

    let domain = emailParts[1];

    if (normalizeableProviders[domain]) {
      if (normalizeableProviders[domain].plus) {
        username = username.split("+")[0];
      }

      if (normalizeableProviders[domain].dot) {
        username = username.replace(/\./g, "");
      }

      domain = normalizeableProviders[domain].aliasOf ?? domain;
    }

    return username + "@" + domain;
  }

  static getNextXDates(date: Date, numDays: number) {
    return Array.from({ length: numDays }, (_, i) => {
      const newDate = new Date(date);

      newDate.setDate(newDate.getDate() + i);

      return newDate;
    });
  }

  static getDateStringAtTimeZone(
    date: Date | string,
    locale: string,
    timeZone: string,
  ) {
    return new Date(date).toLocaleDateString(locale, { timeZone });
  }

  static async withCache<T>(
    cacheManager: Cache,
    key: string,
    ttl: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const cachedValue = await cacheManager.get<T>(key);

    if (cachedValue) {
      return cachedValue;
    }

    const value = await fn();

    await cacheManager.set(key, value, ttl);

    return value;
  }
}
