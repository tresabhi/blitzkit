import { RatingsReward } from '../../../commands/ratings';
import { theme } from '../../../stitches.config';

export interface ItemProps {
  position: number;
  deltaPosition?: number;
  score: number;
  deltaScore?: number;
  reward?: RatingsReward;
  nickname: string;
  clan?: string;
  highlight?: boolean;
}

function normalizeImage(url: string) {
  return url.endsWith('.webp') ? 'https://i.imgur.com/ZniCzbO.png' : url;
}

export function Item({
  position,
  deltaPosition,
  score,
  deltaScore,
  reward,
  nickname,
  clan,
  highlight,
}: ItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: 8,
        backgroundColor: highlight
          ? theme.colors.componentInteractive_blue
          : theme.colors.componentInteractive,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          color: highlight
            ? theme.colors.textLowContrast_blue
            : theme.colors.textLowContrast,
          fontSize: 16,
        }}
      >
        {position.toLocaleString()}.
      </span>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        <span
          style={{
            color: highlight
              ? theme.colors.textHighContrast_blue
              : theme.colors.textHighContrast,
            fontSize: 16,
          }}
        >
          {nickname}
        </span>
        {clan && (
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            [{clan}]
          </span>
        )}
      </div>

      {deltaPosition !== undefined && deltaPosition !== 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <img
            style={{
              width: 8,
              height: 8,
            }}
            src={
              deltaPosition > 0
                ? 'https://i.imgur.com/qbjiXa1.png'
                : 'https://i.imgur.com/3uyNhun.png'
            }
          />
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            {Math.abs(deltaPosition).toLocaleString()}
          </span>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 4,
        }}
      >
        {reward && (
          <img
            style={{ width: 16, height: 16, objectFit: 'cover' }}
            src={normalizeImage(
              reward.type === 'vehicle'
                ? reward.vehicle.image_url
                : reward.stuff.image_url,
            )}
          />
        )}
        {reward && reward.count > 1 && (
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            x {reward.count.toLocaleString()}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          width: 96,
          justifyContent: 'flex-end',
        }}
      >
        {deltaScore !== 0 && deltaScore !== undefined && (
          <span
            style={{
              color: highlight
                ? theme.colors.textLowContrast_blue
                : theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            {Math.abs(deltaScore).toLocaleString()}
          </span>
        )}
        {deltaScore !== 0 && deltaScore !== undefined && (
          <img
            style={{
              width: 8,
              height: 8,
            }}
            src={
              deltaScore > 0
                ? 'https://i.imgur.com/qbjiXa1.png'
                : 'https://i.imgur.com/3uyNhun.png'
            }
          />
        )}
        <span
          style={{
            color: highlight
              ? theme.colors.textHighContrast_blue
              : theme.colors.textHighContrast,
            fontSize: 16,
          }}
        >
          {score.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
