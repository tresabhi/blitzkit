const { faker } = require("@faker-js/faker");

const CHAT_CHANNEL = "1097677884266643527";
const RULES_CHANNEL = "912486823522095114";

module.exports = (client) => {
  client.on("guildMemberAdd", (member) => {
    member.guild.channels.cache
      .get(CHAT_CHANNEL)
      .send(
        `Welcome <@${
          member.id
        }> to Skilled! Use \`/verify <your in-game name>\` to continue.\nExample: \`/verify ${faker.internet.userName(
          undefined,
          ""
        )}\` (capitalization matters!)`
      );
  });
};
