import { RatingsReward } from '../../../commands/ratings';
import { theme } from '../../../stitches.config';

export interface ItemProps {
  position: number;
  deltaPosition?: number;
  points: number;
  deltaPoints?: number;
  reward?: RatingsReward;
  nickname: string;
  clan?: string;
}

export function Item({
  position,
  deltaPosition,
  points,
  deltaPoints,
  reward,
  nickname,
  clan,
}: ItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        padding: 8,
        backgroundColor: theme.colors.componentInteractive,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <span
        style={{
          color: theme.colors.textLowContrast,
          fontSize: 16,
        }}
      >
        {position}.
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
            color: theme.colors.textHighContrast,
            fontSize: 16,
          }}
        >
          {nickname}
        </span>
        {clan && (
          <span
            style={{
              color: theme.colors.textLowContrast,
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
              color: theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            {deltaPosition}
          </span>
        </div>
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {reward && (
          <img
            style={{ width: 16, height: 16 }}
            src={
              reward.type === 'vehicle'
                ? reward.vehicle.image_url
                : reward.stuff.image_url
            }
          />
        )}
        {reward?.type === 'stuff' && (
          <span
            style={{
              color: theme.colors.textLowContrast,
              fontSize: 16,
            }}
          >
            x {reward.count}
          </span>
        )}
      </div>
    </div>
  );
}
