// @TODO: turn this into a more generic component that has the same Props API as MUI https://mui.com/material-ui/react-card/
import Link from "next/link";
import type { ReactNode } from "react";
import React from "react";

import classNames from "@calcom/lib/classNames";
import { FiArrowRight } from "@calcom/ui/components/icon";

import { Button } from "../button";

export type BaseCardProps = {
  image?: string;
  icon?: ReactNode;
  variant: keyof typeof cardTypeByVariant;
  imageProps?: JSX.IntrinsicElements["img"];
  title: string;
  description: ReactNode;
  containerProps?: JSX.IntrinsicElements["div"];
  actionButton?: {
    href?: string;
    child: ReactNode;
    onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  };
  learnMore?: {
    href: string;
    text: string;
  };
  mediaLink?: string;
  thumbnailUrl?: string;
};

// @TODO: use CVA

const cardTypeByVariant = {
  basic: {
    image: "w-10 h-auto",
    card: "p-5",
    title: "text-base mt-4",
    description: "text-sm leading-[18px] text-subtle font-normal",
  },
  ProfileCard: {
    image: "w-9 h-auto rounded-full mb-4s",
    card: "w-80 p-4 hover:bg-subtle",
    title: "text-base",
    description: "text-sm leading-[18px] text-subtle font-normal",
  },
  SidebarCard: {
    image: "w-9 h-auto rounded-full mb-4s",
    card: "w-full p-3 border border-subtle",
    title: "text-sm font-cal",
    description: "text-xs text-default line-clamp-2",
  },
};

export function Card({
  image,
  title,
  icon,
  description,
  variant,
  actionButton,
  containerProps,
  imageProps,
  mediaLink,
  thumbnailUrl,
  learnMore,
}: BaseCardProps) {
  return (
    <div
      className={classNames(
        containerProps?.className,
        cardTypeByVariant[variant].card,
        "bg-default border-subtle flex flex-col justify-between rounded-md border"
      )}
      {...containerProps}>
      <div>
        {icon && icon}
        {image && (
          <img
            src={image}
            // Stops eslint complaining - not smart enough to realise it comes from ...imageProps
            alt={imageProps?.alt}
            className={classNames(imageProps?.className, cardTypeByVariant[variant].image)}
            {...imageProps}
          />
        )}
        <h5
          title={title}
          className={classNames(
            cardTypeByVariant[variant].title,
            "line-clamp-1 text-emphasis font-bold leading-5"
          )}>
          {title}
        </h5>
        {description && (
          <p
            title={description.toString()}
            className={classNames(cardTypeByVariant[variant].description, "pt-1")}>
            {description}
          </p>
        )}
      </div>
      {variant === "SidebarCard" && (
        <a
          onClick={actionButton?.onClick}
          target="_blank"
          rel="noreferrer"
          href={mediaLink}
          className="group relative my-3 flex aspect-video items-center overflow-hidden rounded">
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity group-hover:bg-opacity-40" />
          <svg
            className="text-inverted absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 transform rounded-full shadow-lg hover:-mt-px"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
              fill="white"
            />
            <path
              d="M12.1667 8.5L23.8334 16L12.1667 23.5V8.5Z"
              fill="#111827"
              stroke="#111827"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <img alt="play feature video" src={thumbnailUrl} />
        </a>
      )}

      {/* TODO: this should be CardActions https://mui.com/material-ui/api/card-actions/ */}
      <div>
        {variant === "basic" && (
          <Button color="secondary" href={actionButton?.href} className="mt-10" EndIcon={FiArrowRight}>
            {actionButton?.child}
          </Button>
        )}
      </div>

      {variant === "SidebarCard" && (
        <div className="mt-2 flex items-center justify-between">
          {learnMore && (
            <Link
              href={learnMore.href}
              onClick={actionButton?.onClick}
              target="_blank"
              rel="noreferrer"
              prefetch={!learnMore.href.startsWith("https://cal.com/blog")}
              className="text-default text-xs font-medium">
              {learnMore.text}
            </Link>
          )}
          <button
            className="text-default hover:text-emphasis p-0 text-xs font-normal"
            color="minimal"
            onClick={actionButton?.onClick}>
            {actionButton?.child}
          </button>
        </div>
      )}
    </div>
  );
}

export default Card;
