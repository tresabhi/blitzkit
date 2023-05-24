export default function TitleBar(
  name: string,
  image: string,
  nameDiscriminator = '',
  description = '',
) {
  return `
    <style>
      .title-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .title-bar-info {
        display: flex;
        gap: 8px;
      }

      .title-bar-avatar {
        width: 64px;
        height: 64px;
      }

      .title-bar-text {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .title-bar-name {
        font-size: 32px;
        color: white;
        font-weight: 900;
      }

      .title-bar-discriminator {
        color: #A0A0A0;
      }

      .title-bar-description {
        color: #A0A0A0;
        font-size: 16px;
      }

      .title-bar-blitzkrieg {
        width: 64px;
        height: 64px;
      }
    </style>

    <div class="title-bar">
      <div class="title-bar-info">
        <img class="title-bar-avatar" src="${image}" />

        <div class="title-bar-text">
          <span class="title-bar-name">
            ${name}
            <span class="title-bar-discriminator">${nameDiscriminator}</span>
          </span>

          <span class="title-bar-description">${description}</span>
        </div>
      </div>

      <img class="title-bar-blitzkrieg" src="https://i.imgur.com/35phKIu.png" />
    </div>
  `;
}
