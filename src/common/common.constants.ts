import { IOptions } from "sanitize-html";

export enum OrderEnum {
  ASC = "ASC",
  DESC = "DESC",
}

export const sanitizeHtmlOptions: IOptions = {
  allowedTags: [
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "strong",
    "em",
    "u",
    "s",
    "blockquote",
    "code",
    "ul",
    "ol",
    "li",
    "span",
    "img",
  ],
  allowedAttributes: {
    img: ["src", "alt", "title", "width", "height"],
    span: ["style"],
  },
  allowedStyles: {
    span: {
      color: [/^#(0x)?[0-9a-f]+$/i],
      "background-color": [/^#(0x)?[0-9a-f]+$/i],
    },
  },
  allowedSchemes: ["https"],
};
