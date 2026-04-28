import React from "react";
import type { InviteUploadFormat } from "./templateCatalogUtils";
import "./InviteFormatPicker.css";

/**
 * 4 opzioni formato upload:
 *
 * 1. Quadrato        → card 1:1,    busta verticale,    no rotazione
 * 2. Verticale       → card 2:3,    busta verticale,    no rotazione
 * 3. Verticale (H)   → card 2:3,    busta orizzontale,  rotazione -90°→+90°
 * 4. Orizzontale     → card 11:7,   busta orizzontale,  no rotazione
 */
const FORMATS: Record<
  InviteUploadFormat,
  {
    label: string;
    hint: string;
    /** Aspect ratio card (w/h) */
    cardRatio: number;
    /** Orientamento busta */
    envOrientation: "vertical" | "horizontal";
  }
> = {
  square: {
    label: "Quadrato",
    hint: "Busta verticale",
    cardRatio: 1,
    envOrientation: "vertical",
  },
  vertical: {
    label: "Verticale",
    hint: "Busta verticale",
    cardRatio: 2 / 3,
    envOrientation: "vertical",
  },
  "vertical-henv": {
    label: "Verticale",
    hint: "Busta orizzontale",
    cardRatio: 2 / 3,
    envOrientation: "horizontal",
  },
  horizontal: {
    label: "Orizzontale",
    hint: "Busta orizzontale",
    cardRatio: 11 / 7,
    envOrientation: "horizontal",
  },
};

const ORDER: InviteUploadFormat[] = ["square", "vertical", "vertical-henv", "horizontal"];

type Props = {
  value: InviteUploadFormat;
  onChange: (f: InviteUploadFormat) => void;
  heading?: string;
  className?: string;
};

export default function InviteFormatPicker({ value, onChange, heading, className }: Props) {
  return (
    <div className={`invite-format ${className || ""}`.trim()}>
      {heading ? <p className="invite-format__heading">{heading}</p> : null}
      <div className="invite-format__grid" role="radiogroup" aria-label="Formato invito">
        {ORDER.map((id) => {
          const cfg = FORMATS[id];
          const active = value === id;

          /* Dimensioni card (base 90px per il lato più lungo) */
          const maxSide = 90;
          const cW = cfg.cardRatio >= 1 ? maxSide : Math.round(maxSide * cfg.cardRatio);
          const cH = cfg.cardRatio >= 1 ? Math.round(maxSide / cfg.cardRatio) : maxSide;

          /* Busta proporzionata */
          const envW = cW + 16;
          const envH = cH + 10;
          const flapSize = Math.min(envW, envH) * 0.35;

          /* Per vertical-henv: la busta è orizzontale, card portrait dentro */
          const isRotatedPreview = cfg.envOrientation === "horizontal" && cfg.cardRatio < 1;

          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`invite-format__card${active ? " invite-format__card--active" : ""}`}
              onClick={() => onChange(id)}
            >
              <span className="invite-format__stage" aria-hidden>
                {/* Busta dietro */}
                <span
                  className="invite-format__env"
                  style={{
                    width: isRotatedPreview ? cH + 16 : envW,
                    height: isRotatedPreview ? cW + 10 : envH,
                  }}
                >
                  <span
                    className="invite-format__env-flap"
                    style={{
                      borderLeftWidth: (isRotatedPreview ? cH + 16 : envW) / 2,
                      borderRightWidth: (isRotatedPreview ? cH + 16 : envW) / 2,
                      borderTopWidth: flapSize,
                    }}
                  />
                </span>

                {/* Invito davanti */}
                <span
                  className="invite-format__invite"
                  style={{
                    width: isRotatedPreview ? cH : cW,
                    height: isRotatedPreview ? cW : cH,
                    transform: isRotatedPreview
                      ? "translate(-4px, -4px) rotate(-90deg)"
                      : "translate(-4px, -4px) rotate(-1deg)",
                  }}
                />

              </span>
              <span className="invite-format__label">{cfg.label}</span>
              <span className="invite-format__hint">{cfg.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
