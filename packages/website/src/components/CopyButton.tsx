import { Button, ButtonProps, Tooltip } from '@radix-ui/themes';
import { useState } from 'react';

interface CopyButtonProps extends ButtonProps {
  copy: () => string | undefined;
}

export function CopyButton({ copy, ...props }: CopyButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  return (
    <Tooltip open={tooltipOpen} content="Copied!">
      <Button
        {...props}
        onClick={() => {
          const content = copy();

          if (content === undefined) return;

          navigator.clipboard.writeText(content);
          setTooltipOpen(true);
          setTimeout(() => setTooltipOpen(false), 2000);
        }}
      />
    </Tooltip>
  );
}
