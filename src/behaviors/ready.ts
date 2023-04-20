import { Client } from "discord.js";

export default function ready(client:Client<true>) {
  console.log(`Logged in as ${client.user.tag}!`);
}