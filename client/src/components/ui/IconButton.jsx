import React from "react";
import { Button } from "./Button";

export const IconButton = ({
  icon,
  size = "md",
  variant = "ghost",
  "aria-label": ariaLabel,
  ...props
}) => {
  return (
    <Button
      size="icon"
      variant={variant}
      aria-label={ariaLabel}
      className={`btn-icon btn-${size}`}
      {...props}
    >
      {icon}
    </Button>
  );
};
