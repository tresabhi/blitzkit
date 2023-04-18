const CHAT_CHANNEL = "1097677884266643527";
const RULES_CHANNEL = "912486823522095114";

module.exports = (client) => {
  client.on("guildMemberAdd", (member) => {
    console.log(member);

    // const message = `Welcome <@${
    //   member.id
    // }> to Skilled! Be sure to check out our ${member.guild.channels.cache
    //   .get(RULES_CHANNEL)
    //   .toString()}`;
    const message = `Welcome <@${member.id}> to Skilled!`;

    const channel = member.guild.channels.cache.get(CHAT_CHANNEL);
    channel.send(message);
  });
};
