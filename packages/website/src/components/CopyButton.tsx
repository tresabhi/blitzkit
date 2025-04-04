import { Button, type ButtonProps, Tooltip } from '@radix-ui/themes';
import { useState } from 'react';
import { useLocale } from '../hooks/useLocale';

interface CopyButtonProps extends ButtonProps {
  copy: () => string | undefined;
}

export function CopyButton({ copy, ...props }: CopyButtonProps) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const { strings } = useLocale();

  return (
    <Tooltip
      open={tooltipOpen}
      content={strings.website.common.copy_button.copied}
    >
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
